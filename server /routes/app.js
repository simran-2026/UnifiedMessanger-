const router = require('express').Router();
const { auth } = require('./auth');
const Thread = require('../models/Thread');
const Message = require('../models/Message');

router.get('/threads', auth, async (req,res)=>{
  const rows = await Thread.find({ userId: req.user.uid }).sort({ lastMessageAt: -1 }).limit(100);
  res.json(rows);
});

router.get('/messages/:threadId', auth, async (req,res)=>{
  const rows = await Message.find({ userId: req.user.uid, threadId: req.params.threadId })
                 .sort({ sentAt: 1 });
  res.json(rows);
});

module.exports = router;
