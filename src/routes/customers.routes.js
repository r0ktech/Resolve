const express = require('express');
const router = express.Router();
const custController = require('../controllers/customers.controller');
const { verifyAuth } = require('../middleware/auth');

router.use(verifyAuth);

router.get('/', custController.getCustomers);
router.get('/:id', custController.getCustomerById);

module.exports = router;
