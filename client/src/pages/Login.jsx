import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { loginUser } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.email || !form.password) return setError('All fields required.');
        setLoading(true);
        try {
            const res = await login(form);
            loginUser(res.data.token, res.data.user);
            navigate('/dashboard');
        } catch (err) { setError(err.response?.data?.message || 'Login failed.'); }
        finally { setLoading(false); }
    };

    return (
        <div className="auth-page page-enter">
            <div className="auth-card">
                <h1>Welcome Back</h1>
                <p className="sub">Sign in to continue gaming</p>
                {error && <div className="auth-err">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="fg"><label>Email</label><input type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} /></div>
                    <div className="fg"><label>Password</label><input type="password" name="password" placeholder="Your password" value={form.password} onChange={handleChange} /></div>
                    <button type="submit" className="auth-submit" disabled={loading}>{loading ? '⏳ Signing in...' : '🎮 Sign In'}</button>
                </form>
                <div className="auth-foot">Don't have an account? <Link to="/signup">Sign up</Link></div>
            </div>
        </div>
    );
}
