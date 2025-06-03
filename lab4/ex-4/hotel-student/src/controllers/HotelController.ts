// deno-lint-ignore-file no-namespace
import { Context } from "oak";
import { ReservationService } from "../services/ReservationService.ts";
import { Hotel } from "../types/Hotel.ts";

export namespace HotelController {
  export class HotelPageController {
    constructor(private reservationService: ReservationService.ReservationManager) {}

    async renderHomePage(ctx: Context): Promise<void> {
      const availableDates = this.reservationService.getAvailableDates();
      
      await ctx.render("home", {
        title: "Hotel Student",
        availableDates
      });
    }

    async renderReservationPage(ctx: Context): Promise<void> {
      const roomsWithAvailability = await this.reservationService.getRoomsWithAvailability();
      
      await ctx.render("reservation", {
        title: "Rezerwacja - Hotel Student",
        rooms: roomsWithAvailability
      });
    }

    async addReservation(ctx: Context): Promise<void> {
      const url = new URL(ctx.request.url);
      const roomNumber = parseInt(url.searchParams.get("roomNumber") || "0");
      const guestName = url.searchParams.get("guestName") || "";

      await this.reservationService.addReservation(roomNumber, guestName);
      ctx.response.redirect("/reservation");
    }

    async removeReservation(ctx: Context): Promise<void> {
      const url = new URL(ctx.request.url);
      const roomNumber = parseInt(url.searchParams.get("roomNumber") || "0");
      const guestName = url.searchParams.get("guestName") || "";

      await this.reservationService.removeReservation(roomNumber, guestName);
      ctx.response.redirect("/reservation");
    }
  }
}