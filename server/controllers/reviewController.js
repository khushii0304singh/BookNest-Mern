const Book = require('../models/Book');
const Review = require('../models/Review');

// Add a review, or update the user's existing review for this book
exports.upsertReview = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const rating = Number(req.body.rating);
    const comment = typeof req.body.comment === 'string' ? req.body.comment.trim() : '';
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be a whole number from 1 to 5' });
    }
    if (!comment) return res.status(400).json({ message: 'Please write a short comment' });
    if (comment.length > 1000) return res.status(400).json({ message: 'Comment must be 1000 characters or fewer' });

    const existing = await Review.findOne({ book: book._id, user: req.user._id });
    if (existing) {
      existing.rating = rating;
      existing.comment = comment;
      await existing.save();
      return res.status(200).json({ review: existing, updated: true });
    }
    const review = await Review.create({ book: book._id, user: req.user._id, rating, comment });
    res.status(201).json({ review, updated: false });
  } catch (err) {
    next(err);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own review' });
    }
    await review.deleteOne();
    res.json({ message: 'Review deleted' });
  } catch (err) {
    next(err);
  }
};

exports.myReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate('book', 'title author coverUrl genre')
      .sort('-createdAt')
      .lean();
    res.json(reviews.filter((r) => r.book));
  } catch (err) {
    next(err);
  }
};
