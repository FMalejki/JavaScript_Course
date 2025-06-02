import { MongoClient, Database, Collection } from "mongo";
import { Hotel } from "../types/Hotel.ts";

export namespace HotelDatabase {
  export class DatabaseManager {
    private client: MongoClient;
    private db?: Database;
    private roomsCollection?: Collection<Hotel.Room>;
    private reservationsCollection?: Collection<Hotel.Reservation>;
    private dbName?: String;

    constructor(connectionString: string, dbName: string) {
      this.client = new MongoClient();
      this.dbName = dbName;
    }

    async connect(): Promise<void> {
      try {
        await this.client.connect({
            db: "Hotel-Student",
            tls: false,
            servers: [{ host: "127.0.0.1", port: 27017 }],
            credential: {
                username: "admin",
                password: "admin123",
                db: "admin",
                mechanism: "SCRAM-SHA-1",
            },
            });
        console.log("Connected to MongoDB");

        this.db = this.client.database(this.dbName);
        this.roomsCollection = this.db.collection<Hotel.Room>("rooms");
        this.reservationsCollection = this.db.collection<Hotel.Reservation>("reservations");
        await this.initializeData();
      } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
        throw error;
      }
    }

    async disconnect(): Promise<void> {
      await this.client.close();
    }

    private async initializeData(): Promise<void> {
      const roomCount = await this.roomsCollection.countDocuments();
      
      if (roomCount === 0) {
        const initialRooms: Hotel.Room[] = [
          { number: 101, capacity: 2, type: Hotel.RoomType.ECONOMY, price: 50 },
          { number: 102, capacity: 3, type: Hotel.RoomType.STANDARD, price: 80 },
          { number: 103, capacity: 1, type: Hotel.RoomType.ECONOMY, price: 50 }
        ];

        await this.roomsCollection.insertMany(initialRooms);
        console.log("Initial rooms data inserted");
      }
    }

    async getAllRooms(): Promise<Hotel.Room[]> {
      return await this.roomsCollection.find({}).toArray();
    }

    async getRoomByNumber(roomNumber: number): Promise<Hotel.Room | null> {
      return await this.roomsCollection.findOne({ number: roomNumber });
    }

    async getAllReservations(): Promise<Hotel.Reservation[]> {
      return await this.reservationsCollection.find({}).toArray();
    }

    async getReservationsByRoom(roomNumber: number): Promise<Hotel.Reservation[]> {
      return await this.reservationsCollection.find({ roomNumber }).toArray();
    }

    async addReservation(reservation: Omit<Hotel.Reservation, '_id'>): Promise<string> {
      const result = await this.reservationsCollection.insertOne({
        ...reservation,
        createdAt: new Date()
      });
      return result.toString();
    }

    async removeReservation(roomNumber: number, guestName: string): Promise<boolean> {
      const result = await this.reservationsCollection.deleteOne({
        roomNumber,
        guestName
      });
      return result > 0;
    }
  }
}