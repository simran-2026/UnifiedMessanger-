const mongoose = require('mongoose');
module.export = mongoose.model ('Thread' , new mongoose.Schema ({userId:{
    type: mongoose.Types.ObjectId,
    ref :'User'},
    provider :String,
    providerThreadId:String,
    title:String,
    lastMessageAt: Date,

}, {timestamps:true}));
