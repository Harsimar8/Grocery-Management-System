import express from 'express';
import authMiddleware, { clearCart } from '../controllers/cartController.js';
import { addToCart,getCart, updateCartItems } from '../controllers/cartController.js';


const cartRouter = express.Router();
cartRouter.use(authMiddleware);

cartRouter.get('/',getCart);
cartRouter.post('/',addToCart);
cartRouter.put('/:id',updateCartItems);
cartRouter.delete('/:id',deleteCartItems);
cartRouter.post('/clear',clearCart);

export default cartRouter;

