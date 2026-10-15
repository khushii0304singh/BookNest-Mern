const router = require('express').Router();
const mongoose = require('mongoose');
const { protect } = require('../middleware/auth');
const books = require('../controllers/bookController');
const { upsertReview } = require('../controllers/reviewController');

router.param('id', (req, res, next, id) =>
  mongoose.isValidObjectId(id) ? next() : res.status(400).json({ message: 'Invalid id' })
);

router.get('/genres', books.listGenres); // must stay above '/:id'
router.route('/').get(books.listBooks).post(protect, books.createBook);
router.route('/:id').get(books.getBook).put(protect, books.updateBook).delete(protect, books.deleteBook);
router.post('/:id/reviews', protect, upsertReview);

module.exports = router;
