const router = require('express').Router();
const userController = require('../controllers/UserController');
const {verifytoken , authorize} = require('../utils/jwt/Auth');

router.get('/getproducts',[verifytoken,authorize("user"),userController.getProducts]);
router.post('/buyNow/:id', [verifytoken,authorize("user"),userController.buyNow]);
router.post('/verifyPayment', [verifytoken,authorize("user"),userController.verifyOrderPayment]);
router.post('/buyfromcart/:id', [verifytoken,authorize("user"),userController.buyFromCart]);
router.get('/getProduct/:id', [verifytoken,authorize("user"),userController.getProduct]);
router.get('/getSeller/:id', [verifytoken,authorize("user"),userController.getSeller]);
router.post('/addtocart/:userId', [verifytoken,authorize("user"),userController.addToCart]);
router.get('/fetchcart/:userId',[verifytoken,authorize("user"),userController.fetchCart]);
router.put('/updatecart/:userId/:productId',[verifytoken,authorize("user"),userController.updateCartItem]);
router.delete('/deletecartitem/:userId/:productId',[verifytoken,authorize("user"),userController.removeFromCart]);
router.post('/makepayment',[verifytoken,authorize("user"),userController.paymentController.initiatePayment]);
router.post('/verifyorder',[verifytoken,authorize("user"),userController.paymentController.verifyPayment]);
router.post('/paymentfailed',[verifytoken,authorize("user"),userController.paymentController.handlePaymentFailure]);
router.post('/paywithcod',[verifytoken,authorize("user"),userController.makeCOD]);
router.delete('/clearcart/',[verifytoken,authorize("user"),userController.clearCart]);
router.get('/fetchorders/:userId',[verifytoken,authorize("user"),userController.getOrders]);
router.get('/fetchorderbyid/:userId/:id',[verifytoken,authorize("user"),userController.getOrderById]);
router.get('/logistics/:orderId',[verifytoken,authorize("user"),userController.getLogisticDetails]);
router.put('/updateprofile/:userId',[verifytoken,authorize("user"),userController.updateProfile]);
router.put('/updatepassword/:userId',[verifytoken,authorize("user"),userController.updatePassword]);
router.get('/dashboard/:userId',[verifytoken,authorize("user"),userController.getUserDashboardStats]);

module.exports = router;