const mongoose = require('mongoose');
module.exports = mongoose.model('User', new mongoose.Schema({
   userId:{
    type: mongoose.Types.ObjectId, ref :'User'
   },
   provider:{type:String, enum:['telegram', 'slack','discord','whatsapp'] },
   accesstoken:String,
   botToken:String,
   metadata:Object,


}, {timestamps:true}));
