const Book = require('../models/Book');
const Review = require('../models/Review');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const round1 = (n) => Math.round(n * 10) / 10;
const isOwner = (book, user) => book.addedBy.toString() === user._id.toString();

// Average rating is always computed on the server (sum / count), never trusted from the client
async function statsFor(bookIds) {
  const rows = await Review.aggregate([
    { $match: { book: { $in: bookIds } } },
    { $group: { _id: '$book', sum: { $sum: '$rating' }, count: { $sum: 1 } } },
  ]);
  const map = {};
  rows.forEach((r) => {
    map[r._id.toString()] = { averageRating: round1(r.sum / r.count), reviewCount: r.count };
  });
  return map;
}

function pickBookFields(body) {
  const out = {};
  ['title', 'author', 'genre', 'coverUrl', 'description'].forEach((f) => {
    if (typeof body[f] === 'string') out[f] = body[f].trim();
  });
  return out;
}

function validateBook(data) {
  if (!data.title || !data.author || !data.genre) return 'Title, author and genre are required';
  if (data.coverUrl && !/^https?:\/\//i.test(data.coverUrl)) return 'Cover image must be a valid http(s) URL';
  return null;
}

exports.listBooks = async (req, res, next) => {
  try {
    const { search = '', genre = '' } = req.query;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 50);

    const filter = {};
    if (typeof search === 'string' && search.trim()) {
      const rx = new RegExp(escapeRegex(search.trim()), 'i');
      filter.$or = [{ title: rx }, { author: rx }];
    }
    if (typeof genre === 'string' && genre.trim()) {
      filter.genre = new RegExp(`^${escapeRegex(genre.trim())}$`, 'i');
    }

    const total = await Book.countDocuments(filter);
    const books = await Book.find(filter)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('addedBy', 'name')
      .lean();

    const stats = await statsFor(books.map((b) => b._id));
    const result = books.map((b) => ({
      ...b,
      averageRating: 0,
      reviewCount: 0,
      ...(stats[b._id.toString()] || {}),
    }));
    res.json({ books: result, page, pages: Math.max(Math.ceil(total / limit), 1), total });
  } catch (err) {
    next(err);
  }
};

exports.listGenres = async (req, res, next) => {
  try {
    const genres = await Book.distinct('genre');
    res.json(genres.sort((a, b) => a.localeCompare(b)));
  } catch (err) {
    next(err);
  }
};

exports.getBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id).populate('addedBy', 'name').lean();
    if (!book) return res.status(404).json({ message: 'Book not found' });
    const reviews = await Review.find({ book: book._id }).populate('user', 'name').sort('-createdAt').lean();
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    book.reviewCount = reviews.length;
    book.averageRating = reviews.length ? round1(sum / reviews.length) : 0;
    res.json({ book, reviews });
  } catch (err) {
    next(err);
  }
};

exports.createBook = async (req, res, next) => {
  try {
    const data = pickBookFields(req.body);
    const problem = validateBook(data);
    if (problem) return res.status(400).json({ message: problem });
    const book = await Book.create({ ...data, addedBy: req.user._id });
    res.status(201).json(book);
  } catch (err) {
    next(err);
  }
};

exports.updateBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    if (!isOwner(book, req.user)) return res.status(403).json({ message: 'You can only edit your own book' });

    const changes = pickBookFields(req.body);
    const merged = {
      title: book.title, author: book.author, genre: book.genre, coverUrl: book.coverUrl, ...changes,
    };
    const problem = validateBook(merged);
    if (problem) return res.status(400).json({ message: problem });
    Object.assign(book, changes);
    await book.save();
    res.json(book);
  } catch (err) {
    next(err);
  }
};

exports.deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    if (!isOwner(book, req.user)) return res.status(403).json({ message: 'You can only delete your own book' });
    await Review.deleteMany({ book: book._id });
    await book.deleteOne();
    res.json({ message: 'Book and its reviews deleted' });
  } catch (err) {
    next(err);
  }
};
