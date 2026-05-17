import { useState, useRef, useCallback } from 'react';
import { toast } from 'react-hot-toast';

export default function StartScreen({ onNavigateToPrompt, onFileSearch }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
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

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  }, []);

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

  const removeFile = useCallback(() => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleSearch = useCallback(() => {
    if (selectedFile && onFileSearch) {
      onFileSearch(selectedFile);
    }
  }, [selectedFile, onFileSearch]);

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

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
      {!selectedFile && (
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
                className="inline-flex items-center gap-2 py-3 px-8 bg-white rounded-full font-bold text-[0.95rem] text-[#ff5722] transition-all duration-250 shadow-[0_6px_20px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(0,0,0,0.15)]" 
                id="browse-button"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigateToPrompt();
                }}
              >
                Tasarlamaya Başla
              </button>
              <button 
                type="button" 
                className="inline-flex items-center gap-2 py-3 px-8 bg-white rounded-full font-bold text-[0.95rem] text-[#ff5722] transition-all duration-250 shadow-[0_6px_20px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(0,0,0,0.15)]" 
                id="add-product-button"
                style={{ width: '100%', justifyContent: 'center' }}
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
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
        id="file-input"
      />

      {/* Preview */}
      {selectedFile && preview && (
        <div className="mt-8 bg-white border border-[#eef0f4] rounded-[24px] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] animate-[scaleIn_0.35s_ease-out]" id="image-preview">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-[42px] h-[42px] rounded-xl bg-[#fff3ee] border border-[rgba(255,87,34,0.12)] flex items-center justify-center text-[20px]">🖼️</div>
              <div>
                <p className="text-[0.875rem] font-semibold max-w-[220px] truncate text-[#1a1a2e]">{selectedFile.name}</p>
                <p className="text-[0.75rem] text-[#9ca3b4]">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            <button
              className="w-[34px] h-[34px] rounded-lg bg-[#fef2f2] border border-[#fecaca] text-[#ef4444] flex items-center justify-center text-[14px] transition-all duration-150 hover:bg-[#fee2e2] hover:border-[#f87171] hover:scale-105"
              onClick={(e) => { e.stopPropagation(); removeFile(); }}
              title="Görseli kaldır"
              id="remove-image-button"
            >
              ✕
            </button>
          </div>
          <div className="rounded-2xl overflow-hidden bg-[#fafbfc] border border-[#eef0f4] flex items-center justify-center max-h-[340px]">
            <img
              src={preview}
              alt="Yüklenen görsel önizleme"
              className="max-h-[340px] w-auto object-contain"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 mt-5 w-full">
            <button
              className="flex items-center justify-center gap-3 flex-[2.3] py-[1.15rem] px-8 bg-linear-to-br from-[#ff5722] to-[#e53935] rounded-2xl font-extrabold text-[1.1rem] text-white transition-all duration-250 shadow-[0_8px_24px_rgba(255,87,34,0.3)] tracking-[0.01em] hover:not-disabled:translate-y-[-3px] hover:not-disabled:shadow-[0_14px_36px_rgba(255,87,34,0.4)] active:not-disabled:-translate-y-px disabled:opacity-55 disabled:cursor-not-allowed"
              onClick={handleSearch}
              id="search-button"
            >
              Benzer Ürünleri Ara
            </button>
            <button
              type="button"
              className="flex items-center justify-center flex-1 py-[1.15rem] px-8 bg-[#f8fafc] border-[1.5px] border-[#cbd5e1] rounded-2xl font-bold text-[1.1rem] text-[#475569] transition-all duration-250 cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:bg-[#f1f5f9] hover:border-[#94a3b8] hover:text-[#1e293b] hover:translate-y-[-3px] hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] active:-translate-y-px"
              onClick={(e) => { e.stopPropagation(); removeFile(); }}
              id="cancel-button"
            >
              İptal Et
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
