import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api/axios';
import { useAuth } from '../context/AuthContext.jsx';
import { ErrorBox } from '../components/Feedback.jsx';

export default function Register() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      login(data);
      navigate('/', { replace: true });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-3xl font-extrabold">Create your account</h1>
      <p className="mt-1 text-ink/70">It takes under a minute.</p>
      <form onSubmit={submit} className="mt-6 space-y-4 rounded-xl bg-white p-6 shadow-sm">
        <ErrorBox message={error} />
        <div>
          <label className="label" htmlFor="name">Name</label>
          <input id="name" required maxLength={60} className="field" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" />
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" required className="field" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" type="password" required minLength={6} className="field" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="new-password" />
          <p className="mt-1 text-xs text-ink/60">At least 6 characters.</p>
        </div>
        <button className="btn-primary w-full" disabled={loading}>{loading ? 'Creating account...' : 'Create account'}</button>
      </form>
      <p className="mt-4 text-sm text-ink/70">
        Already registered? <Link to="/login" className="font-semibold text-brand">Log in</Link>
      </p>
    </div>
  );
}
