import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Loader2, Search, ExternalLink, Hexagon, Layers } from 'lucide-react';

export default function App() {
  // State Yönetimi
  const [prompt, setPrompt] = useState('');
  const [promptHistory, setPromptHistory] = useState([]);
  const [currentImage, setCurrentImage] = useState(null);
  const [products, setProducts] = useState([]);
  
  // layoutMode: 'center' (başlangıç) | 'result' (görsel geldi) | 'split' (internette ara)
  const [layoutMode, setLayoutMode] = useState('center'); 
  const [isGenerating, setIsGenerating] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Otomatik mesaj kaydırma
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [promptHistory]);

  // Mock Veriler
  const shoeImages = [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1595461135849-bf08893fdc2c?q=80&w=1000&auto=format&fit=crop"
  ];

  const mockProducts = [
    { id: 1, title: "Nike Air Max 270 Fütüristik Tasarım", price: "3.499 TL", store: "Trendyol", storeColor: "#F27A1A", image: shoeImages[0] },
    { id: 2, title: "Nike Air Zoom Pegasus Özel Seri", price: "2.899 TL", store: "Hepsiburada", storeColor: "#FF6000", image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=500&auto=format&fit=crop" },
    { id: 3, title: "Turuncu Detaylı Spor Ayakkabı", price: "1.799 TL", store: "Trendyol", storeColor: "#F27A1A", image: shoeImages[1] },
    { id: 4, title: "Neon Bağcıklı Koşu Ayakkabısı", price: "2.100 TL", store: "Hepsiburada", storeColor: "#FF6000", image: shoeImages[2] },
    { id: 5, title: "Nike Air Force 1 Turuncu", price: "4.299 TL", store: "Trendyol", storeColor: "#F27A1A", image: shoeImages[3] },
    { id: 6, title: "Blazer Mid '77 Vintage Sürüm", price: "3.199 TL", store: "Hepsiburada", storeColor: "#FF6000", image: "https://images.unsplash.com/photo-1579338559194-a162d19bf842?q=80&w=500&auto=format&fit=crop" },
  ];

  // Prompt Gönderme İşlemi
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    
    setPromptHistory(prev => [...prev, prompt]);
    setPrompt('');
    setIsGenerating(true);
    
    if (layoutMode === 'center') {
      setLayoutMode('result');
    }
    
    // API İstediğini Simüle Et (2 Saniye)
    setTimeout(() => {
      // Mesaj sayısına göre farklı bir görsel seçelim ki güncellendiği anlaşılsın
      const nextImage = shoeImages[promptHistory.length % shoeImages.length];
      setCurrentImage(nextImage);
      setIsGenerating(false);
    }, 2000);
  };

  // İnternette Ara Butonu İşlemi
  const handleSearchWeb = () => {
    setLayoutMode('split');
    
    // Ürün Arama API İsteğini Simüle Et (1.5 Saniye)
    setTimeout(() => {
      setProducts(mockProducts);
    }, 1500);
  };

  // Yeni Arama / Sıfırlama İşlemi
  const handleReset = () => {
    setPrompt('');
    setPromptHistory([]);
    setLayoutMode('center');
    setCurrentImage(null);
    setProducts([]);
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-[#fafafc] text-slate-800 font-sans overflow-hidden flex items-center justify-center relative selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Modern, Dinamik Arka Plan Efektleri */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className={`absolute transition-all duration-1000 ease-in-out bg-gradient-to-br from-indigo-400/20 to-purple-500/20 rounded-full blur-[100px]
          ${layoutMode === 'center' ? 'w-[45vw] h-[45vw] top-[5%] left-[25%]' : 'w-[25vw] h-[25vw] top-[-10%] left-[-5%] opacity-60'}`} 
        />
        <div className={`absolute transition-all duration-1000 ease-in-out bg-gradient-to-tl from-rose-400/20 to-orange-400/20 rounded-full blur-[120px]
          ${layoutMode === 'center' ? 'w-[55vw] h-[55vw] bottom-[-10%] right-[-10%]' : 'w-[35vw] h-[35vw] bottom-[-15%] right-[-10%] opacity-60'}`} 
        />
        <div className="absolute top-[35%] left-[15%] w-[60%] h-[60%] bg-gradient-to-tr from-cyan-400/10 to-blue-500/10 rounded-full blur-[120px]" />
        
        {/* Subtle Nokta Deseni (Dot Grid) overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMTUsMjMsNDIsMC4wNSkiLz48L3N2Zz4=')] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_10%,transparent_100%)] opacity-100" />
      </div>

      {/* Ana Taşıyıcı Konteyner - Düzen Değişikliği Animasyonu */}
      <div 
        className={`w-full max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-center transition-all duration-700 ease-in-out h-screen py-12 z-10 ${
          layoutMode === 'split' ? 'gap-12' : 'gap-0'
        }`}
      >
        
        {/* SOL / MERKEZ PANEL (Görsel ve Prompt Alanı) */}
        <div 
          className={`flex flex-col items-center justify-center transition-all duration-700 ease-in-out relative
            ${layoutMode === 'split' ? 'w-full md:w-[40%] items-start' : 'w-full md:w-[60%] lg:w-[50%]'}
          `}
        >
          {/* İçerik Sarıcı - İlk aramada yukarı kayar */}
          <div 
            className={`w-full flex flex-col transition-all duration-700 ease-out
              ${layoutMode === 'center' ? 'translate-y-4 items-center' : 'translate-y-0'}
              ${layoutMode === 'split' ? 'items-start' : 'items-center'}
            `}
          >

            {/* Karşılama Metni / Başlık */}
            <div className={`text-center transition-all duration-700 ease-in-out flex flex-col items-center
              ${layoutMode === 'center' ? 'opacity-100 scale-100 mb-12 translate-y-0' : 'opacity-0 scale-95 h-0 overflow-hidden mb-0 -translate-y-10 pointer-events-none'}
            `}>
              <h1 className="text-4xl md:text-5xl font-serif text-slate-800 mb-5 tracking-tight leading-tight">
                Aklınızdaki tasarımı <br className="hidden md:block" />kelimelere dökün.
              </h1>
              <p className="text-slate-500/90 text-lg font-light max-w-md mx-auto leading-relaxed">
                Renkleri, dokuyu ve tarzınızı tarif edin. Sizi tam olarak yansıtan o parçayı birlikte bulalım.
              </p>
            </div>
            
            {/* Görsel Üretim Alanı */}
            <div className={`w-full transition-all duration-700 ease-in-out origin-top
              ${layoutMode === 'center' ? 'opacity-0 scale-95 h-0 overflow-hidden mb-0' : 'opacity-100 scale-100 mt-0 mb-6'}
            `}>
              <div className="relative w-full aspect-square max-w-md mx-auto group">
                
                {/* Yükleme (Pulse/Skeleton) Animasyonu */}
                {isGenerating && (
                  <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-white/60 flex flex-col items-center justify-center animate-in fade-in duration-300">
                    <Hexagon className="w-12 h-12 text-slate-800 animate-[spin_3s_linear_infinite] mb-4" strokeWidth={1.5} />
                    <p className="text-slate-700 font-medium tracking-wide">Tasarım Güncelleniyor...</p>
                  </div>
                )}
                
                {/* Üretilen Görsel */}
                {(layoutMode === 'result' || layoutMode === 'split') && currentImage && (
                  <div className="relative w-full h-full rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] border border-white/80 overflow-hidden bg-white transition-all duration-1000 transform scale-100 opacity-100">
                    <img 
                      src={currentImage} 
                      alt="AI Generated" 
                      className={`w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105 ${isGenerating ? 'scale-110 blur-sm' : ''}`}
                    />
                    
                    {/* İnternette Ara Butonu (Sadece Result aşamasında görünür) */}
                    <div className={`absolute bottom-6 left-0 right-0 px-6 flex justify-center z-20 transition-all duration-500 ${layoutMode === 'split' ? 'opacity-0 translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
                      <button 
                        onClick={handleSearchWeb}
                        className="w-full bg-slate-900/90 hover:bg-slate-900 text-white backdrop-blur-md px-4 py-3.5 rounded-2xl text-sm font-medium transition-all shadow-[0_10px_20px_-10px_rgba(15,23,42,0.5)] hover:shadow-[0_15px_30px_-10px_rgba(15,23,42,0.6)] flex items-center justify-center gap-2 hover:-translate-y-1"
                      >
                        <Search className="w-4 h-4" />
                        <span>İnternette Ara</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sohbet / Mesaj Alanı ve Input */}
            <div className={`w-full flex flex-col transition-all duration-700 ease-in-out
              ${layoutMode === 'center' ? 'max-w-xl' : 'max-w-md'}
              ${layoutMode === 'split' ? 'max-w-full md:max-w-md' : 'mx-auto'}
            `}>
              
              {/* Birleştirilmiş Prompt Görünümü */}
              {promptHistory.length > 0 && (
                <div className="mb-5 flex justify-center w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <p className="text-sm font-medium text-slate-700 bg-white/60 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/80 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)] text-center max-w-full break-words leading-relaxed">
                    {promptHistory.join(' + ')}
                  </p>
                </div>
              )}

              {/* Prompt Input Alanı */}
              <form onSubmit={handleSubmit} className="relative z-10 w-full">
                <div className={`relative flex items-center transition-all duration-500 bg-white/60 backdrop-blur-2xl border border-white/80 p-2.5
                  ${layoutMode === 'center' 
                    ? 'rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.12)]' 
                    : 'rounded-[2rem] shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)]'}
                `}>
                  <div className="pl-4 pr-2 text-indigo-500 flex items-center justify-center">
                    <Layers className="w-5 h-5 drop-shadow-sm" strokeWidth={2} />
                  </div>
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={isGenerating}
                    placeholder={layoutMode === 'center' ? "Ne aramak istersin? Detaylıca tarif et..." : "Görseli değiştirmek için yeni bir özellik yaz..."}
                    className="w-full bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-400 px-2 py-3 text-lg font-light disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!prompt.trim() || isGenerating}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-3.5 rounded-full hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 shadow-[0_8px_20px_-6px_rgba(99,102,241,0.6)] hover:shadow-[0_12px_25px_-8px_rgba(99,102,241,0.8)] transform hover:scale-105 active:scale-95 flex items-center justify-center group"
                  >
                    <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>

        {/* SAĞ PANEL (Ürün Listesi - %60) */}
        <div 
          className={`h-full flex flex-col transition-all duration-700 ease-in-out overflow-hidden relative z-10
            ${layoutMode === 'split' ? 'w-full md:w-[60%] opacity-100 scale-100 translate-x-0' : 'w-0 opacity-0 scale-95 translate-x-12 absolute right-0 pointer-events-none'}
          `}
        >
          <div className="h-full w-full pl-0 md:pl-10 py-6 flex flex-col">
            
            {/* Ürünler Başlık ve Yeni Arama Butonu */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-light text-slate-800 tracking-tight">Benzer Ürünler</h2>
                <p className="text-slate-500 mt-1 font-light">Tasarımınıza en yakın gerçek ürünler bulundu.</p>
              </div>
              <button 
                onClick={handleReset}
                className="text-sm font-medium text-slate-600 hover:text-indigo-600 flex items-center gap-2 bg-white/60 backdrop-blur-md px-4 py-2.5 rounded-2xl transition-all shadow-sm border border-slate-200/50 hover:shadow-md"
              >
                <Search className="w-4 h-4" />
                Yeni Arama
              </button>
            </div>

            {/* Antigravity Ürün Kartları Grid'i */}
            <div className="flex-1 overflow-y-auto pr-2 pb-20 custom-scrollbar">
              {products.length === 0 ? (
                // Arama Skeleton Animasyonu
                <div className="w-full h-[60vh] flex flex-col items-center justify-center">
                  <Hexagon className="w-8 h-8 text-slate-400 animate-[spin_3s_linear_infinite] mb-4" />
                  <p className="text-slate-500 font-light">Mağazalar taranıyor...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
                  {products.map((product, idx) => (
                    <a 
                      key={product.id}
                      href="#"
                      className="group bg-white/40 backdrop-blur-xl rounded-[2rem] p-3 border border-white/60 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 ease-out flex flex-col"
                      style={{ transitionDelay: `${idx * 50}ms` }}
                    >
                      {/* Ürün Resmi */}
                      <div className="relative w-full aspect-square rounded-[1.5rem] overflow-hidden mb-4 bg-slate-100 shadow-inner">
                        <img 
                          src={product.image} 
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 shadow-sm">
                          <ExternalLink className="w-4 h-4 text-slate-700" />
                        </div>
                      </div>
                      
                      {/* Ürün Detayları */}
                      <div className="px-3 pb-3 flex-1 flex flex-col">
                        <h3 className="font-medium text-slate-800 line-clamp-2 leading-snug mb-3 group-hover:text-indigo-600 transition-colors">
                          {product.title}
                        </h3>
                        <div className="mt-auto flex items-center justify-between">
                          <span className="font-semibold text-lg text-slate-900 tracking-tight">{product.price}</span>
                          <span 
                            className="text-xs font-bold px-3 py-1.5 rounded-full text-white shadow-sm tracking-wide"
                            style={{ backgroundColor: product.storeColor }}
                          >
                            {product.store}
                          </span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Şeffaf scrollbar için CSS Inject */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(203, 213, 225, 0.4); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(148, 163, 184, 0.8); }
      `}} />
    </div>
  );
}

