import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Mail, Lock, Sparkles, ArrowRight, Loader2, ShieldCheck, KeyRound, CheckCircle2 } from 'lucide-react';

const Register = () => {
    // Connect to the "Brain" (AuthContext)
    // Ensure verifyOtp is exported from your AuthContext
    const { register, verifyOtp } = useAuth();

    // --- State Management ---
    const [step, setStep] = useState(1); // 1 = Form, 2 = OTP
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Step 1 Data
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });

    // Step 2 Data
    const [otp, setOtp] = useState('');

    // --- Handlers ---

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    // Handler: Step 1 (Send Email)
    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        // 1. Client-side Validation
        if (formData.password !== formData.confirmPassword) {
            setError("Passphrases do not match");
            return;
        }
        if (formData.password.length < 6) {
            setError("Passphrase must be at least 6 characters");
            return;
        }

        setIsSubmitting(true);

        try {
            // Call register (sends OTP email only now)
            await register({
                email: formData.email,
                password: formData.password
            });

            // If successful, move to Step 2
            setIsSubmitting(false);
            setStep(2);
        } catch (err) {
            setIsSubmitting(false);
            // Handle error from backend or fallback
            setError(err.response?.data?.error || "Registration failed. Please try again.");
        }
    };

    // Handler: Step 2 (Verify Code)
    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            // Call verifyOtp to exchange code for tokens
            // The Context handles the redirection to /projects upon success
            await verifyOtp(formData.email, otp);

        } catch (err) {
            setIsSubmitting(false);
            setError("Invalid or expired code. Please check your email.");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-[#050505] font-sans">

            {/* 🌌 Background Glow Effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="w-full max-w-md relative z-10">

                {/* 🔒 Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-white/10 mb-4 shadow-xl shadow-indigo-500/10 animate-pulse">
                        {step === 1 ? (
                            <Sparkles className="w-6 h-6 text-indigo-400" />
                        ) : (
                            <Mail className="w-6 h-6 text-emerald-400" />
                        )}
                    </div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">
                        {step === 1 ? "Create Access Key" : "Verify Identity"}
                    </h2>
                    <p className="text-slate-400 mt-2 text-sm">
                        {step === 1
                            ? "Join the neural network and start generating."
                            : `We sent a 6-digit code to ${formData.email}`}
                    </p>
                </div>

                {/* 📝 Form Card */}
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl">

                    {/* Error Banner */}
                    {error && (
                        <div className="mb-6 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center font-bold uppercase tracking-wide animate-pulse">
                            {error}
                        </div>
                    )}

                    {/* --- STEP 1: Registration Form --- */}
                    {step === 1 && (
                        <form onSubmit={handleRegister} className="space-y-5">

                            {/* Email Input */}
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

                            {/* Confirm Password Input */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Confirm Passphrase</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <ShieldCheck className="h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                    </div>
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

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full relative group overflow-hidden bg-white text-black font-bold py-3.5 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
                                <span className="relative flex items-center justify-center gap-2">
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" /> Generating Key...
                                        </>
                                    ) : (
                                        <>
                                            Generate Identity <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </span>
                            </button>
                        </form>
                    )}

                    {/* --- STEP 2: OTP Verification Form --- */}
                    {step === 2 && (
                        <form onSubmit={handleVerify} className="space-y-6">

                            {/* OTP Input */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1 text-center block">6-Digit Code</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <KeyRound className="h-4 w-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                                    </div>
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

                            {/* Verify Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full relative group overflow-hidden bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all hover:bg-emerald-400 disabled:opacity-70 disabled:cursor-not-allowed mt-4 shadow-lg shadow-emerald-900/20"
                            >
                                <span className="relative flex items-center justify-center gap-2">
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                                        </>
                                    ) : (
                                        <>
                                            Verify & Access <CheckCircle2 className="w-4 h-4" />
                                        </>
                                    )}
                                </span>
                            </button>

                            {/* Back Button */}
                            <button
                                type="button"
                                onClick={() => {
                                    setStep(1);
                                    setError('');
                                }}
                                className="w-full text-xs text-slate-500 hover:text-white transition-colors"
                            >
                                Wrong email? Go back
                            </button>
                        </form>
                    )}

                    {/* Footer Links (Only show on Step 1) */}
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