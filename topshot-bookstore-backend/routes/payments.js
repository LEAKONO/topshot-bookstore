const express = require('express');
const { body } = require('express-validator');
const paymentController = require('../controllers/paymentController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/pesapal',
  [
    auth,
    body('orderId')
      .notEmpty().withMessage('Order ID is required')
      .isMongoId().withMessage('Invalid Order ID format')
  ],
  paymentController.initiatePesapalPayment
);

router.get('/pesapal/callback', paymentController.pesapalCallback);

router.post('/pesapal/ipn', paymentController.pesapalIPN);

module.exports = router;
