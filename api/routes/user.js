const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

router.post('/signup', (req, res, next) => {
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length >= 1) { //check if email already in DB
                return res.status(409).json({
                    message: 'Email already register'
                });
            } else { // If email no in DB then register new User
                bcrypt.hash(req.body.password, 10, (err, hash) => {     //bcrypt can reverser to text
                    if (err) {
                        return res.status(500).json({
                            error: err
                        });
                    } else {  //if not error then insert to the DB
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            email: req.body.email,
                            password: hash //value
                        });
                        user
                            .save()
                            .then(resutl => {
                                console.log(resutl);
                                res.status(200).json({
                                    message: 'User created'
                                });
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(500).json({
                                    error: err
                                });
                            });
                    }
                });

            }
        })
});

router.post('/login', (req, res, next) => {
    User.find({ email: req.body.email })
        .exec()
        .then(user => {     // Array wiith One user
            if (user.length < 1) //no Users
            {
                return res.status(401).json({
                    message: 'Auth failed'
                });
            } //else we have one user
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: 'Auth falied'
                    });
                }
                if (result) { // valid
                   const token =  jwt.sign(
                        {
                         email:     user[0].email,
                         userId:    user[0]._id
                        },
                     'danceOfDragons', //Secret KEy //process.env.jWT_KEY Dont work find issue
                    {                   //options
                        expiresIn: "1h"
                    }
                 );
                    return res.status(200).json({
                        message: 'Auth successful',
                        token: token
                    });
                } //password incorrect
                res.status(401).json({
                    message: 'Auth falied'
                });
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.delete('/:userId', (req, res, next) => {

    User.remove({ _id: req.params.userId })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'user deleted'
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });

});

module.exports = router;