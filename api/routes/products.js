const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');

const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, './upload/')
    },
    filename: function (req, file, cb) {
        const date = new Date();
        const dateiso = date.toISOString();

        cb(null, file.originalname); //date + filename down work
    }
});

const fileFilter = (req, file, cb) => {

    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true); //save it
    } else {
        cb(null, false); //reject a file
    }
};
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 //5mb
    },
    fileFilter: fileFilter
});



const Product = require('../models/product');

/**
 * Public Method
 */
router.get('/', (req, res, next) => {
    Product.find()
        .select('name price _id, productImage')
        .exec()
        .then(docs => {
            const responde = {
                count: docs.length,
                products: docs.map(doc => {
                    return {
                        name: doc.name,
                        price: doc.price,
                        productImage: doc.productImage,
                        _id: doc._id,
                        request: {
                            Types: 'GET', // URL to get more information 
                            url: 'http://localhost:3000/products/' + doc._id
                        }
                    }
                })
            };
            if (docs.length >= 0) {
                res.status(200).json(responde);
            } else {
                res.status(404).json({
                    mesage: 'No entry found'
                })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

/**
 * Post method
 * Require CheckAuth tourht a middleware
 */
router.post('/',upload.single('productImage'),checkAuth, (req, res, next) => {
    console.log(req.file);
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path
    });
    product
        .save()
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: "Created product sucessfully",
                createProduct: {
                    name: result.name,
                    price: result.price,
                    _id: result._id,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/products/' + result._id
                    }
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        })
});

/**
 * Pucblic Method
 */
router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
        .select('name price _id productImage')
        .exec()
        .then(doc => {
            console.log("from database", doc);
            if (doc) {
                res.status(200).json({
                    product: doc,
                    request: {
                        type: 'GET',
                        descrition: 'Get all products',
                        url: 'http://localhost:3000/products'
                    }
                });
            } else {
                res.status(404)
                    .json({ message: 'No valid entre found for provided ID' });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});

router.patch('/:productId', (req, res, next) => {
    const id = req.params.productId;
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    Product.update({ _id: id }, { $set: updateOps })
        .exec()
        .then(result => {
            console.log(result);
            res.status(200).json({
                mesage: 'Product update',
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/products/' + id

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

router.delete('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.remove({ _id: id })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Product deleted',
                request: {
                    type: 'POST',
                    url: 'http://localhost:3000/products/',
                    body: { name: 'String', price: 'Number' }
                }
            });
        })
        .catch(err => {
            console.log(err);
            rest.status(500).json({
                error: err
            });
        });
});

module.exports = router;