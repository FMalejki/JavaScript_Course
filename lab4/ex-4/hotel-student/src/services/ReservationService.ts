import { Hotel } from "../types/Hotel.ts";
import { HotelDatabase } from "../database/Database.ts";

export namespace ReservationService {
  export class ReservationManager {
    constructor(private db: HotelDatabase.DatabaseManager) {}

    async getRoomsWithAvailability(): Promise<Hotel.RoomWithAvailability[]> {
      const rooms = await this.db.getAllRooms();
      const reservations = await this.db.getAllReservations();

      return rooms.map(room => {
        const roomReservations = reservations.filter(r => r.roomNumber === room.number);
        const availableSpots = room.capacity - roomReservations.length;
        const guests = roomReservations.map(r => r.guestName);

        return {
          ...room,
          availableSpots,
          guests
        };
      });
    }

    async addReservation(roomNumber: number, guestName: string): Promise<Hotel.ReservationResult> {
      if (!guestName || guestName.trim() === '') {
        return { success: false, message: 'Proszę podać nazwisko gościa' };
      }

      const room = await this.db.getRoomByNumber(roomNumber);
      if (!room) {
        return { success: false, message: `Pokój ${roomNumber} nie istnieje.` };
      }

      const roomReservations = await this.db.getReservationsByRoom(roomNumber);
      if (roomReservations.length >= room.capacity) {
        return { success: false, message: `Pokój ${roomNumber} jest już w pełni zarezerwowany.` };
      }

      await this.db.addReservation({ roomNumber, guestName, createdAt: new Date() });
      return { success: true, message: `Pokój ${roomNumber} został zarezerwowany dla ${guestName}.` };
    }

    async removeReservation(roomNumber: number, guestName: string): Promise<Hotel.ReservationResult> {
      const success = await this.db.removeReservation(roomNumber, guestName);
      
      if (!success) {
        return { success: false, message: `Nie znaleziono rezerwacji dla gościa: ${guestName} w pokoju ${roomNumber}` };
      }

      return { success: true, message: `Rezerwacja dla ${guestName} w pokoju ${roomNumber} została usunięta.` };
    }

    getAvailableDates(): Hotel.AvailableDate[] {
      return [
        { month: 'VII', days: '14-21, 30-31' },
        { month: 'VIII', days: '1-12' }
      ];
    }
  }
}