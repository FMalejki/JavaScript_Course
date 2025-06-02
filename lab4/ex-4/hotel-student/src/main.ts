import { Application, Router } from "oak";
import { Eta } from "eta";
import { HotelDatabase } from "./database/Database.ts";
import { ReservationService } from "./services/ReservationService.ts";
import { HotelController } from "./controllers/HotelController.ts";

class HotelApplication {
  private app: Application;
  private router: Router;
  private db: HotelDatabase.DatabaseManager;
  private reservationService: ReservationService.ReservationManager;
  private controller: HotelController.HotelPageController;
  private eta: Eta;

  constructor() {
    this.app = new Application();
    this.router = new Router();
    this.db = new HotelDatabase.DatabaseManager("mongodb://localhost:27017", "Hotel-Student");
    this.reservationService = new ReservationService.ReservationManager(this.db);
    this.controller = new HotelController.HotelPageController(this.reservationService);
    this.eta = new Eta({ views: "./views", cache: false });
    
    this.setupRoutes();
    this.setupMiddleware();
  }

  private setupRoutes(): void {
    this.router.get("/", (ctx) => this.controller.renderHomePage(ctx));
    this.router.get("/reservation", (ctx) => this.controller.renderReservationPage(ctx));
    this.router.get("/addReservation", (ctx) => this.controller.addReservation(ctx));
    this.router.get("/removeReservation", (ctx) => this.controller.removeReservation(ctx));
    
    // Static files
    this.router.get("/static/(.*)", async (ctx) => {
      await ctx.send({
        root: `${Deno.cwd()}/static`,
        path: ctx.params[0]
      });
    });
  }

  private setupMiddleware(): void {
    // Add Eta rendering capability to context
    this.app.use(async (ctx, next) => {
      ctx.render = async (template: string, data: any = {}) => {
        const html = await this.eta.render(template, data);
        ctx.response.headers.set("Content-Type", "text/html");
        ctx.response.body = html;
      };
      await next();
    });

    this.app.use(this.router.routes());
    this.app.use(this.router.allowedMethods());

    // 404 handler
    this.app.use((ctx) => {
      ctx.response.status = 404;
      ctx.response.body = `
        <html>
          <head><title>404 - Not Found</title></head>
          <body>
            <h1>404 - Not Found</h1>
            <p>The page you are looking for does not exist.</p>
            <a href="/">Go back to home page</a>
          </body>
        </html>
      `;
    });
  }

  async start(port: number = 3000): Promise<void> {
    try {
      await this.db.connect();
      
      console.log(`Server is running on http://localhost:${port}`);
      await this.app.listen({ port });
    } catch (error) {
      console.error("Failed to start server:", error);
      await this.db.disconnect();
    }
  }

  async shutdown(): Promise<void> {
    await this.db.disconnect();
  }
}

// Start the application
const app = new HotelApplication();

// Graceful shutdown
const handleShutdown = async () => {
  console.log("\nShutting down gracefully...");
  await app.shutdown();
  Deno.exit(0);
};

Deno.addSignalListener("SIGINT", handleShutdown);
Deno.addSignalListener("SIGTERM", handleShutdown);

await app.start(3000);