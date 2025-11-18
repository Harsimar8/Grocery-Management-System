

import { CartItem } from "../models/cartModel.js";
import pkg from "http-errors";
import mongoose from "mongoose";
const { createError } = pkg;



// ✅ GET CART ITEMS
export const getCart = async (req, res, next) => {
  try {
    

    let items = await CartItem.find({ user: req.user._id });



    const formatted = items.map((ci) => ({
  id: ci._id.toString(),
  product: ci.product,
  quantity: ci.quantity,
}));


    res.json(formatted);
  } catch (err) {
    console.error("❌ Error fetching cart:", err.message);
    next(err);
  }
};


  export const addToCart = async (req, res, next) => {
  try {
    const { productId, itemId, quantity } = req.body;
    const pid = productId || itemId;

    if (!pid || typeof quantity !== "number") {
      throw createError(400, "Product identifier and quantity are required");
    }

    let cartItem = await CartItem.findOne({ user: req.user._id, product: pid });

    if (cartItem) {
      cartItem.quantity = Math.max(1, cartItem.quantity + quantity);
      await cartItem.save();

      return res.status(200).json({
        id: cartItem._id.toString(),
        product: cartItem.product,
        quantity: cartItem.quantity,
      });
    }

    cartItem = await CartItem.create({
      user: req.user._id,
      product: pid,
      quantity: Math.max(1, quantity),
    });

    res.status(201).json({
      id: cartItem._id.toString(),
      product: cartItem.product,
      quantity: cartItem.quantity,
    });

  } catch (err) {
    console.error("❌ Error adding to cart:", err.message);
    next(err);
  }
};


export const updateCartItems = async (req, res, next) => {
  try {
    const { quantity } = req.body;

    const cartItem = await CartItem.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!cartItem) throw createError(404, "Cart item not found");

    cartItem.quantity = Math.max(1, quantity);
    await cartItem.save();

    res.json({
      id: cartItem._id.toString(),
      product: cartItem.product,
      quantity: cartItem.quantity,
    });

  } catch (err) {
    next(err);
  }
};

// ✅ DELETE CART ITEM
export const deleteCartItem = async (req, res, next) => {
  try {
    const cartItem = await CartItem.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!cartItem) throw createError(404, "Cart item not found");

    await cartItem.deleteOne();
    res.json({ message: 'Item deleted', id: req.params.id })

  } catch (err) {
    next(err);
  }
};

// ✅ CLEAR CART
export const clearCart = async (req, res, next) => {
  try {
    await CartItem.deleteMany({ user: req.user._id });
    res.json({ message: "Cart Cleared" });
  } catch (err) {
    next(err);
  }
};
