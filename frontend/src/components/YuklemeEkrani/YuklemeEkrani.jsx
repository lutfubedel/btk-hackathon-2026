import { useState, useEffect } from 'react';
import { CheckCircle2, ShoppingBag, Shirt, Watch, Glasses, Gem, Camera, Monitor, Smartphone, Headphones, Book, Coffee, Scissors, Palmtree, Tent, Gamepad, Gift, Star, Zap, ShoppingCart, Umbrella, Music, Briefcase } from 'lucide-react';
import './YuklemeEkrani.css';

const STEPS = [
  { label: 'Görsel yükleniyor...' },
  { label: 'Uygun Sonuçlar Aranıyor' },
  { label: 'Sonuçlar Listeleniyor' },
];

const ICONS = [ShoppingBag, Shirt, Watch, Glasses, Gem, Camera, Monitor, Smartphone, Headphones, Book, Coffee, Scissors, Palmtree, Tent, Gamepad, Gift, Star, Zap, ShoppingCart, Umbrella, Music, Briefcase];

export default function YuklemeEkrani() {
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
    <div className="spinner-overlay" id="loading-spinner">
      {/* Arka Plan Katmanı */}
      <div className="spinner__bg">
        <div className="spinner__bg-grid"></div>
        <div className="spinner__bg-scan"></div>
        <div className="spinner__bg-orb" style={{ width: '300px', height: '300px', top: '20%', left: '15%' }}></div>
        <div className="spinner__bg-orb" style={{ width: '400px', height: '400px', bottom: '15%', right: '10%', animationDelay: '-1.5s' }}></div>
        <div className="spinner__bg-ring" style={{ animationDuration: '4s' }}></div>
        <div className="spinner__bg-ring" style={{ animationDuration: '5s', animationDelay: '-2s' }}></div>
        
        {/* Floating Cards & Tags */}
        <div className="spinner__bg-card" style={{ top: '25%', left: '8%', '--rot': '-8deg', animationDuration: '14s', animationDelay: '0s' }}>
          <div className="spinner__bg-card-img"></div>
          <div>
            <span className="spinner__bg-card-name">Tişört</span>
            <span className="spinner__bg-card-price">₺399</span>
          </div>
        </div>
        <div className="spinner__bg-card" style={{ bottom: '30%', right: '10%', '--rot': '6deg', animationDuration: '16s', animationDelay: '2s' }}>
          <div className="spinner__bg-card-img"></div>
          <div>
            <span className="spinner__bg-card-name">Çanta</span>
            <span className="spinner__bg-card-price">₺899</span>
          </div>
        </div>
        <div className="spinner__bg-tag" style={{ top: '15%', right: '20%', '--rot': '10deg', animationDuration: '12s', animationDelay: '1s' }}>Benzer Ürün</div>
        <div className="spinner__bg-tag" style={{ bottom: '20%', left: '15%', '--rot': '-5deg', animationDuration: '15s', animationDelay: '3s' }}>Eşleşme Bulundu</div>
      </div>

      {/* Modern Halka Spinner */}
      <div className="spinner__ring-container">
        <div className="spinner__ring-outer"></div>
        <svg className="spinner__ring-svg" viewBox="0 0 100 100">
          <circle className="spinner__ring-track" cx="50" cy="50" r="45"></circle>
          <circle className="spinner__ring-arc1" cx="50" cy="50" r="45"></circle>
          <circle className="spinner__ring-arc2" cx="50" cy="50" r="45"></circle>
        </svg>
        <div className="spinner__ring-center">
          <div className="spinner__ring-icon overflow-hidden">
            {(() => {
              const CurrentIcon = ICONS[iconIndex];
              return <CurrentIcon key={iconIndex} className="w-8 h-8 text-white animate-in fade-in zoom-in duration-300" strokeWidth={1.5} />;
            })()}
          </div>
        </div>
      </div>

      {/* İlerleme Noktaları */}
      <div className="spinner__dots">
        <div className="spinner__dot"></div>
        <div className="spinner__dot"></div>
        <div className="spinner__dot"></div>
      </div>
      <h3 className="spinner__title">
        <span className="gradient-text">Görseliniz Analiz Ediliyor</span>
      </h3>
      <p className="spinner__subtitle">Bu işlem birkaç saniye sürebilir</p>
      <div className="spinner__steps">
        {STEPS.map((step, index) => {
          let status = 'pending';
          if (index < currentStep) status = 'done';
          else if (index === currentStep) status = 'active';
          
          return (
            <div key={index} className={`spinner__step spinner__step--${status}`}>
              <div className="spinner__step-icon-custom">
                <CheckCircle2 
                  className={`w-6 h-6 transition-all duration-500 ${
                    status === 'done' 
                      ? 'text-[#FF5722] opacity-100 scale-110 drop-shadow-sm' 
                      : 'text-slate-300 opacity-30 scale-100'
                  }`} 
                  strokeWidth={status === 'done' ? 2.5 : 2}
                />
              </div>
              <span className="spinner__step-label">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
