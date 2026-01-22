import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Mail, Lock, Sparkles, ArrowRight, Loader2, ShieldCheck, KeyRound, CheckCircle2 } from 'lucide-react';

const Register = () => {
    const { register, verifyOtp } = useAuth();

    // --- State ---
    const [step, setStep] = useState(1); // 1 = Info, 2 = OTP
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Form Data
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [otp, setOtp] = useState('');

    // --- Handlers ---
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    // Step 1: Submit Details -> Send Email
    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passphrases do not match");
            return;
        }
        if (formData.password.length < 8) {
            setError("Passphrase must be at least 8 characters");
            return;
        }

        setIsSubmitting(true);

        // Call Context
        const success = await register({
            email: formData.email,
            password: formData.password
        });

        setIsSubmitting(false);

        // ✅ Only move to Step 2 if backend accepted the email
        if (success) {
            setStep(2);
        }
    };

    // Step 2: Submit OTP -> Verify & Auto-Login
    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await verifyOtp(formData.email, otp);
            // Context handles the redirect to /projects
        } catch (err) {
            setIsSubmitting(false);
            // Error toast is handled in Context, but we can set local error too
            setError("Verification failed.");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-[#050505] font-sans text-white">

            {/* Background Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="w-full max-w-md relative z-10">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-white/10 mb-4 shadow-xl shadow-indigo-500/10 animate-pulse">
                        {step === 1 ? <Sparkles className="w-6 h-6 text-indigo-400" /> : <Mail className="w-6 h-6 text-emerald-400" />}
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">
                        {step === 1 ? "Create Access Key" : "Verify Identity"}
                    </h2>
                    <p className="text-slate-400 mt-2 text-sm">
                        {step === 1 ? "Join the neural network." : `Code sent to ${formData.email}`}
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl">

                    {error && (
                        <div className="mb-6 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center font-bold uppercase tracking-wide animate-pulse">
                            {error}
                        </div>
                    )}

                    {/* --- STEP 1 FORM --- */}
                    {step === 1 && (
                        <form onSubmit={handleRegister} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Email Identity</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
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

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Passphrase</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
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

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Confirm Passphrase</label>
                                <div className="relative group">
                                    <ShieldCheck className="absolute left-4 top-3.5 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="block w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full relative group overflow-hidden bg-white text-black font-bold py-3.5 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                            >
                                <span className="relative flex items-center justify-center gap-2">
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Generate Identity <ArrowRight className="w-4 h-4" /></>}
                                </span>
                            </button>
                        </form>
                    )}

                    {/* --- STEP 2 FORM (OTP) --- */}
                    {step === 2 && (
                        <form onSubmit={handleVerify} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1 text-center block">6-Digit Access Code</label>
                                <div className="relative group">
                                    <KeyRound className="absolute left-4 top-3.5 h-4 w-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                                    <input
                                        type="text"
                                        maxLength="6"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="block w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-center tracking-[0.5em] font-mono text-lg"
                                        placeholder="000000"
                                        autoFocus
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all hover:bg-emerald-400 disabled:opacity-70 disabled:cursor-not-allowed mt-4 shadow-lg shadow-emerald-900/20"
                            >
                                <span className="relative flex items-center justify-center gap-2">
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Verify & Access <CheckCircle2 className="w-4 h-4" /></>}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="w-full text-xs text-slate-500 hover:text-white transition-colors"
                            >
                                Wrong email? Go back
                            </button>
                        </form>
                    )}

                    {step === 1 && (
                        <div className="mt-6 text-center text-sm text-slate-500">
                            Already have access?{' '}
                            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors hover:underline">
                                Login Here
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Register;