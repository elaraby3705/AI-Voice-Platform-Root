import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Mail, Lock, Sparkles, ArrowRight, Loader2, User, Phone, Globe, Building2, KeyRound, CheckCircle2, ChevronLeft } from 'lucide-react';

const Register = () => {
    const { register, verifyOtp } = useAuth();
    
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phone: '',
        country: '',
        company: ''
    });
    const [otp, setOtp] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passphrases do not match.");
            return;
        }

        setIsSubmitting(true);
        // Pass all data to register to handle User + Profile creation in Django
        const success = await register(formData);
        setIsSubmitting(false);

        if (success) setStep(2);
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await verifyOtp(formData.email, otp);
        } catch (err) {
            setError("Verification failed. Please check the code.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-[#050505] font-sans text-white py-12">
            <div className="w-full max-w-lg relative z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-6 shadow-xl shadow-indigo-500/10">
                        {step === 1 ? <Sparkles className="w-8 h-8 text-indigo-400" /> : <KeyRound className="w-8 h-8 text-emerald-400" />}
                    </div>
                    <h2 className="text-4xl font-bold tracking-tight">
                        {step === 1 ? "Initialize Identity" : "Verify Connection"}
                    </h2>
                    <p className="text-slate-400 mt-3">
                        {step === 1 ? "Enter your professional details to begin." : `Enter the 6-digit code sent to ${formData.email}`}
                    </p>
                </div>

                <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm text-center font-medium animate-in fade-in">
                            {error}
                        </div>
                    )}

                    {step === 1 ? (
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <InputField name="firstName" label="First Name" icon={<User />} value={formData.firstName} onChange={handleChange} placeholder="John" />
                                <InputField name="lastName" label="Last Name" icon={<User />} value={formData.lastName} onChange={handleChange} placeholder="Doe" />
                            </div>
                            <InputField name="email" label="Email Identity" icon={<Mail />} value={formData.email} onChange={handleChange} placeholder="human@example.com" type="email" />
                            
                            <div className="grid grid-cols-2 gap-4">
                                <InputField name="country" label="Country" icon={<Globe />} value={formData.country} onChange={handleChange} placeholder="Egypt" />
                                <InputField name="phone" label="Phone" icon={<Phone />} value={formData.phone} onChange={handleChange} placeholder="+20..." />
                            </div>

                            <InputField name="company" label="Company" icon={<Building2 />} value={formData.company} onChange={handleChange} placeholder="Nexus AI" />
                            
                            <div className="grid grid-cols-2 gap-4">
                                <InputField name="password" label="Passphrase" icon={<Lock />} value={formData.password} onChange={handleChange} placeholder="••••••••" type="password" />
                                <InputField name="confirmPassword" label="Confirm" icon={<Lock />} value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" type="password" />
                            </div>

                            <button type="submit" disabled={isSubmitting} className="w-full bg-white text-black font-bold py-4 rounded-xl mt-6 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2">
                                {isSubmitting ? <Loader2 className="animate-spin" /> : <>Continue <ArrowRight size={18}/></>}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerify} className="space-y-6">
                            <input 
                                type="text" maxLength="6" value={otp} onChange={(e) => setOtp(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 py-5 text-center text-3xl font-mono tracking-[0.5em] rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none"
                                placeholder="000000"
                            />
                            <button type="submit" className="w-full bg-emerald-500 py-4 rounded-xl font-bold hover:bg-emerald-400 transition-all">Verify Access</button>
                            <button type="button" onClick={() => setStep(1)} className="w-full text-slate-500 hover:text-white text-sm flex items-center justify-center gap-1">
                                <ChevronLeft size={16}/> Go back
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

// Sub-component for cleaner forms
const InputField = ({ name, label, icon, value, onChange, placeholder, type = "text" }) => (
    <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">{label}</label>
        <div className="relative">
            <div className="absolute left-3 top-3.5 text-slate-500">{icon}</div>
            <input name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} 
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                required
            />
        </div>
    </div>
);

export default Register;
