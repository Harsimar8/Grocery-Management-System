import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { addToCart,getCart, updateCartItems, deleteCartItem , clearCart} from '../controllers/cartController.js';

const cartRouter = express.Router();
cartRouter.use(authMiddleware);

cartRouter.get('/',getCart);
cartRouter.post('/',addToCart);
cartRouter.put('/:id',updateCartItems);
cartRouter.delete('/:id', deleteCartItem);
cartRouter.post('/clear',clearCart);

export default cartRouter;

