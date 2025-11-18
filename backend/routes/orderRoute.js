import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { confirmPayment, createOrder, deleteOrder, getOrderById, getOrders, updateOrder } from '../controllers/orderController.js';


const orderrouter = express.Router();

// PROTECTED ROUTES
orderrouter.post('/', authMiddleware, createOrder);
orderrouter.get('/confirm', confirmPayment);

//PUBLIC ROUTES
orderrouter.get('/', getOrders);
orderrouter.get('/:id', getOrderById);
orderrouter.put('/:id', updateOrder);
orderrouter.delete('/:id', deleteOrder);

export default orderrouter;

