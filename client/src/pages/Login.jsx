import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api/axios';
import { useAuth } from '../context/AuthContext.jsx';
import { ErrorBox } from '../components/Feedback.jsx';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={from} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data);
      navigate(from, { replace: true });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-3xl font-extrabold">Log in</h1>
      <p className="mt-1 text-ink/70">Log in to add books and write reviews.</p>
      <form onSubmit={submit} className="mt-6 space-y-4 rounded-xl bg-white p-6 shadow-sm">
        <ErrorBox message={error} />
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" required className="field" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" type="password" required className="field" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="current-password" />
        </div>
        <button className="btn-primary w-full" disabled={loading}>{loading ? 'Logging in...' : 'Log in'}</button>
      </form>
      <p className="mt-4 text-sm text-ink/70">
        New here? <Link to="/register" className="font-semibold text-brand">Create an account</Link>
      </p>
    </div>
  );
}
