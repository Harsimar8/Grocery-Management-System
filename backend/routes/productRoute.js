import express from "express";
import multer from "multer";

import { getProducts, createProduct, deleteProduct } from "../controllers/productController.js";

const itemRouter = express.Router();
function dateNow() {
    return Date.now();
}

//MULTER SETUP
const storage = multer.diskStorage({
    destination: function (_req, _file, cb){
        cb(null, 'public/uploads/');
},
        filename: function(_req, file, cb) {
            cb(null, `${dateNow()}-${file.originalname}`);
}
    });
    const upload = multer({storage})

    //ROUTES
    itemRouter.get('/',getProducts)
    itemRouter.post('/',upload.single('image'),createProduct)
    itemRouter.delete('/:id',deleteProduct)

    export default itemRouter;