// Automated "Break Your Own App" tests (Section 10). Start the server first, then:
//   npm run security-test            (defaults to http://localhost:5000)
//   node scripts/securityTest.js https://your-api.onrender.com
const BASE = (process.argv[2] || 'http://localhost:5000').replace(/\/$/, '');
const rnd = Math.random().toString(36).slice(2, 8);

async function call(method, path, body, token) {
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = {};
  try { data = await res.json(); } catch { /* empty body */ }
  return { status: res.status, data };
}

let failed = 0;
function check(name, ok, detail = '') {
  if (!ok) failed += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : `   (${detail})`}`);
}

(async () => {
  const a = await call('POST', '/auth/register', { name: 'Alice', email: `alice_${rnd}@test.com`, password: 'secret123' });
  const b = await call('POST', '/auth/register', { name: 'Bob', email: `bob_${rnd}@test.com`, password: 'secret123' });
  if (a.status !== 201 || b.status !== 201) {
    console.log('Could not register test users. Is the server running?', a.status, a.data);
    process.exit(1);
  }
  const tokenA = a.data.token;
  const tokenB = b.data.token;
  const login = await call('POST', '/auth/login', { email: `alice_${rnd}@test.com`, password: 'secret123' });
  check('Register/login responses never contain a password', !/password/i.test(JSON.stringify([a.data, b.data, login.data])));

  const bookBody = { title: `Test Book ${rnd}`, author: 'Tester', genre: 'Testing' };
  let r = await call('POST', '/books', bookBody);
  check('Add book without token -> 401', r.status === 401, r.status);

  r = await call('POST', '/books', bookBody, tokenA);
  const bookId = r.data._id;
  check('Alice can add a book (control test)', r.status === 201 && !!bookId, r.status);

  r = await call('POST', `/books/${bookId}/reviews`, { rating: 5, comment: 'Great' });
  check('Add review without token -> 401', r.status === 401, r.status);

  r = await call('POST', `/books/${bookId}/reviews`, { rating: 0, comment: 'x' }, tokenB);
  check('Rating 0 -> 400', r.status === 400, r.status);
  r = await call('POST', `/books/${bookId}/reviews`, { rating: 6, comment: 'x' }, tokenB);
  check('Rating 6 -> 400', r.status === 400, r.status);

  r = await call('POST', `/books/${bookId}/reviews`, { rating: 4, comment: 'First review' }, tokenB);
  const reviewId = r.data.review?._id;
  check('Bob can review a book (control test)', r.status === 201 && !!reviewId, r.status);

  r = await call('POST', `/books/${bookId}/reviews`, { rating: 2, comment: 'Changed my mind' }, tokenB);
  check('Review same book twice -> existing review updated', r.status === 200 && r.data.updated === true, r.status);
  r = await call('GET', `/books/${bookId}`);
  check('...and no duplicate was created', r.data.reviews?.length === 1 && r.data.reviews[0].rating === 2, JSON.stringify(r.data.reviews?.length));

  r = await call('DELETE', `/reviews/${reviewId}`, null, tokenA);
  check("Alice deletes Bob's review -> 403", r.status === 403, r.status);
  r = await call('GET', `/books/${bookId}`);
  check('...and the review still exists', r.data.reviews?.length === 1);

  r = await call('PUT', `/books/${bookId}`, { title: 'Hacked' }, tokenB);
  check("Bob edits Alice's book -> 403", r.status === 403, r.status);
  r = await call('DELETE', `/books/${bookId}`, null, tokenB);
  check("Bob deletes Alice's book -> 403", r.status === 403, r.status);

  r = await call('DELETE', `/books/${bookId}`, null, tokenA); // cleanup
  check('Alice can delete her own book (cleanup)', r.status === 200, r.status);

  console.log(failed ? `\n${failed} test(s) FAILED` : '\nAll security tests passed');
  process.exit(failed ? 1 : 0);
})();
