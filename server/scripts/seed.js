// Creates a demo user + sample books/reviews. Run: npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Book = require('../models/Book');
const Review = require('../models/Review');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const email = 'demo@booknest.com';
  let demo = await User.findOne({ email });
  if (!demo) demo = await User.create({ name: 'Demo Reader', email, password: await bcrypt.hash('demo1234', 10) });
  let other = await User.findOne({ email: 'asha@booknest.com' });
  if (!other) other = await User.create({ name: 'Asha', email: 'asha@booknest.com', password: await bcrypt.hash('asha1234', 10) });

  if ((await Book.countDocuments()) === 0) {
    const books = await Book.insertMany([
      { title: 'The Alchemist', author: 'Paulo Coelho', genre: 'Fiction', description: 'A shepherd boy follows his dream across the desert.', addedBy: demo._id },
      { title: 'Atomic Habits', author: 'James Clear', genre: 'Self-help', description: 'Small changes that compound into remarkable results.', addedBy: demo._id },
      { title: 'Wings of Fire', author: 'A. P. J. Abdul Kalam', genre: 'Biography', description: 'The autobiography of the Missile Man of India.', addedBy: other._id },
      { title: 'Clean Code', author: 'Robert C. Martin', genre: 'Technology', description: 'A handbook of agile software craftsmanship.', addedBy: other._id },
    ]);
    await Review.insertMany([
      { book: books[0]._id, user: other._id, rating: 5, comment: 'Simple, hopeful and easy to finish in one sitting.' },
      { book: books[1]._id, user: other._id, rating: 4, comment: 'Practical. The habit stacking chapter changed my mornings.' },
      { book: books[2]._id, user: demo._id, rating: 5, comment: 'Inspiring from the first page.' },
    ]);
  }
  console.log('Seeded. Demo login: demo@booknest.com / demo1234');
  await mongoose.disconnect();
})();
