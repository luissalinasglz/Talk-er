import mongoose from "mongoose";
import { MONGO_URI } from "../config/index.js";

export async function connectMongo() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("MongoDB conectado");
    } catch (err) {
        console.error("Error conectando a MongoDB:", err);
        process.exit(1);
    }
}
