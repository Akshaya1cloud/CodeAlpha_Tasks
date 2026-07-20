const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
    addProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
} = require("../controllers/productController");

router
    .route("/")
    .post(protect, addProduct)
    .get(getProducts);

router
    .route("/:id")
    .get(getProductById)      // <-- REMOVE protect HERE
    .put(protect, updateProduct)
    .delete(protect, deleteProduct);

module.exports = router;