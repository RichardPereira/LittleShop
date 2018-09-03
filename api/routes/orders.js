const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/orders');
const Product = require('../models/product');

/**
 * Handle incoming GET requests to /orders 
 */
router.get('/', (req, res, next) => {
    Order.find()
        .select('product quantity _id')
        .populate('product','name') // merge result to Product
        .exec()
        .then(docs => {
            res.status(200).json({
                count: docs.length,
                orders: docs.map(doc => {
                    return {
                        _id: doc._id,
                        product: doc.product,
                        quantity: doc.quantity,
                        request: {
                            Type: 'GET',
                            url: 'http://localhost:3000/order/' + doc._id
                        }
                    }
                })
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
});

/**
 * Handle incoming GET requests to /orders/< id of order> given a order ID
 */
router.get('/:orderId', (req, res, next) => {
    Order.findById(req.params.orderId)
         .populate('product')
        .exec()
        .then(order => {
            if(!order){
                res.status(404).json({
                    message: 'Order not found'
                });
            }
            res.status(200).json({
                order: order,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/order/'
                }
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
});


/**
 * Handle incoming POST requests
 * Require: order in advance
 */
router.post('/', (req, res, next) => {

    //only Order to product previous created
    Product.findById(req.body.productId)
        .then(product => {
            if (!product)     // if product exist then can order
            {
                return res.status(404).json({
                    message: 'Product not found'
                });
            }
            const order = new Order({
                _id: mongoose.Types.ObjectId(),
                quantity: req.body.quantity,
                product: req.body.productId
            });
            return order
                .save() // by default exec promise
        })
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: 'Order Store',
                createOrder: {
                    _id: result._id,
                    product: result.product,
                    quantity: result.quantity
                },
                request: {
                    Type: 'GET',
                    url: 'http://localhost:3000/order/' + result._id
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });

});



/**
 * Handle incoming DELETE requests given the ID of the Order
 * Require: order in advance
 */
router.delete('/:orderId', (req, res, next) => {
    Order.remove({ _id: req.params.orderId })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Order deleted',
                request: {
                    type: 'POST',
                    url: 'http://localhost:3000/order/',
                    body: { productId: 'ID', quantity: 'Number'}
                }
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
});

module.exports = router;