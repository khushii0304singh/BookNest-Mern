import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { errMsg } from '../api/axios';
import { useAuth } from '../context/AuthContext.jsx';
import { ErrorBox, Spinner } from '../components/Feedback.jsx';

const EMPTY = { title: '', author: '', genre: '', coverUrl: '', description: '' };

// Used for both "Add book" (/add-book) and "Edit book" (/books/:id/edit)
export default function AddBook() {
  const { id } = useParams();
  const editing = Boolean(id);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!editing) return;
    api.get(`/books/${id}`)
      .then(({ data }) => {
        if (data.book.addedBy?._id !== user.id) return navigate(`/books/${id}`, { replace: true });
        const { title, author, genre, coverUrl = '', description = '' } = data.book;
        setForm({ title, author, genre, coverUrl, description });
      })
      .catch((e) => setError(errMsg(e)))
      .finally(() => setLoading(false));
  }, [editing, id, user.id, navigate]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const { data } = editing ? await api.put(`/books/${id}`, form) : await api.post('/books', form);
      navigate(`/books/${data._id}`);
    } catch (err) {
      setError(errMsg(err));
      setSaving(false);
    }
  };

  if (loading) return <Spinner label="Loading book..." />;

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-3xl font-extrabold">{editing ? 'Edit book' : 'Add a book'}</h1>
      <form onSubmit={submit} className="mt-6 space-y-4 rounded-xl bg-white p-6 shadow-sm">
        <ErrorBox message={error} />
        <div>
          <label className="label" htmlFor="title">Title</label>
          <input id="title" required maxLength={150} className="field" value={form.title} onChange={set('title')} />
        </div>
        <div>
          <label className="label" htmlFor="author">Author</label>
          <input id="author" required maxLength={100} className="field" value={form.author} onChange={set('author')} />
        </div>
        <div>
          <label className="label" htmlFor="genre">Genre</label>
          <input id="genre" required maxLength={40} className="field" placeholder="Fiction, Biography, Technology..." value={form.genre} onChange={set('genre')} />
        </div>
        <div>
          <label className="label" htmlFor="coverUrl">Cover image URL (optional)</label>
          <input id="coverUrl" type="url" className="field" placeholder="https://..." value={form.coverUrl} onChange={set('coverUrl')} />
        </div>
        <div>
          <label className="label" htmlFor="description">Short description</label>
          <textarea id="description" rows={4} maxLength={1000} className="field" value={form.description} onChange={set('description')} />
        </div>
        <div className="flex gap-3">
          <button className="btn-primary" disabled={saving}>{saving ? 'Saving...' : editing ? 'Save changes' : 'Add book'}</button>
          <button type="button" className="btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
