const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const sign = (u) => jwt.sign({ uid: u._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const auth = (req,res,next)=>{
  const token = (req.headers.authorization||'').replace('Bearer ','');
  if(!token) return res.status(401).send('No token');
  try { req.user = jwt.verify(token, process.env.JWT_SECRET); next(); }
  catch { return res.status(401).send('Bad token'); }
};

router.post('/register', async (req,res)=>{
  const { email, password } = req.body;
  const passwordHash = await bcrypt.hash(password,10);
  const user = await User.create({ email, passwordHash });
  res.json({ token: sign(user), user: { id: user._id, email: user.email } });
});

router.post('/login', async (req,res)=>{
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if(!user) return res.status(400).send('No user');
  const ok = await bcrypt.compare(password, user.passwordHash);
  if(!ok) return res.status(400).send('Bad creds');
  res.json({ token: sign(user), user: { id: user._id, email: user.email } });
});

module.exports = router;
module.exports.auth = auth;
