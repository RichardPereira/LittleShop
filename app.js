const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');
const userRoutes = require('./api/routes/user');

//Change Headers to access all access to client
// prevent CORS ERRORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); //allow everyone * origin
    res.header("Access-Control-Allow-Headers",
                "Origin, X-Requested-With, Content-Type, Accept, Authorization"
                );
    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods','PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

const opts = {
    replicaSet: 'node-shop-shard-0',
    ssl:true,
    retryWrites:true,
    authSource:'admin'
};

var uri = 'mongodb://nodeshop:'+process.env.MONGO_ATLAS_PW+'@node-shop-shard-00-00-imm0q.mongodb.net:27017,node-shop-shard-00-01-imm0q.mongodb.net:27017,node-shop-shard-00-02-imm0q.mongodb.net:27017/node-shop';
mongoose.connect(uri,opts);

mongoose.Promise = global.Promise;

app.use(morgan('dev'));
app.use('/upload',express.static('upload')); // make the folder upload public to everyone

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json()); // extrac json data and make easy to read



//routes which should handle requests
app.use('/products', productRoutes); // send it to the file
app.use('/orders',orderRoutes);
app.use('/user',userRoutes);

//if route not found then default handle error
app.use((req,res,next) =>{
    const error = new Error('Not found');
    error.status = 400;
    next(error)
});

//message to display costume error 
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error:{
            message: error.message
        }
    });
});

module.exports = app;