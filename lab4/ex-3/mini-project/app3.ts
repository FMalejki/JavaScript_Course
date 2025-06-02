import { Application, Router, Context } from "https://deno.land/x/oak/mod.ts";
import { configure, renderFile } from "https://deno.land/x/eta@v2.0.0/mod.ts";
import { MongoClient } from "https://deno.land/x/mongo@v0.32.0/mod.ts";

configure({ views: `${Deno.cwd()}/views` });

const client = new MongoClient();

await client.connect({
  db: "AGH",
  tls: false,
  servers: [{ host: "127.0.0.1", port: 27017 }],
  credential: {
    username: "admin",
    password: "admin123",
    db: "admin",
    mechanism: "SCRAM-SHA-1",
  },
});

const db = client.database("AGH");
const studentsCollection = db.collection("students");

const router = new Router();

router.get("/:faculty", async (ctx: Context) => {
  const faculty = ctx.params.faculty;
  const studentsCursor = await studentsCollection.find({ faculty }, { noCursorTimeout: false });
  const students = await studentsCursor.toArray()
  ctx.response.body = await renderFile("students.eta", { students });
});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

console.log("Server running on http://localhost:8000");
await app.listen({ port: 8000 });
