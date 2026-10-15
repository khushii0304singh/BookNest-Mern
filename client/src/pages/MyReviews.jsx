import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../api/axios';
import Cover from '../components/Cover.jsx';
import StarRating from '../components/StarRating.jsx';
import { Empty, ErrorBox, Spinner } from '../components/Feedback.jsx';

export default function MyReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/reviews/me');
      setReviews(data);
      setError('');
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const remove = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await api.delete(`/reviews/${id}`);
      setReviews((list) => list.filter((r) => r._id !== id));
    } catch (e) {
      setError(errMsg(e));
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-extrabold">My reviews</h1>
      <div className="mt-6 space-y-4">
        <ErrorBox message={error} onRetry={load} />
        {loading && <Spinner label="Loading your reviews..." />}
        {!loading && !error && reviews.length === 0 && (
          <Empty title="You have not reviewed any books yet">
            <Link to="/" className="font-semibold text-brand">Browse books</Link> and share your first rating.
          </Empty>
        )}
        {reviews.map((r) => (
          <article key={r._id} className="flex gap-4 rounded-xl bg-white p-4 shadow-sm">
            <div className="w-20 shrink-0"><Cover book={r.book} /></div>
            <div className="min-w-0 flex-1">
              <Link to={`/books/${r.book._id}`} className="font-display text-lg font-bold hover:text-brand">{r.book.title}</Link>
              <p className="text-sm text-ink/60">{r.book.author}</p>
              <div className="mt-1"><StarRating value={r.rating} size="text-base" /></div>
              <p className="mt-2 whitespace-pre-line">{r.comment}</p>
              <div className="mt-3 flex gap-4 text-sm font-semibold">
                <Link to={`/books/${r.book._id}#review-form`} className="text-brand">Edit</Link>
                <button onClick={() => remove(r._id)} className="text-red-700">Delete</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
