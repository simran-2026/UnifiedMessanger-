require('dotenv').config();
 const express = require('express');
const cors = require('cors');
const Thread  =require('./models/Thread');
const Message = require('./models/Message');







const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI )
.then(() => console.log('Mongo connected'))
.catch(err=> console.error(err));

const app = express();

// middleware 
app.use(cors({origin:process.env.CLIENT_URL|| '*'}));
app.use(express.json());
app.use('/api/auth', require('./routes/auth'));
app.use('/api/app', require('./routes/app'));



app.get('/health', (req,res)=>res.send('ok'));


app.post('/api/webhooks/telegram', (req,res)=>{
    console.log('Telegram update:', JSON.stringify(req.body,null,2));
    res.sendStatus(200);
});
 


app.post('/api/webhooks/telegram', async (req,res)=>{
  const update = req.body;
  const msg = update.message || update.edited_message;
  if(!msg || !msg.text){ return res.sendStatus(200); }

  const demoUserId = process.env.DEMO_USER_ID;       // for now we map all to one user
  const provider = 'telegram';
  const providerThreadId = String(msg.chat.id);
  const providerMessageId = String(msg.message_id);

  // upsert thread
  let thread = await Thread.findOne({ userId: demoUserId, provider, providerThreadId });
  if(!thread){
    thread = await Thread.create({
      userId: demoUserId,
      provider,
      providerThreadId,
      title: msg.chat.title || msg.chat.username || `${msg.chat.first_name||''} ${msg.chat.last_name||''}`.trim(),
      lastMessageAt: new Date(msg.date*1000)
    });
  }

  // save message (ignore duplicate errors)
  try {
    await Message.create({
      userId: demoUserId,
      provider,
      providerMessageId,
      threadId: thread._id,
      direction: 'in',
      senderName: msg.from.username || `${msg.from.first_name||''} ${msg.from.last_name||''}`.trim(),
      senderId: String(msg.from.id),
      text: msg.text,
      sentAt: new Date(msg.date*1000),
      raw: update
    });
  } catch(e) {}

  await Thread.updateOne({ _id: thread._id }, { lastMessageAt: new Date() });
  res.sendStatus(200);
});







const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=>console.log(`Server is running on port ${PORT}`));
