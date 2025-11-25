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
export const createProduct = async (req, res) => {
    try {
        const { name, description, category, oldPrice, price } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: "Image is required" });
        }

        const imageUrl = `/uploads/${req.file.filename}`;

        const newProduct = new Product({
            name,
            description,
            category,
            oldPrice,
            price,
            imageUrl
        });

        await newProduct.save();

        res.status(201).json({
            message: "Product added successfully",
            product: newProduct
        });

    } catch (error) {
        console.error("CREATE PRODUCT ERROR:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

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