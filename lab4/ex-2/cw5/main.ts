import { Application, Context, Router } from "jsr:@oak/oak/";
import { Eta } from "https://deno.land/x/eta/src/index.ts";
import logger from "https://deno.land/x/oak_logger/mod.ts";
import { ensureDir } from "https://deno.land/std@0.208.0/fs/mod.ts";

const PORT: number = 8000;
const DATA_DIR: string = './data';
const ENTRIES_FILE: string = './data/guestbook.json';

interface GuestEntry {
  id: number;
  name: string;
  message: string;
  timestamp: string;
}

interface TemplateData {
  entriesHtml: string;
}

function formatEntries(entries: GuestEntry[]): string {
  if (!entries || entries.length === 0) {
    return '<i>Brak wpisów.</i>';
  }
  
  return entries
    .sort((a, b) => b.id - a.id)
    .map((entry: GuestEntry) => {
      const date = new Date(entry.timestamp).toLocaleString('pl-PL');
      return `<div class="entry">
        <p><strong>${entry.name}</strong> <small>(${date})</small></p>
        <p>${entry.message}</p>
      </div>`;
    })
    .join('');
}

async function readEntries(): Promise<GuestEntry[]> {
  try {
    const data: string = await Deno.readTextFile(ENTRIES_FILE);
    const entries: GuestEntry[] = JSON.parse(data);
    return Array.isArray(entries) ? entries : [];
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return [];
    }
    console.error('Błąd podczas odczytu pliku JSON:', error);
    return [];
  }
}

async function saveEntries(entries: GuestEntry[]): Promise<boolean> {
  try {
    await ensureDir(DATA_DIR);
    
    const jsonData: string = JSON.stringify(entries, null, 2);
    await Deno.writeTextFile(ENTRIES_FILE, jsonData);
    return true;
  } catch (error) {
    console.error('Błąd podczas zapisu do pliku JSON:', error);
    return false;
  }
}

async function appendEntry(name: string, message: string): Promise<boolean> {
  try {
    const sanitizedName: string = name.trim() || 'Anonim';
    const sanitizedMessage: string = message.trim();
    
    if (!sanitizedMessage) {
      return false;
    }
    
    const entries: GuestEntry[] = await readEntries();
    
    const maxId: number = entries.length > 0 
      ? Math.max(...entries.map(entry => entry.id))
      : 0;
    
    const newEntry: GuestEntry = {
      id: maxId + 1,
      name: sanitizedName,
      message: sanitizedMessage,
      timestamp: new Date().toISOString()
    };
    
    entries.push(newEntry);
    
    return await saveEntries(entries);
  } catch (error) {
    console.error('Błąd podczas dodawania wpisu:', error);
    return false;
  }
}

function validateInput(name: string, message: string): boolean {
  const trimmedName: string = name?.trim() || '';
  const trimmedMessage: string = message?.trim() || '';
  
  return trimmedName.length > 0 && 
         trimmedMessage.length > 0 && 
         trimmedName.length <= 100 && 
         trimmedMessage.length <= 1000;
}

const app: Application = new Application();
const router: Router = new Router();
const eta: Eta = new Eta({ views: `${Deno.cwd()}/views` });

router
  .get("/", async (ctx: Context): Promise<void> => {
    try {
      const entries: GuestEntry[] = await readEntries();
      const entriesHtml: string = formatEntries(entries);
      
      const templateData: TemplateData = {
        entriesHtml: entriesHtml
      };
      
      const html: string = eta.render("./guestbook", templateData);
      ctx.response.headers.set('Content-Type', 'text/html; charset=utf-8');
      ctx.response.body = html;
    } catch (error) {
      console.error('Błąd podczas renderowania strony głównej:', error);
      ctx.response.status = 500;
      ctx.response.body = "Błąd serwera";
    }
  })
  .post("/", async (ctx: Context): Promise<void> => {
    try {
      const body = await ctx.request.body.form();
      const name: string = body.get("name") as string || "";
      const message: string = body.get("message") as string || "";

      if (!validateInput(name, message)) {
        ctx.response.status = 400;
        ctx.response.body = "Nieprawidłowe dane. Sprawdź długość pól.";
        return;
      }

      const success: boolean = await appendEntry(name, message);
      
      if (success) {
        ctx.response.redirect("/");
      } else {
        ctx.response.status = 500;
        ctx.response.body = "Błąd zapisu do pliku.";
      }
    } catch (error) {
      console.error('Błąd podczas przetwarzania formularza:', error);
      ctx.response.status = 500;
      ctx.response.body = "Błąd serwera";
    }
  })
  .get("/api/entries", async (ctx: Context): Promise<void> => {
    try {
      const entries: GuestEntry[] = await readEntries();
      ctx.response.headers.set('Content-Type', 'application/json');
      ctx.response.body = JSON.stringify(entries);
    } catch (error) {
      console.error('Błąd podczas pobierania wpisów przez API:', error);
      ctx.response.status = 500;
      ctx.response.body = JSON.stringify({ error: "Błąd serwera" });
    }
  });

router.all("/(.*)", (ctx: Context): void => {
  ctx.response.status = 404;
  ctx.response.body = "Nie znaleziono";
});

app.use(logger.logger);
app.use(logger.responseTime);
app.use(router.routes());
app.use(router.allowedMethods());

console.log(`Serwer na http://localhost:${PORT}/`);
await app.listen({ port: PORT });