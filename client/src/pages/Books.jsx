import { useEffect, useState } from 'react';
import api, { errMsg } from '../api/axios';
import BookCard from '../components/BookCard.jsx';
import { Empty, ErrorBox, Spinner } from '../components/Feedback.jsx';

export default function Books() {
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  // Wait for the user to stop typing before calling the API
  useEffect(() => {
    const t = setTimeout(() => { setQuery(search.trim()); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    api.get('/books/genres').then((r) => setGenres(r.data)).catch(() => {});
  }, [books.length]);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError('');
    api.get('/books', { params: { search: query, genre, page, limit: 12 } })
      .then((r) => { if (!ignore) { setBooks(r.data.books); setPages(r.data.pages); } })
      .catch((e) => { if (!ignore) setError(errMsg(e)); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, [query, genre, page, retry]);

  const filtered = query || genre;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">What is everyone reading?</h1>
        <p className="mt-2 max-w-xl text-ink/70">Find a book, read honest reviews, and leave your own rating.</p>
      </div>

      <div className="mb-8 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or author"
          aria-label="Search by title or author"
          className="field sm:max-w-sm"
        />
        <select
          value={genre}
          onChange={(e) => { setGenre(e.target.value); setPage(1); }}
          aria-label="Filter by genre"
          className="field sm:max-w-[14rem]"
        >
          <option value="">All genres</option>
          {genres.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      <ErrorBox message={error} onRetry={() => setRetry((n) => n + 1)} />
      {loading && <Spinner label="Loading books..." />}

      {!loading && !error && books.length === 0 && (
        <Empty title={filtered ? 'No books match your search' : 'No books yet'}>
          {filtered ? 'Try a different title, author or genre.' : 'Log in and add the first book.'}
        </Empty>
      )}

      {!loading && books.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {books.map((b) => <BookCard key={b._id} book={b} />)}
          </div>
          {pages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-4">
              <button className="btn-ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
              <span className="text-sm text-ink/70">Page {page} of {pages}</span>
              <button className="btn-ghost" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
