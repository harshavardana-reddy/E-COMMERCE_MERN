const express = require('express');
const router = express.Router();
const adminController = require('../controllers/AdminController');

const {verifytoken , authorize} = require('../utils/jwt/Auth');

router.post('/addseller', [verifytoken,authorize('admin'),adminController.addSeller]);
router.get('/getsellers', [verifytoken,authorize('admin'),adminController.getAllSellers]);
router.get('/getusers', [verifytoken,authorize('admin'),adminController.getAllUsers]);
router.put('/updateseller/:id',[ verifytoken,authorize('admin'),adminController.updateSeller]);
router.get('/getproducts', [verifytoken,authorize('admin'),adminController.getProducts]);
router.get('/getpayments', [verifytoken,authorize('admin'),adminController.getPayments]);
router.get('/getorders', [verifytoken,authorize('admin'),adminController.getOrders]);
router.get('/getseller/:id', [verifytoken,authorize('admin'),adminController.getSellerByID]);
router.get('/dashboard',[verifytoken,authorize('admin'),adminController.getDashboardStats]);


module.exports = router;