import mongoose from "mongoose";

const CartItemSchema  = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    product: {
  type: String,   // Accept string product ID for both dummy and backend
  required: true
},



    quantity: {
        type: Number,
        default: 1,
        min: 1
    }
},
{
    timestamps: true
}
)
export const CartItem = mongoose.models.CartItem || mongoose.model('CartItem', CartItemSchema);
 