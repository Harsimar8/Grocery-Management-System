import mongoose from "mongoose";

export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://harsimark647:harsimar@cluster0.mqfo1z1.mongodb.net/RushBasket')
    .then(() => 
        console.log("MongoDB connected"))
    }
