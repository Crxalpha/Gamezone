import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { loginUser } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.password) return setError('All fields required.');
        if (form.password.length < 6) return setError('Password must be 6+ characters.');
        if (form.password !== form.confirm) return setError('Passwords do not match.');
        setLoading(true);
        try {
            const res = await signup({ name: form.name, email: form.email, password: form.password });
            loginUser(res.data.token, res.data.user);
            navigate('/dashboard');
        } catch (err) { setError(err.response?.data?.message || 'Signup failed.'); }
        finally { setLoading(false); }
    };

    return (
        <div className="auth-page page-enter">
            <div className="auth-card">
                <h1>Join GameZone</h1>
                <p className="sub">Create your account & start gaming</p>
                {error && <div className="auth-err">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="fg"><label>Username</label><input type="text" name="name" placeholder="Your gamer tag" value={form.name} onChange={handleChange} /></div>
                    <div className="fg"><label>Email</label><input type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} /></div>
                    <div className="fg"><label>Password</label><input type="password" name="password" placeholder="Min 6 characters" value={form.password} onChange={handleChange} /></div>
                    <div className="fg"><label>Confirm Password</label><input type="password" name="confirm" placeholder="Repeat password" value={form.confirm} onChange={handleChange} /></div>
                    <button type="submit" className="auth-submit" disabled={loading}>{loading ? '⏳ Creating...' : '🚀 Create Account'}</button>
                </form>
                <div className="auth-foot">Already have an account? <Link to="/login">Sign in</Link></div>
            </div>
        </div>
    );
}
