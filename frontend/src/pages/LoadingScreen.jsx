import { useState, useEffect } from 'react';
import { CheckCircle2, ShoppingBag, Shirt, Watch, Glasses, Gem, Camera, Monitor, Smartphone, Headphones, Book, Coffee, Scissors, Palmtree, Tent, Gamepad, Gift, Star, Zap, ShoppingCart, Umbrella, Music, Briefcase } from 'lucide-react';

const STEPS = [
  { label: 'Görsel yükleniyor...' },
  { label: 'Uygun Sonuçlar Aranıyor' },
  { label: 'Sonuçlar Listeleniyor' },
];

const ICONS = [ShoppingBag, Shirt, Watch, Glasses, Gem, Camera, Monitor, Smartphone, Headphones, Book, Coffee, Scissors, Palmtree, Tent, Gamepad, Gift, Star, Zap, ShoppingCart, Umbrella, Music, Briefcase];

export default function LoadingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [iconIndex, setIconIndex] = useState(0);

  // Adımlar için Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Merkezdeki ikonları değiştirmek için Timer
  useEffect(() => {
    const iconTimer = setInterval(() => {
      setIconIndex((prev) => (prev + 1) % ICONS.length);
    }, 600);
    return () => clearInterval(iconTimer);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center py-12 px-6 overflow-hidden min-h-[500px] flex-1 animate-[fadeIn_0.3s_ease]" id="loading-spinner">
      {/* Arka Plan Katmanı */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-[0.45] bg-[radial-gradient(circle,rgba(255,87,34,0.15)_1px,transparent_1px)] bg-size-[32px_32px]"></div>
        <div className="absolute left-0 right-0 h-[2px] bg-linear-to-r from-transparent via-[rgba(255,87,34,0.75)] to-transparent animate-[scanLine_4s_ease-in-out_infinite] top-0 z-10"></div>
        <div className="absolute rounded-full bg-[radial-gradient(circle,rgba(255,87,34,0.1)_0%,transparent_70%)] animate-[orbPulse_2s_ease-in-out_infinite] pointer-events-none" style={{ width: '300px', height: '300px', top: '20%', left: '15%' }}></div>
        <div className="absolute rounded-full bg-[radial-gradient(circle,rgba(255,87,34,0.1)_0%,transparent_70%)] animate-[orbPulse_2s_ease-in-out_infinite] pointer-events-none" style={{ width: '400px', height: '400px', bottom: '15%', right: '10%', animationDelay: '-1.5s' }}></div>
        <div className="absolute rounded-full border border-[rgba(255,87,34,0.12)] animate-[ringExpand_ease-out_infinite] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ animationDuration: '4s' }}></div>
        <div className="absolute rounded-full border border-[rgba(255,87,34,0.12)] animate-[ringExpand_ease-out_infinite] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ animationDuration: '5s', animationDelay: '-2s' }}></div>
        
        {/* Floating Cards & Tags */}
        <div className="absolute bg-white/65 border border-[rgba(255,87,34,0.12)] rounded-[14px] px-3 py-2 backdrop-blur-xs flex items-center gap-2 whitespace-nowrap animate-[floatCard_linear_infinite] opacity-0 pointer-events-none" style={{ top: '25%', left: '8%', '--rot': '-8deg', animationDuration: '14s', animationDelay: '0s' }}>
          <div className="w-8 h-8 rounded-md bg-[#fff0ec] flex items-center justify-center text-[18px] shrink-0">👕</div>
          <div>
            <span className="text-[11px] font-bold text-[#1a1a2e] block">Tişört</span>
            <span className="text-[10px] font-extrabold text-[#ff5722] block">₺399</span>
          </div>
        </div>
        <div className="absolute bg-white/65 border border-[rgba(255,87,34,0.12)] rounded-[14px] px-3 py-2 backdrop-blur-xs flex items-center gap-2 whitespace-nowrap animate-[floatCard_linear_infinite] opacity-0 pointer-events-none" style={{ bottom: '30%', right: '10%', '--rot': '6deg', animationDuration: '16s', animationDelay: '2s' }}>
          <div className="w-8 h-8 rounded-md bg-[#fff0ec] flex items-center justify-center text-[18px] shrink-0">🎒</div>
          <div>
            <span className="text-[11px] font-bold text-[#1a1a2e] block">Çanta</span>
            <span className="text-[10px] font-extrabold text-[#ff5722] block">₺899</span>
          </div>
        </div>
        <div className="absolute bg-[rgba(255,243,238,0.82)] border border-[rgba(255,87,34,0.18)] rounded-full px-2.5 py-1 text-[11px] font-semibold text-[#c84215] animate-[tagFloat_ease-in-out_infinite] opacity-0 backdrop-blur-xs pointer-events-none" style={{ top: '15%', right: '20%', '--rot': '10deg', animationDuration: '12s', animationDelay: '1s' }}>Benzer Ürün</div>
        <div className="absolute bg-[rgba(255,243,238,0.82)] border border-[rgba(255,87,34,0.18)] rounded-full px-2.5 py-1 text-[11px] font-semibold text-[#c84215] animate-[tagFloat_ease-in-out_infinite] opacity-0 backdrop-blur-xs pointer-events-none" style={{ bottom: '20%', left: '15%', '--rot': '-5deg', animationDuration: '15s', animationDelay: '3s' }}>Eşleşme Bulundu</div>
      </div>

      {/* Modern Halka Spinner */}
      <div className="relative w-[120px] h-[120px] mb-7 z-10 shrink-0">
        <div className="absolute -inset-10 rounded-full border-1.5 border-[rgba(255,87,34,0.15)] animate-[outerPulse_2s_ease-in-out_infinite]"></div>
        <svg className="w-[120px] h-[120px] -rotate-90" viewBox="0 0 100 100">
          <circle className="fill-none stroke-[#eef0f4] stroke-6" cx="50" cy="50" r="45"></circle>
          <circle className="fill-none stroke-[#ff5722] stroke-6 stroke-linecap-round [stroke-dasharray:220_157] animate-[arcSpin1_1.4s_cubic-bezier(0.4,0,0.2,1)_infinite]" cx="50" cy="50" r="45"></circle>
          <circle className="fill-none stroke-[#e53935] stroke-3 stroke-linecap-round [stroke-dasharray:80_297] opacity-50 animate-[arcSpin2_1.4s_cubic-bezier(0.4,0,0.2,1)_infinite]" cx="50" cy="50" r="45"></circle>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[54px] h-[54px] rounded-[14px] bg-linear-to-br from-[#ff5722] to-[#e53935] flex items-center justify-center text-[24px] shadow-[0_6px_20px_rgba(255,87,34,0.35)] animate-[iconBob_2s_ease-in-out_infinite] overflow-hidden">
            {(() => {
              const CurrentIcon = ICONS[iconIndex];
              return <CurrentIcon key={iconIndex} className="w-8 h-8 text-white animate-in fade-in zoom-in duration-300" strokeWidth={1.5} />;
            })()}
          </div>
        </div>
      </div>

      {/* İlerleme Noktaları */}
      <div className="flex gap-1.5 mb-6 z-10">
        <div className="w-1.5 h-1.5 rounded-full bg-[#eef0f4] animate-[dotSequence_1.4s_ease-in-out_infinite] [animation-delay:0s]"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-[#eef0f4] animate-[dotSequence_1.4s_ease-in-out_infinite] [animation-delay:0.2s]"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-[#eef0f4] animate-[dotSequence_1.4s_ease-in-out_infinite] [animation-delay:0.4s]"></div>
      </div>
      <h3 className="text-[1.4rem] font-extrabold mb-1.5 tracking-[-0.02em] text-[#1a1a2e] z-10">
        <span className="gradient-text">Görseliniz Analiz Ediliyor</span>
      </h3>
      <p className="text-[0.9rem] text-[#9ca3b4] mb-9 z-10">Bu işlem birkaç saniye sürebilir</p>
      <div className="flex flex-col gap-2.5 w-full max-w-[400px] z-10">
        {STEPS.map((step, index) => {
          let status = 'pending';
          if (index < currentStep) status = 'done';
          else if (index === currentStep) status = 'active';
          
          const stepClass = status === 'active' 
            ? 'border-[rgba(255,87,34,0.35)] bg-[#fff3ee] shadow-[0_0_0_3px_rgba(255,87,34,0.07),0_2px_8px_rgba(255,87,34,0.08)]' 
            : status === 'done'
            ? 'border-[rgba(0,200,83,0.3)] bg-[#f0fdf4]'
            : 'border-[#eef0f4] bg-white';
            
          const labelClass = status === 'active'
            ? 'text-[#1a1a2e] font-bold'
            : status === 'done'
            ? 'text-[#00c853] font-semibold'
            : 'text-[#555770] font-medium';
          
          return (
            <div key={index} className={`flex items-center gap-3.5 py-3.5 px-4 border rounded-xl text-[0.875rem] shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-300 ${stepClass}`}>
              <div>
                <CheckCircle2 
                  className={`w-6 h-6 transition-all duration-500 ${
                    status === 'done' 
                      ? 'text-[#FF5722] opacity-100 scale-110 drop-shadow-sm' 
                      : 'text-slate-300 opacity-30 scale-100'
                  }`} 
                  strokeWidth={status === 'done' ? 2.5 : 2}
                />
              </div>
              <span className={labelClass}>{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
