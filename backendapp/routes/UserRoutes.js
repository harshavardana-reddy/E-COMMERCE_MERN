const router = require('express').Router();
const userController = require('../controllers/UserController');

router.post('/buyNow/:id', userController.buyNow);
router.post('/verifyPayment', userController.verifyOrderPayment);
router.post('/buyfromcart/:id', userController.buyFromCart);
router.get('/getProduct/:id', userController.getProduct);
router.get('/getSeller/:id', userController.getSeller);
router.post('/addtocart/:userId', userController.addToCart);
router.get('/fetchcart/:userId',userController.fetchCart);
router.put('/updatecart/:userId/:productId',userController.updateCartItem);
router.delete('/deletecartitem/:userId/:productId',userController.removeFromCart);
router.post('/makepayment',userController.paymentController.initiatePayment);
router.post('/verifyorder',userController.paymentController.verifyPayment);
router.post('/paymentfailed',userController.paymentController.handlePaymentFailure);
router.post('/paywithcod',userController.makeCOD);
router.delete('/clearcart/',userController.clearCart);
router.get('/fetchorders/:userId',userController.getOrders);
router.get('/fetchorderbyid/:userId/:id',userController.getOrderById);
router.get('/logistics/:orderId',userController.getLogisticDetails);
router.put('/updateprofile/:userId',userController.updateProfile);
router.put('/updatepassword/:userId',userController.updatePassword);
router.get('/dashboard/:userId',userController.getUserDashboardStats);

module.exports = router;