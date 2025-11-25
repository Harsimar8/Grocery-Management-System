

import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser";
import 'dotenv/config';

import { connectDB } from './config/db.js';
import userRouter from './routes/userRoutes.js';
import itemRouter from './routes/productRoute.js';
import authMiddleware from './middleware/auth.js';
import cartRouter from './routes/cartRoute.js';
import orderrouter from './routes/orderRoute.js';
import paymentRouter from "./routes/paymentRoute.js";

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/users', userRouter);
app.use('/api/cart', authMiddleware, cartRouter);
app.use('/uploads', express.static('public/uploads'));
app.use('/api/items', itemRouter);
app.use('/api/orders', orderrouter);
app.use("/api/payments", paymentRouter);

app.get('/', (req, res) => {
  res.send('API is WORKING...');
});

// Start Server Only After DB Connects
const startServer = async () => {
  try {
    await connectDB();
    console.log("MongoDB connected");

    app.listen(port, () => {
      console.log(`🚀 Server started on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("❌ DB Connection Failed:", error.message);
    process.exit(1);
  }
};

startServer();

