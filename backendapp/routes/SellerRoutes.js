const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/SellerController');

router.post('/addproduct', sellerController.addProduct);
router.get('/getproducts/:id', sellerController.getProducts);
router.put('/updateproduct/:id', sellerController.updateProduct);
router.get("/fetchorders/:sellerId",sellerController.getOrders);
router.patch("/updatestatus",sellerController.updateOrderStatus);
router.get("/logistics/:orderId",sellerController.getLogisticDetails);
router.put("/updatepassword/:sellerId",sellerController.updatePassword);
router.get("/dashboard/:sellerId",sellerController.getDashboardStats);


module.exports = router;