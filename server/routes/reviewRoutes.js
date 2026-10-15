const router = require('express').Router();
const mongoose = require('mongoose');
const { protect } = require('../middleware/auth');
const { deleteReview, myReviews } = require('../controllers/reviewController');

router.param('id', (req, res, next, id) =>
  mongoose.isValidObjectId(id) ? next() : res.status(400).json({ message: 'Invalid id' })
);

router.get('/me', protect, myReviews); // must stay above '/:id'
router.delete('/:id', protect, deleteReview);

module.exports = router;
