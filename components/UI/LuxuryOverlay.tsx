import React, { useState } from 'react';
import { BlessingResponse } from '../../types';

interface LuxuryOverlayProps {
  onGenerateBlessing: () => Promise<void>;
  blessing: BlessingResponse | null;
  loading: boolean;
  isTreeFormed: boolean;
  onToggleTree: () => void;
}

export const LuxuryOverlay: React.FC<LuxuryOverlayProps> = ({ 
  onGenerateBlessing, 
  blessing, 
  loading,
  isTreeFormed,
  onToggleTree
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 z-10 text-[#D4AF37]">
      {/* Header */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div className="animate-fade-in-down">
            <h1 className="font-serif text-4xl md:text-6xl font-bold tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-b from-[#FFD700] to-[#8B6508] drop-shadow-lg">
                ARIX
            </h1>
            <p className="font-mono text-xs tracking-[0.5em] text-emerald-500 mt-2 uppercase">Signature Collection</p>
        </div>
        <div className="flex flex-col items-end gap-2">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="text-xs font-serif italic border border-[#D4AF37]/30 px-4 py-2 rounded-full hover:bg-[#D4AF37]/10 transition-colors bg-black/40 backdrop-blur-sm"
            >
                {isOpen ? 'Close Controls' : 'Experience Info'}
            </button>
            <button 
                onClick={onToggleTree}
                className={`text-xs font-serif tracking-widest border border-[#D4AF37]/30 px-4 py-2 rounded-full transition-all duration-700 bg-black/40 backdrop-blur-sm
                    ${!isTreeFormed ? 'text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'text-[#D4AF37] hover:bg-[#D4AF37]/10'}
                `}
            >
                {isTreeFormed ? 'DECONSTRUCT' : 'HARMONIZE'}
            </button>
        </div>
      </div>

      {/* Central Content / Result */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full max-w-2xl px-4 pointer-events-auto">
         {loading ? (
           <div className="flex flex-col items-center gap-4">
             <div className="w-16 h-16 border-t-2 border-b-2 border-[#FFD700] rounded-full animate-spin"></div>
             <p className="font-serif text-[#FFD700] tracking-widest text-sm animate-pulse">DIVINING WISH...</p>
           </div>
         ) : blessing ? (
           <div className="bg-black/60 backdrop-blur-md border border-[#D4AF37]/40 p-8 md:p-12 rounded-sm shadow-[0_0_50px_rgba(212,175,55,0.2)] animate-fade-in-up">
             <p className="font-serif text-2xl md:text-3xl italic leading-relaxed text-[#FFD700]">
               "{blessing.message}"
             </p>
             <div className="mt-6 flex justify-center">
                <span className="h-px w-24 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></span>
             </div>
             <p className="mt-4 font-mono text-xs text-emerald-400 uppercase tracking-widest">
               Mood: {blessing.mood}
             </p>
             <button 
                onClick={onGenerateBlessing}
                className="mt-8 text-xs hover:text-white transition-colors border-b border-[#D4AF37] pb-1"
             >
                Request Another
             </button>
           </div>
         ) : (
             null
         )}
      </div>

      {/* Footer Controls */}
      <div className="flex justify-center md:justify-end items-end pointer-events-auto">
        {!blessing && !loading && (
            <button
            onClick={onGenerateBlessing}
            className="group relative px-8 py-4 bg-transparent overflow-hidden rounded-none border border-[#D4AF37]/50 transition-all hover:border-[#FFD700] bg-black/20"
            >
            <div className="absolute inset-0 w-0 bg-[#D4AF37] transition-all duration-[250ms] ease-out group-hover:w-full opacity-20"></div>
            <span className="relative font-serif text-xl tracking-widest text-[#FFD700] group-hover:text-white transition-colors">
                RECEIVE BLESSING
            </span>
            </button>
        )}
      </div>

      {/* Info Panel (Conditional) */}
      {isOpen && (
          <div className="absolute top-24 right-8 w-64 bg-black/80 backdrop-blur-xl border-l border-[#D4AF37] p-6 text-sm font-serif text-gray-300 pointer-events-auto transition-all z-20">
              <h3 className="text-[#FFD700] mb-2 uppercase tracking-widest">The Arix Tree</h3>
              <p className="mb-4 leading-relaxed">
                  A digital sculpture exploring the intersection of procedural geometry and luxury aesthetics. 
                  Toggle "Deconstruct" to witness the entropy of the emerald stars.
              </p>
              <div className="text-xs text-emerald-600 font-mono">
                  v1.0.0 • REACT 19 • R3F
              </div>
          </div>
      )}
    </div>
  );
};