import { useState, useRef, useCallback } from 'react';
import { toast } from 'react-hot-toast';

export default function StartScreen({ onNavigateToPrompt, onUploadToEdit }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  const handleFile = useCallback((file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Desteklenmeyen dosya formatı. Lütfen JPG, PNG, WebP veya GIF yükleyin.');
      return;
    }

    if (file.size > MAX_SIZE) {
      toast.error('Dosya boyutu çok büyük. Maksimum 10MB desteklenir.');
      return;
    }

    if (onUploadToEdit) {
      onUploadToEdit(file);
    }
  }, [onUploadToEdit]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <section className="max-w-[780px] mx-auto my-14 px-6 animate-[fadeInUp_0.6s_ease-out] relative overflow-hidden sm:my-8" id="image-uploader">
      {/* Dinamik Arka Plan */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle,rgba(255,87,34,0.15)_1px,transparent_1px)] bg-size-[32px_32px]"></div>
        <div className="absolute left-0 right-0 h-[2px] bg-linear-to-r from-transparent via-[rgba(255,87,34,0.8)] to-transparent animate-[scanLine_4s_ease-in-out_infinite] top-0 z-10"></div>
        <div className="absolute rounded-full bg-[radial-gradient(circle,rgba(255,87,34,0.12)_0%,transparent_70%)] animate-[orbPulse_2s_ease-in-out_infinite] pointer-events-none" style={{ width: '300px', height: '300px', top: '10%', left: '20%' }}></div>
        <div className="absolute rounded-full bg-[radial-gradient(circle,rgba(255,87,34,0.12)_0%,transparent_70%)] animate-[orbPulse_2s_ease-in-out_infinite] pointer-events-none" style={{ width: '400px', height: '400px', bottom: '10%', right: '10%', animationDelay: '-2s' }}></div>
        <div className="absolute rounded-full border border-[rgba(255,87,34,0.15)] animate-[ringExpand_3s_ease-out_infinite] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: '500px', height: '500px' }}></div>
        <div className="absolute rounded-full border border-[rgba(255,87,34,0.15)] animate-[ringExpand_3s_ease-out_infinite] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: '700px', height: '700px', animationDelay: '-1s' }}></div>
        
        {/* Floating Cards & Tags */}
        <div className="absolute bg-white/70 border border-[rgba(255,87,34,0.12)] rounded-[16px] p-[10px] backdrop-blur-xs flex items-center gap-2 whitespace-nowrap animate-[floatCard_15s_linear_infinite] opacity-0 pointer-events-none" style={{ top: '60%', left: '10%', '--rot': '-5deg', animationDelay: '0s' }}>
          <div className="w-[36px] h-[36px] rounded-lg bg-[#fff0ec] flex items-center justify-center text-[20px] shrink-0">👟</div>
          <div>
            <span className="text-[11px] font-bold text-[#1a1a2e] block">Spor Ayakkabı</span>
            <span className="text-[10px] font-extrabold text-[#ff5722] block">₺1,299</span>
          </div>
        </div>
        <div className="absolute bg-white/70 border border-[rgba(255,87,34,0.12)] rounded-[16px] p-[10px] backdrop-blur-xs flex items-center gap-2 whitespace-nowrap animate-[floatCard_18s_linear_infinite] opacity-0 pointer-events-none" style={{ top: '80%', right: '15%', '--rot': '8deg', animationDelay: '2s' }}>
          <div className="w-[36px] h-[36px] rounded-lg bg-[#fff0ec] flex items-center justify-center text-[20px] shrink-0">⌚</div>
          <div>
            <span className="text-[11px] font-bold text-[#1a1a2e] block">Akıllı Saat</span>
            <span className="text-[10px] font-extrabold text-[#ff5722] block">₺3,499</span>
          </div>
        </div>
        <div className="absolute bg-[rgba(255,243,238,0.85)] border border-[rgba(255,87,34,0.2)] rounded-full px-2.5 py-1 text-[11px] font-semibold text-[#c84215] animate-[tagFloat_12s_linear_infinite] opacity-0 backdrop-blur-xs pointer-events-none" style={{ top: '40%', right: '25%', '--rot': '12deg', animationDelay: '1s' }}>%20 İndirim</div>
        <div className="absolute bg-[rgba(255,243,238,0.85)] border border-[rgba(255,87,34,0.2)] rounded-full px-2.5 py-1 text-[11px] font-semibold text-[#c84215] animate-[tagFloat_14s_linear_infinite] opacity-0 backdrop-blur-xs pointer-events-none" style={{ top: '70%', left: '20%', '--rot': '-8deg', animationDelay: '4s' }}>Yeni Sezon</div>
      </div>

      <div className="relative z-10 text-center mb-10">
        <h2 className="text-[2.5rem] font-extrabold mb-2.5 tracking-[-0.04em] text-[#1a1a2e] sm:text-[1.75rem]">
          <span className="gradient-text">Görselini Tasarla</span>, En Uygun Eşleşmeyi Yakala
        </h2>
        <p className="text-[1.1rem] text-[#555770] max-w-[520px] mx-auto leading-relaxed">Bulmak İstediğiniz Görseli Tasarlayın, Benzer Ürünleri Anında Keşfedin</p>
      </div>

      {/* Drop Zone */}
      <div
        className={`relative z-10 backdrop-blur-md border-[2.5px] border-dashed rounded-[24px] p-14 sm:p-10 text-center cursor-pointer transition-all duration-250 bg-linear-to-br from-[#ff5722] to-[#e53935] shadow-md group ${isDragging ? 'border-white shadow-[0_0_0_4px_rgba(255,87,34,0.2),0_10px_30px_rgba(255,87,34,0.1)]' : 'border-white/50 hover:border-white hover:shadow-[0_0_0_4px_rgba(255,87,34,0.2),0_10px_30px_rgba(255,87,34,0.1)]'}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        id="drop-zone"
      >
        <div className="relative z-10">
          <p className="text-[1.3rem] font-bold mb-1.5 text-white">
            Görselinizi Tasarlayın
          </p>
          <p className="text-[0.9rem] text-white/85 mb-5">
            veya dosya seçmek için tıklayın
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', width: '240px', margin: '0 auto' }}>
            <button 
              type="button" 
              className="inline-flex items-center gap-2 py-3 px-8 bg-white rounded-full font-bold text-[0.95rem] text-[#ff5722] transition-all duration-250 shadow-[0_6px_20px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(0,0,0,0.15)] cursor-pointer" 
              id="browse-button"
              style={{ width: '100%', justifyContent: 'center', cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                onNavigateToPrompt();
              }}
            >
              Tasarlamaya Başla
            </button>
            <button 
              type="button" 
              className="inline-flex items-center gap-2 py-3 px-8 bg-white rounded-full font-bold text-[0.95rem] text-[#ff5722] transition-all duration-250 shadow-[0_6px_20px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(0,0,0,0.15)] cursor-pointer" 
              id="add-product-button"
              style={{ width: '100%', justifyContent: 'center', cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              Ürün Ekle
            </button>
          </div>
          <p className="mt-4 text-[0.75rem] text-white/70">
            JPG, PNG, WebP, GIF • Maks. 10MB
          </p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
        id="file-input"
      />
    </section>
  );
}
