import { useState, useCallback } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Header from './components/header';
import PromptEkrani from './pages/PromptScreen';
import BaslamaEkrani from './pages/StartScreen';
import YuklemeEkrani from './pages/LoadingScreen';
import SonuclarEkrani from './pages/ResultsScreen';
import { Toaster, toast } from 'react-hot-toast';

export default function App() {
  const navigate = useNavigate();
  
  // Paylaşılan Veriler
  const [searchResults, setSearchResults] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);

  // AI Görsel Üretim Durumları (State Lifting)
  const [generatedImage, setGeneratedImage] = useState(null);
  const [promptHistory, setPromptHistory] = useState([]);

  // Baslama Ekranindan -> Prompt Ekranina Gecis
  const handleNavigateToPrompt = useCallback(() => {
    navigate('/prompt');
  }, [navigate]);

  // Baslama Ekranindan -> Doğrudan Düzenleme Ekranına Geçiş (Görsel Yükleyerek)
  const handleUploadToEdit = useCallback((file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setGeneratedImage(reader.result);
      setUploadedImageUrl(reader.result); // Senkronizasyon için
      navigate('/prompt');
    };
    reader.readAsDataURL(file);
  }, [navigate]);

  // Baslama Ekranindan -> Gorsel Yükleme ve Arama (File tabanli)
  const handleFileSearch = useCallback(async (file) => {
    navigate('/loading');
    setSearchResults(null);
    
    // Anında gösterim için local preview oluştur
    const localPreviewUrl = URL.createObjectURL(file);
    setUploadedImageUrl(localPreviewUrl);

    // AI ile düzenleme uyumluluğu için yüklenen dosyayı arka planda base64'e dönüştür
    const reader = new FileReader();
    reader.onloadend = () => {
      setGeneratedImage(reader.result);
    };
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/search', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Arama sırasında bir hata oluştu.');
      }

      setSearchResults(data.results);
      navigate('/results');
    } catch (err) {
      console.error('Arama hatası:', err);
      toast.error(err.message || 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.');
      navigate('/');
    }
  }, [navigate]);

  // Prompt Ekranindan -> Base64 Gorsel ile Arama
  const handleGeneratedImageSearch = useCallback(async (base64Data, mimeType) => {
    navigate('/loading');
    setSearchResults(null);
    
    // Anında gösterim için base64 preview oluştur
    const fullBase64Url = `data:${mimeType};base64,${base64Data}`;
    setUploadedImageUrl(fullBase64Url);
    setGeneratedImage(fullBase64Url); // State senkronizasyonu için

    try {
      const response = await fetch('/api/search-by-base64', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: mimeType
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Arama sırasında bir hata oluştu.');
      }

      setSearchResults(data.results);
      navigate('/results');
    } catch (err) {
      console.error('Base64 Arama hatası:', err);
      toast.error(err.message || 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.');
      navigate('/prompt');
    }
  }, [navigate]);

  // Yeni Arama -> Baslama Ekranina Donus (State'leri tamamen sıfırlar)
  const handleNewSearch = useCallback(() => {
    navigate('/');
    setSearchResults(null);
    setUploadedImageUrl(null);
    setGeneratedImage(null);
    setPromptHistory([]);
  }, [navigate]);

  // Görseli AI ile düzenlemek üzere Prompt ekranına geri dönüş (State'leri sıfırlamaz)
  const handleEditImage = useCallback(() => {
    navigate('/prompt');
    setSearchResults(null);
  }, [navigate]);

  // Header Logo Click
  const handleLogoClick = useCallback(() => {
    handleNewSearch();
  }, [handleNewSearch]);

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafc]">
      <Toaster position="top-center" />
      <Header onLogoClick={handleLogoClick} />

      <main className="flex-1 flex items-center justify-center relative selection:bg-indigo-100 selection:text-indigo-900 w-full h-full">
        <Routes>
          <Route path="/" element={
            <BaslamaEkrani 
              onNavigateToPrompt={handleNavigateToPrompt} 
              onFileSearch={handleFileSearch} 
              onUploadToEdit={handleUploadToEdit}
            />
          } />
          <Route path="/prompt" element={
            <PromptEkrani 
              onSearchGeneratedImage={handleGeneratedImageSearch} 
              currentImage={generatedImage}
              setCurrentImage={setGeneratedImage}
              promptHistory={promptHistory}
              setPromptHistory={setPromptHistory}
            />
          } />
          <Route path="/loading" element={
            <YuklemeEkrani />
          } />
          <Route path="/results" element={
            <SonuclarEkrani 
              uploadedImage={uploadedImageUrl}
              searchResults={searchResults}
              onNewSearch={handleNewSearch}
              onEditImage={handleEditImage}
            />
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

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

