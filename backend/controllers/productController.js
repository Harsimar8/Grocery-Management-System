import e from "express";
import { Product } from "../models/ProductModel.js";

export const getProducts = async (req, res, next) => {
    try{
        const products = await Product.find().sort({ createdAt: -1 });
        res.status(200).json(products);

    }
    catch(err){
        next(err);
    }
}
//CREATE A PRODUCT
export const createProduct = async (req, res, next) => {
    try{
        const filename = req.file?.filename ?? null;
        const imageUrl = filename ? `/uploads/${filename}` : '';
        const { name, description, category, olderPrice, price } = req.body;

        const product = await Product.create({
            name,
            description,
            category,
            olderPrice : Number(olderPrice),
            price : Number(price),
            imageUrl,
        });
        res.status(201).json(product);
    }
    catch(error){
        next(error);
    }
}

    //UPDATE A PRODUCTDELETE A PRODUCT BY ID
    export const deleteProduct = async (req, res, next) => {
        try{
            const deleted = await Product.findByIdAndDelete(req.params.id);
            if(!deleted){
                res.status(404)
                throw new Error('Product Not Found');
            }
            res.json({ message: 'Product Removed' })
        }
        catch(err){
            next(err);
        }
}