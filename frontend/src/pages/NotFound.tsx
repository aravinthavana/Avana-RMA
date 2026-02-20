import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const NotFound: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="text-center max-w-md">
                <h1 className="text-9xl font-bold text-slate-200">404</h1>
                <h2 className="text-2xl font-bold text-slate-800 mt-4">Page Not Found</h2>
                <p className="text-slate-500 mt-2 mb-8">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>

                <button
                    onClick={() => navigate('/')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 shadow-sm rounded-xl text-slate-700 font-medium hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                    <ChevronLeft size={20} />
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
};

export default NotFound;
