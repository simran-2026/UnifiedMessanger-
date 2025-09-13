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


app.post('/api/webhooks/telegram', async (req, res) => {
  try {
    const update = req.body;
    const msg = update.message || update.edited_message;
    if (!msg || (!msg.text && !msg.caption)) {
      return res.sendStatus(200); // ignore non-text for now
    }

    const demoUserId = process.env.DEMO_USER_ID;  // string is fine; Mongoose will cast to ObjectId
    const provider = 'telegram';
    const providerThreadId = String(msg.chat.id);
    const providerMessageId = String(msg.message_id);

    // Upsert thread
    let thread = await Thread.findOne({ userId: demoUserId, provider, providerThreadId });
    if (!thread) {
      thread = await Thread.create({
        userId: demoUserId,
        provider,
        providerThreadId,
        title:
          msg.chat.title ||
          msg.chat.username ||
          `${msg.chat.first_name || ''} ${msg.chat.last_name || ''}`.trim(),
        lastMessageAt: new Date((msg.date || Math.floor(Date.now()/1000)) * 1000),
      });
    }

    // Save message (tolerate duplicates)
    const text = msg.text || msg.caption || '';
    try {
      await Message.create({
        userId: demoUserId,
        provider,
        providerMessageId,
        threadId: thread._id,
        direction: 'in',
        senderName:
          msg.from?.username ||
          `${msg.from?.first_name || ''} ${msg.from?.last_name || ''}`.trim(),
        senderId: String(msg.from?.id || ''),
        text,
        sentAt: new Date((msg.date || Math.floor(Date.now()/1000)) * 1000),
        raw: update,
      });
    } catch (e) {
      // ignore duplicate key violations from your Message unique index
      if (e?.code !== 11000) {
        console.error('Message create error:', e);
      }
    }

    await Thread.updateOne(
      { _id: thread._id },
      { lastMessageAt: new Date() }
    );

    res.sendStatus(200);
  } catch (err) {
    console.error('Webhook error:', err);
    res.sendStatus(200); // respond 200 so Telegram doesn’t retry forever
  }
});





const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=>console.log(`Server is running on port ${PORT}`));