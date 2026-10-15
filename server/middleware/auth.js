const jwt = require('jsonwebtoken');
const User = require('../models/User');

// protect: only requests with a valid JWT get through
exports.protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized: token missing' });
    }
    const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'Not authorized: user no longer exists' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Not authorized: invalid or expired token' });
  }
};
