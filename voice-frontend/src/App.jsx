import { useEffect } from 'react';
import { Mic } from 'lucide-react';
import api from './api/axios'; // Import our new instance

function App() {

  useEffect(() => {
    // TEST: Check if the Base URL is set correctly in the console
    console.log("✅ Axios Initialized with Base URL:", api.defaults.baseURL);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white">
      <div className="p-4 bg-slate-800 rounded-full mb-6 shadow-lg shadow-blue-500/20">
        <Mic className="w-16 h-16 text-blue-400" />
      </div>
      <h1 className="text-4xl font-bold mb-2">Voice Project Frontend</h1>
      <p className="text-slate-400 text-lg">Check your Console (F12) for the Axios Test 🚀</p>
    </div>
  );
}

export default App;