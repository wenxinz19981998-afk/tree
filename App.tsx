import React, { useState, Suspense } from 'react';
import { Scene } from './components/Scene/Scene';
import { LuxuryOverlay } from './components/UI/LuxuryOverlay';
import { generateLuxuryBlessing } from './services/geminiService';
import { BlessingResponse } from './types';

function App() {
  const [blessing, setBlessing] = useState<BlessingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  // Default to true (Tree Shape) for the initial "Christmas" reveal
  const [isTreeFormed, setIsTreeFormed] = useState(true);

  const handleGenerateBlessing = async () => {
    setLoading(true);
    // Auto-form the tree if it's scattered when requesting a blessing
    if (!isTreeFormed) setIsTreeFormed(true);
    
    // Reset previous blessing for dramatic effect
    setBlessing(null);
    try {
      const result = await generateLuxuryBlessing();
      setBlessing(result);
    } catch (e) {
      console.error(e);
      // Fallback in case of API error handled in service, but double check here
      setBlessing({ message: "Silence is the greatest luxury.", mood: "mysterious" });
    } finally {
      setLoading(false);
    }
  };

  const toggleTreeState = () => {
    setIsTreeFormed(prev => !prev);
  };

  return (
    <div className="relative w-full h-screen bg-[#020403]">
      <Suspense fallback={
        <div className="absolute inset-0 flex items-center justify-center bg-black text-[#D4AF37] font-serif tracking-widest">
            LOADING EXPERIENCE...
        </div>
      }>
        {/* The 3D World */}
        <div className="absolute inset-0 z-0">
            <Scene isFormed={isTreeFormed} />
        </div>
        
        {/* The UI Layer */}
        <div className="absolute inset-0 z-10">
            <LuxuryOverlay 
                onGenerateBlessing={handleGenerateBlessing} 
                blessing={blessing}
                loading={loading}
                isTreeFormed={isTreeFormed}
                onToggleTree={toggleTreeState}
            />
        </div>
      </Suspense>
    </div>
  );
}

export default App;