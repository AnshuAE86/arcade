
import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface AdUnitProps {
  className?: string;
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
  label?: string;
}

const AdUnit: React.FC<AdUnitProps> = ({ 
  className = '', 
  slot = "1234567890", 
  format = "auto",
  label = "Advertisement"
}) => {
  const initialized = useRef(false);

  useEffect(() => {
    // Basic protection against React StrictMode double-invocation issues
    if (!initialized.current) {
        try {
            if (window.adsbygoogle) {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
                initialized.current = true;
            }
        } catch (e) {
            console.error("AdSense push error", e);
        }
    }
  }, []);

  return (
    <div className={`w-full flex flex-col items-center my-6 ${className}`}>
        <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mb-2 self-center">{label}</span>
        <div className="w-full bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden min-h-[120px] flex items-center justify-center relative group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-5"></div>
            
            {/* Visual Placeholder for layout purposes (AdSense usually injects iframe over this) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <span className="text-slate-700 font-black font-orbitron text-xs tracking-widest opacity-30 group-hover:opacity-50 transition-opacity">
                     GOOGLE AD
                 </span>
            </div>
            
            {/* Actual AdSense Tag */}
            <ins className="adsbygoogle"
                style={{ display: 'block', width: '100%', textAlign: 'center' }}
                data-ad-client="ca-pub-0000000000000000" // Placeholder Client ID
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive="true"></ins>
        </div>
    </div>
  );
};

export default AdUnit;
