import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { errMsg } from '../api/axios';
import { useAuth } from '../context/AuthContext.jsx';
import Cover from '../components/Cover.jsx';
import StarRating from '../components/StarRating.jsx';
import { Empty, ErrorBox, Spinner } from '../components/Feedback.jsx';

function ReviewForm({ bookId, existing, onSaved }) {
  const [rating, setRating] = useState(existing?.rating || 0);
  const [comment, setComment] = useState(existing?.comment || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setRating(existing?.rating || 0);
    setComment(existing?.comment || '');
  }, [existing]);

  const submit = async (e) => {
    e.preventDefault();
    if (!rating) return setError('Choose a star rating from 1 to 5');
    setSaving(true);
    setError('');
    try {
      await api.post(`/books/${bookId}/reviews`, { rating, comment });
      await onSaved();
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form id="review-form" onSubmit={submit} className="space-y-3 rounded-xl bg-white p-5 shadow-sm">
      <h3 className="text-lg font-bold">{existing ? 'Edit your review' : 'Write a review'}</h3>
      <ErrorBox message={error} />
      <StarRating value={rating} onChange={setRating} size="text-3xl" />
      <textarea
        required
        rows={4}
        maxLength={1000}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="What did you think of this book?"
        aria-label="Your review"
        className="field"
      />
      <button className="btn-primary" disabled={saving}>
        {saving ? 'Saving...' : existing ? 'Update review' : 'Post review'}
      </button>
    </form>
  );
}

export default function BookDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  const load = useCallback(async () => {
    try {
      const { data } = await api.get(`/books/${id}`);
      setBook(data.book);
      setReviews(data.reviews);
      setError('');
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { setLoading(true); load(); }, [load]);

  if (loading) return <Spinner label="Loading book..." />;
  if (error) {
    return (
      <div className="space-y-4">
        <ErrorBox message={error} onRetry={load} />
        <Link to="/" className="btn-ghost">Back to books</Link>
      </div>
    );
  }

  const isOwner = user && book.addedBy?._id === user.id;
  const myReview = user && reviews.find((r) => r.user?._id === user.id);

  const deleteBook = async () => {
    if (!window.confirm('Delete this book and all of its reviews?')) return;
    try {
      await api.delete(`/books/${book._id}`);
      navigate('/');
    } catch (e) {
      setActionError(errMsg(e));
    }
  };

  const deleteReview = async (reviewId) => {
    if (!window.confirm('Delete your review?')) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      await load();
    } catch (e) {
      setActionError(errMsg(e));
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-[260px_1fr]">
      <div>
        <Cover book={book} className="shadow-lg" />
      </div>

      <div>
        <p className="text-sm font-semibold text-brand">{book.genre}</p>
        <h1 className="mt-1 text-3xl font-extrabold leading-tight sm:text-4xl">{book.title}</h1>
        <p className="mt-1 text-lg text-ink/70">by {book.author}</p>

        <div className="mt-4 flex items-center gap-3">
          {book.reviewCount > 0 ? (
            <>
              <StarRating value={book.averageRating} size="text-2xl" />
              <span className="text-xl font-bold">{book.averageRating.toFixed(1)}</span>
              <span className="text-ink/60">{book.reviewCount} {book.reviewCount === 1 ? 'review' : 'reviews'}</span>
            </>
          ) : (
            <span className="text-ink/60">No ratings yet</span>
          )}
        </div>

        {book.description && <p className="mt-5 max-w-prose leading-relaxed">{book.description}</p>}
        <p className="mt-3 text-sm text-ink/60">Added by {book.addedBy?.name || 'a former member'}</p>

        {isOwner && (
          <div className="mt-5 flex gap-3">
            <Link to={`/books/${book._id}/edit`} className="btn-ghost">Edit book</Link>
            <button onClick={deleteBook} className="btn-danger">Delete book</button>
          </div>
        )}

        <ErrorBox message={actionError} />

        <section className="mt-10">
          {user ? (
            <ReviewForm bookId={book._id} existing={myReview} onSaved={load} />
          ) : (
            <Empty title="Want to review this book?">
              <Link to="/login" state={{ from: `/books/${book._id}` }} className="font-semibold text-brand">Log in</Link> or{' '}
              <Link to="/register" className="font-semibold text-brand">create an account</Link> to leave a rating.
            </Empty>
          )}
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold">Reviews</h2>
          {reviews.length === 0 ? (
            <div className="mt-4"><Empty title="No reviews yet">Be the first to share what you thought.</Empty></div>
          ) : (
            <ul className="mt-4 space-y-4">
              {reviews.map((r) => {
                const mine = user && r.user?._id === user.id;
                return (
                  <li key={r._id} className="rounded-xl bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">{r.user?.name || 'Former member'}{mine && ' (you)'}</span>
                        <StarRating value={r.rating} size="text-base" />
                      </div>
                      <span className="text-xs text-ink/50">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="mt-2 whitespace-pre-line leading-relaxed">{r.comment}</p>
                    {mine && (
                      <div className="mt-3 flex gap-4 text-sm font-semibold">
                        <a href="#review-form" className="text-brand">Edit</a>
                        <button onClick={() => deleteReview(r._id)} className="text-red-700">Delete</button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
