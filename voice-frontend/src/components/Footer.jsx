// src/components/Footer.jsx
import { Github, Twitter } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-slate-950 text-slate-400 py-8 border-t border-slate-900 mt-auto">
            <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-sm">
                    &copy; {new Date().getFullYear()} VoiceAI Platform. All rights reserved.
                </div>

                <div className="flex gap-6">
                    <a href="#" className="hover:text-blue-400 transition"><Github className="w-5 h-5" /></a>
                    <a href="#" className="hover:text-blue-400 transition"><Twitter className="w-5 h-5" /></a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;