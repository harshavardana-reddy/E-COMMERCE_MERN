const express = require('express');
const router = express.Router();
const adminController = require('../controllers/AdminController');

router.post('/addseller', adminController.addSeller);
router.get('/getsellers', adminController.getAllSellers);
router.get('/getusers', adminController.getAllUsers);
router.put('/updateseller/:id', adminController.updateSeller);
router.get('/getproducts', adminController.getProducts);
router.get('/getpayments', adminController.getPayments);
router.get('/getorders', adminController.getOrders);
router.get('/getseller/:id', adminController.getSellerByID);
router.get('/dashboard',adminController.getDashboardStats);


module.exports = router;