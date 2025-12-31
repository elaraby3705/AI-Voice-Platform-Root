import { useState } from 'react';
import { User, Lock, Bell, Shield, Save, Camera } from 'lucide-react';

const Settings = () => {
    const [name, setName] = useState('Commander One');
    const [email, setEmail] = useState('human@example.com');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 1500);
    };

    return (
        <div className="min-h-screen pt-24 px-4 md:px-8 pb-10 bg-black text-white">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">

                {/* Sidebar Navigation */}
                <div className="md:col-span-1 space-y-1">
                    <button className="w-full text-left px-4 py-2 rounded-lg bg-indigo-500/10 text-indigo-400 font-medium text-sm border border-indigo-500/20 flex items-center gap-2">
                        <User className="w-4 h-4" /> Profile
                    </button>
                    <button className="w-full text-left px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 font-medium text-sm transition-colors flex items-center gap-2">
                        <Lock className="w-4 h-4" /> Security
                    </button>
                    <button className="w-full text-left px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 font-medium text-sm transition-colors flex items-center gap-2">
                        <Bell className="w-4 h-4" /> Notifications
                    </button>
                    <button className="w-full text-left px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 font-medium text-sm transition-colors flex items-center gap-2">
                        <Shield className="w-4 h-4" /> API Access
                    </button>
                </div>

                {/* Main Content Form */}
                <div className="md:col-span-3 space-y-8">

                    {/* Header */}
                    <div>
                        <h2 className="text-2xl font-bold mb-1">Profile Settings</h2>
                        <p className="text-slate-400 text-sm">Update your personal information and public profile.</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">

                        {/* Avatar Section */}
                        <div className="flex items-center gap-6 mb-8">
                            <div className="relative group cursor-pointer">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-indigo-500/20">
                                    C
                                </div>
                                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-white">Profile Photo</h3>
                                <p className="text-xs text-slate-400 mt-1 mb-3">Recommended 400x400px. JPG or PNG.</p>
                                <div className="flex gap-3">
                                    <button className="px-3 py-1.5 bg-white text-black text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors">Upload</button>
                                    <button className="px-3 py-1.5 text-red-400 text-xs font-bold hover:text-red-300 transition-colors">Remove</button>
                                </div>
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-mono uppercase tracking-widest text-slate-500">Display Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-mono uppercase tracking-widest text-slate-500">Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-mono uppercase tracking-widest text-slate-500">Bio</label>
                                <textarea
                                    rows="3"
                                    placeholder="Tell us a little about yourself..."
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-colors resize-none"
                                ></textarea>
                                <p className="text-[10px] text-slate-500 text-right">0 / 160</p>
                            </div>
                        </div>

                        {/* Footer Action */}
                        <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-colors flex items-center gap-2"
                            >
                                {isSaving ? (
                                    <>Saving...</>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" /> Save Changes
                                    </>
                                )}
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;