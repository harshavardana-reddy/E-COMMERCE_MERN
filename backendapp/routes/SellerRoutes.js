const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/SellerController');

const {verifytoken , authorize} = require('../utils/jwt/Auth');

router.post('/addproduct', [verifytoken,authorize("seller"),sellerController.addProduct]);
router.get('/getproducts/:id', [verifytoken,authorize("seller"),sellerController.getProducts]);
router.put('/updateproduct/:id', [verifytoken,authorize("seller"),sellerController.updateProduct]);
router.get("/fetchorders/:sellerId",[verifytoken,authorize("seller"),sellerController.getOrders]);
router.patch("/updatestatus",[verifytoken,authorize("seller"),sellerController.updateOrderStatus]);
router.get("/logistics/:orderId",[verifytoken,authorize("seller"),sellerController.getLogisticDetails]);
router.put("/updatepassword/:sellerId",[verifytoken,authorize("seller"),sellerController.updatePassword]);
router.get("/dashboard/:sellerId",[verifytoken,authorize("seller"),sellerController.getDashboardStats]);


module.exports = router;