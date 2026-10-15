import { Link } from 'react-router-dom';
import Cover from './Cover.jsx';
import StarRating from './StarRating.jsx';

export default function BookCard({ book }) {
  return (
    <Link to={`/books/${book._id}`} className="group block">
      <Cover book={book} className="shadow-md transition group-hover:-translate-y-1 group-hover:shadow-lg" />
      <h3 className="mt-3 line-clamp-2 text-base font-bold leading-snug group-hover:text-brand">{book.title}</h3>
      <p className="text-sm text-ink/70">{book.author}</p>
      <div className="mt-1 flex items-center gap-2 text-sm">
        {book.reviewCount > 0 ? (
          <>
            <StarRating value={book.averageRating} size="text-sm" />
            <span className="font-semibold">{book.averageRating.toFixed(1)}</span>
            <span className="text-ink/50">({book.reviewCount})</span>
          </>
        ) : (
          <span className="text-ink/50">No reviews yet</span>
        )}
      </div>
    </Link>
  );
}
