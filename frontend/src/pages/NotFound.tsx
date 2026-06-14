import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Hexagon, ArrowLeft, Home } from 'lucide-react';
import { motion } from 'framer-motion';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-[#0f62fe]/10 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute bottom-1/4 -left-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="z-10 flex flex-col items-center max-w-md w-full bg-white/70 backdrop-blur-xl p-10 rounded-3xl shadow-2xl shadow-blue-900/5 border border-white/50"
      >
        <div className="w-20 h-20 bg-[#e6f0ff] text-[#0f62fe] rounded-2xl flex items-center justify-center shadow-inner mb-6">
          <Hexagon className="w-10 h-10" strokeWidth={2} />
        </div>
        
        <h1 className="text-8xl font-black text-gray-900 tracking-tighter mb-2">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Page not found</h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button 
            onClick={() => navigate(-1)}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-semibold transition-colors border border-gray-200"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
          <button 
            onClick={() => navigate('/')}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-[#0f62fe] hover:bg-[#0f62fe]/90 text-white rounded-xl font-semibold transition-colors shadow-md"
          >
            <Home className="w-4 h-4" /> Dashboard
          </button>
        </div>
      </motion.div>
    </div>
  );
};
