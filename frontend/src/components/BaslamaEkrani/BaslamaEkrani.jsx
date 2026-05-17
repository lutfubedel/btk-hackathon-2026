import { useState, useRef, useCallback } from 'react';
import './BaslamaEkrani.css';
import './UploaderBackground.css';

export default function BaslamaEkrani({ onNavigateToPrompt, onFileSearch }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  const handleFile = useCallback((file) => {
    setError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Desteklenmeyen dosya formatı. Lütfen JPG, PNG, WebP veya GIF yükleyin.');
      return;
    }

    if (file.size > MAX_SIZE) {
      setError('Dosya boyutu çok büyük. Maksimum 10MB desteklenir.');
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
    setError(null);
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
    <section className="uploader" id="image-uploader">
      {/* Dinamik Arka Plan */}
      <div className="uploader__bg">
        <div className="uploader__bg-grid"></div>
        <div className="uploader__bg-scan"></div>
        <div className="uploader__bg-orb" style={{ width: '300px', height: '300px', top: '10%', left: '20%' }}></div>
        <div className="uploader__bg-orb" style={{ width: '400px', height: '400px', bottom: '10%', right: '10%', animationDelay: '-2s' }}></div>
        <div className="uploader__bg-ring" style={{ width: '500px', height: '500px' }}></div>
        <div className="uploader__bg-ring" style={{ width: '700px', height: '700px', animationDelay: '-1s' }}></div>
        
        {/* Floating Cards & Tags */}
        <div className="uploader__bg-card" style={{ top: '60%', left: '10%', '--rot': '-5deg', animationDuration: '15s', animationDelay: '0s' }}>
          <div className="uploader__bg-card-img"></div>
          <div>
            <span className="uploader__bg-card-name">Spor Ayakkabı</span>
            <span className="uploader__bg-card-price">₺1,299</span>
          </div>
        </div>
        <div className="uploader__bg-card" style={{ top: '80%', right: '15%', '--rot': '8deg', animationDuration: '18s', animationDelay: '2s' }}>
          <div className="uploader__bg-card-img"></div>
          <div>
            <span className="uploader__bg-card-name">Akıllı Saat</span>
            <span className="uploader__bg-card-price">₺3,499</span>
          </div>
        </div>
        <div className="uploader__bg-tag" style={{ top: '40%', right: '25%', '--rot': '12deg', animationDuration: '12s', animationDelay: '1s' }}>%20 İndirim</div>
        <div className="uploader__bg-tag" style={{ top: '70%', left: '20%', '--rot': '-8deg', animationDuration: '14s', animationDelay: '4s' }}>Yeni Sezon</div>
      </div>

      <div className="uploader__heading">
        <h2>
          <span className="gradient-text">Görselini Tasarla</span>, En Uygun Eşleşmeyi Yakala
        </h2>
        <p>Bulmak İstediğiniz Görseli Tasarlayın, Benzer Ürünleri Anında Keşfedin</p>
      </div>

      {/* Drop Zone */}
      <div
        className={`uploader__dropzone ${isDragging ? 'uploader__dropzone--active' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        id="drop-zone"
      >
        <div className="uploader__dropzone-content">
          <p className="uploader__dropzone-title">
            Görselinizi Tasarlayın
          </p>
          <p className="uploader__dropzone-subtitle">
            veya dosya seçmek için tıklayın
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', width: '240px', margin: '0 auto' }}>
            <button 
              type="button" 
              className="uploader__browse-btn" 
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
              className="uploader__browse-btn" 
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
          <p className="uploader__formats">
            JPG, PNG, WebP, GIF • Maks. 10MB
          </p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="uploader__file-input"
        id="file-input"
      />

      {/* Error */}
      {error && (
        <div className="uploader__error" id="upload-error">
          {error}
        </div>
      )}

      {/* Preview */}
      {selectedFile && preview && (
        <div className="uploader__preview" id="image-preview">
          <div className="uploader__preview-header">
            <div className="uploader__preview-info">
              <div className="uploader__preview-icon"></div>
              <div>
                <p className="uploader__preview-name">{selectedFile.name}</p>
                <p className="uploader__preview-size">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            <button
              className="uploader__preview-remove"
              onClick={(e) => { e.stopPropagation(); removeFile(); }}
              title="Görseli kaldır"
              id="remove-image-button"
            >
              ✕
            </button>
          </div>
          <div className="uploader__preview-image-wrapper">
            <img
              src={preview}
              alt="Yüklenen görsel önizleme"
              className="uploader__preview-image"
            />
          </div>

          {/* Search Button */}
          <button
            className="uploader__search-btn"
            onClick={handleSearch}
            id="search-button"
          >
            Benzer Ürünleri Ara
          </button>
        </div>
      )}
    </section>
  );
}
