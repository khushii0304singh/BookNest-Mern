export function Spinner({ label = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-ink/60" role="status">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      {label}
    </div>
  );
}

export function ErrorBox({ message, onRetry }) {
  if (!message) return null;
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
      {message}
      {onRetry && (
        <button onClick={onRetry} className="ml-3 font-semibold underline">Try again</button>
      )}
    </div>
  );
}

export function Empty({ title, children }) {
  return (
    <div className="rounded-xl border border-dashed border-ink/20 bg-white px-6 py-14 text-center">
      <h3 className="text-lg font-bold">{title}</h3>
      <div className="mt-2 text-sm text-ink/70">{children}</div>
    </div>
  );
}
