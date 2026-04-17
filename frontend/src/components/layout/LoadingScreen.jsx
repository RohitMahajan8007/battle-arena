import React from 'react';
import { Landmark } from 'lucide-react';

const LoadingScreen = () => {
    return (
        <div className="fixed inset-0 z-[999] bg-[#242220] flex flex-col items-center justify-center animate-in fade-in duration-500">
            <div className="flex flex-col items-center gap-6">
                {/* Logo Animation */}
                <div className="relative">
                    <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
                    <div className="bg-[#302e2c] p-6 rounded-3xl border border-white/10 shadow-2xl relative z-10 animate-bounce">
                        <Landmark size={64} className="text-white" strokeWidth={1.5} />
                    </div>
                </div>

                {/* Text Animation */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-serif font-bold tracking-tight text-white animate-pulse">
                        Arena
                    </h1>
                    <div className="flex items-center gap-2 justify-center">
                        <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></div>
                    </div>
                </div>
            </div>
            
            {/* Branding Footer */}
            <div className="absolute bottom-12 text-[10px] uppercase tracking-[0.2em] text-gray-500 font-medium opacity-50">
                Advanced AI Battle Interface
            </div>
        </div>
    );
};

export default LoadingScreen;
