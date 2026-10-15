import { useState } from 'react';

// Books without a (working) cover image get a typographic cover, coloured from the title
const PALETTE = [
  ['#2c3fd1', '#ffffff'], ['#1b2236', '#f5d76e'], ['#0f7b6c', '#ffffff'],
  ['#c2410c', '#fff7ed'], ['#6d28d9', '#ffffff'], ['#be123c', '#ffe4e6'],
];

function pick(title) {
  let h = 0;
  for (const c of title) h = (h * 31 + c.charCodeAt(0)) % 997;
  return PALETTE[h % PALETTE.length];
}

export default function Cover({ book, className = '' }) {
  const [broken, setBroken] = useState(false);
  const [bg, fg] = pick(book.title);

  if (book.coverUrl && !broken) {
    return (
      <img
        src={book.coverUrl}
        alt={`Cover of ${book.title}`}
        loading="lazy"
        onError={() => setBroken(true)}
        className={`aspect-[2/3] w-full rounded-md object-cover ${className}`}
      />
    );
  }
  return (
    <div
      className={`flex aspect-[2/3] w-full flex-col justify-between rounded-md p-4 ${className}`}
      style={{ background: bg, color: fg }}
      role="img"
      aria-label={`Cover of ${book.title}`}
    >
      <span className="font-display text-xl font-extrabold leading-tight">{book.title}</span>
      <span className="text-xs font-medium opacity-80">{book.author}</span>
    </div>
  );
}
