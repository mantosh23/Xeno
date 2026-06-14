import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { motion } from 'framer-motion';

export const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute bottom-1/4 -left-20 w-72 h-72 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 flex flex-col items-center max-w-md w-full bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl shadow-red-900/5 border border-white/50"
      >
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center shadow-inner mb-6">
          <AlertTriangle className="w-10 h-10" strokeWidth={2} />
        </div>
        
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-3">Something went wrong</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          We encountered an unexpected error while processing your request. Please try again or return to the dashboard.
        </p>

        <div className="flex flex-col gap-3 w-full">
          <button 
            onClick={() => window.location.reload()}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#0f62fe] hover:bg-[#0f62fe]/90 text-white rounded-xl font-semibold transition-colors shadow-md"
          >
            <RefreshCcw className="w-4 h-4" /> Try Again
          </button>
          <button 
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-semibold transition-colors border border-gray-200"
          >
            <Home className="w-4 h-4" /> Go to Dashboard
          </button>
        </div>
      </motion.div>
    </div>
  );
};
