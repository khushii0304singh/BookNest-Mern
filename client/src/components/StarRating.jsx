// Display mode: <StarRating value={4.3} />
// Input mode:   <StarRating value={rating} onChange={setRating} />
export default function StarRating({ value = 0, onChange, size = 'text-lg' }) {
  const rounded = Math.round(value);
  if (!onChange) {
    return (
      <span className={`${size} leading-none tracking-tight`} role="img" aria-label={`${value} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={n <= rounded ? 'text-star' : 'text-ink/20'}>★</span>
        ))}
      </span>
    );
  }
  return (
    <div className={`${size} flex gap-1`} role="radiogroup" aria-label="Your rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          type="button"
          key={n}
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          onClick={() => onChange(n)}
          className={`leading-none transition hover:scale-110 ${n <= value ? 'text-star' : 'text-ink/20'}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
