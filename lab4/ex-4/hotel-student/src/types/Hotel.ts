// deno-lint-ignore-file no-namespace
export namespace Hotel {
  export interface Room {
    _id?: string;
    number: number;
    capacity: number;
    type: RoomType;
    price: number;
  }

  export interface Reservation {
    _id?: string;
    roomNumber: number;
    guestName: string;
    createdAt: Date;
  }

  export interface RoomWithAvailability extends Room {
    availableSpots: number;
    guests: string[];
  }

  export enum RoomType {
    ECONOMY = "Ekonomiczny",
    STANDARD = "Standard"
  }

  export interface AvailableDate {
    month: string;
    days: string;
  }

  export interface ReservationResult {
    success: boolean;
    message: string;
  }
}