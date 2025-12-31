// src/pages/Register.jsx
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth'; // Assumes same hook path
import { Link } from 'react-router-dom';
import { Mic, Lock, User, Mail, ArrowRight, Loader2 } from 'lucide-react';

const Register = () => {
    const { signup } = useAuth(); // Using signup function from context

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            // Call the signup function
            await signup(formData.email, formData.password, formData.username);
            // Navigation is usually handled inside signup or via protected route redirect
        } catch (err) {
            setError('Failed to create account.');
        }

        setIsSubmitting(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">

            {/* 🌌 Background Glow Effect (Identical to Login) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="w-full max-w-md relative z-10">

                {/* 🔒 Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-white/10 mb-4 shadow-xl shadow-indigo-500/10">
                        <Mic className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Create Access Key</h2>
                    <p className="text-slate-400 mt-2 text-sm">Join the neural network.</p>
                </div>

                {/* 📝 Form Card (Identical Structure) */}
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl">

                    {error && (
                        <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Username Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Username</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="block w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm"
                                    placeholder="CommanderName"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email Input (Added for Registration) */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Email Identity</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="block w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm"
                                    placeholder="human@example.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Passphrase</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="block w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full relative group overflow-hidden bg-white text-black font-bold py-3.5 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
                            <span className="relative flex items-center justify-center gap-2">
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                                    </>
                                ) : (
                                    <>
                                        Generate Key <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </span>
                        </button>
                    </form>

                    {/* Footer Links */}
                    <div className="mt-6 text-center text-sm text-slate-500">
                        Already have access?{' '}
                        <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors hover:underline">
                            Login here
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;