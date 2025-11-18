 import express from 'express';
 import cors from 'cors';
 import path, { dirname } from 'path';
 import 'dotenv/config';

 

 import 'dotenv/config';
 import { connectDB } from './config/db.js';
 import userRouter from './routes/userRoutes.js';
import itemRouter from './routes/productRoute.js';
import authMiddleware from './middleware/auth.js';
import cartRouter from './routes/cartRoute.js';
import orderrouter from './routes/orderRoute.js';
import cookieParser from "cookie-parser";


 const app = express();
 const port = process.env.PORT || 4000;

 //MIDDLEWARE

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

    connectDB();
    //ROUTES

    app.use('/api/users', userRouter);
    app.use('/api/cart',authMiddleware,cartRouter);
    app.use('/uploads', express.static('public/uploads'));
    app.use('/api/items',itemRouter);
    app.use('/api/orders',orderrouter);

        app.get('/',(req,res) => {
            res.send('API is WORKING...');
        })

        app.listen(port, () => {
            console.log(`Server started on http://localhost:${port}`);
        }
        )
