 require('dotenv').config();
 const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI )
.then(() => console.log('Mongo connected'))
.catch(err=> console.error(err));

const app = express();

// middleware 
app.use(cors({origin:process.env.CLIENT_URL|| '*'}));
app.use(express.json());
app.use('/api/auth', require('./routes/auth'));




app.get('/health', (req,res)=>res.send('ok'));


app.post('/api/webhooks/telegram', (req,res)=>{
    console.log('Telegram update:', JSON.stringify(req.body,null,2));
    res.sendStatus(200);
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=>console.log(`Server is running on port ${PORT}`));
