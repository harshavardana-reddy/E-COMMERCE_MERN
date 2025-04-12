const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { checkLogin, register } = require('./controllers/MainController');
const dotenv = require('dotenv').config();
const adminRoutes = require('./routes/AdminRoutes');
const sellerRoutes = require('./routes/SellerRoutes');
const userRoutes = require('./routes/UserRoutes');

const app = express();


app.use(express.json({ limit:"50mb" }));
app.use(cors());

const PORT = process.env.PORT;
const MONGO_URI = process.env.DB_URI_ATLAS;

mongoose.connect(MONGO_URI)
.then(() => console.log('\x1b[32mDatabase connected Successfully'))
.catch(err => console.error('\x1b[31mMongoDB connection error: ', err.message));

app.get('/',async(req,res)=>{
    res.send('Welcome to the E-commerce API');
})
//Main Controller
app.post('/login',checkLogin);
app.post('/register',register);

// Admin Routes
app.use('/admin',adminRoutes);

// Seller Routes
app.use('/seller',sellerRoutes);

//User Routes
app.use('/user',userRoutes);


app.get('*' , (req , res)=>{
    res.send('Page Not Found');
})
app.listen(PORT,()=>{
    console.log(`\x1b[34mServer is running on port ${PORT}`);
})