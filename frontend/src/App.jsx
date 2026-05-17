import { useState, useCallback } from 'react';
import Header from './components/header';
import PromptEkrani from './pages/PromptScreen';
import BaslamaEkrani from './pages/StartScreen';
import YuklemeEkrani from './pages/LoadingScreen';
import SonuclarEkrani from './pages/ResultsScreen';
import { Toaster, toast } from 'react-hot-toast';

export default function App() {
  // Ekran Durumu: 'baslama' | 'prompt' | 'yukleme' | 'sonuclar' | 'error'
  const [screen, setScreen] = useState('baslama');
  
  // Paylaşılan Veriler
  const [searchResults, setSearchResults] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);

  // AI Görsel Üretim Durumları (State Lifting)
  const [generatedImage, setGeneratedImage] = useState(null);
  const [promptHistory, setPromptHistory] = useState([]);

  // Baslama Ekranindan -> Prompt Ekranina Gecis
  const handleNavigateToPrompt = useCallback(() => {
    setScreen('prompt');
  }, []);

  // Baslama Ekranindan -> Gorsel Yükleme ve Arama (File tabanli)
  const handleFileSearch = useCallback(async (file) => {
    setScreen('yukleme');
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
      setScreen('sonuclar');
    } catch (err) {
      console.error('Arama hatası:', err);
      toast.error(err.message || 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.');
      setScreen('baslama');
    }
  }, []);

  // Prompt Ekranindan -> Base64 Gorsel ile Arama
  const handleGeneratedImageSearch = useCallback(async (base64Data, mimeType) => {
    setScreen('yukleme');
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
      setScreen('sonuclar');
    } catch (err) {
      console.error('Base64 Arama hatası:', err);
      toast.error(err.message || 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.');
      setScreen('prompt');
    }
  }, []);

  // Yeni Arama -> Baslama Ekranina Donus (State'leri tamamen sıfırlar)
  const handleNewSearch = useCallback(() => {
    setScreen('baslama');
    setSearchResults(null);
    setUploadedImageUrl(null);
    setGeneratedImage(null);
    setPromptHistory([]);
  }, []);

  // Görseli AI ile düzenlemek üzere Prompt ekranına geri dönüş (State'leri sıfırlamaz)
  const handleEditImage = useCallback(() => {
    setScreen('prompt');
    setSearchResults(null);
  }, []);

  // Header Logo Click
  const handleLogoClick = useCallback(() => {
    handleNewSearch();
  }, [handleNewSearch]);

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafc]">
      <Toaster position="top-center" />
      <Header onLogoClick={handleLogoClick} />

      <main className="flex-1 flex items-center justify-center relative selection:bg-indigo-100 selection:text-indigo-900 w-full h-full">

        {screen === 'baslama' && (
          <BaslamaEkrani 
            onNavigateToPrompt={handleNavigateToPrompt} 
            onFileSearch={handleFileSearch} 
          />
        )}

        {screen === 'prompt' && (
          <PromptEkrani 
            onSearchGeneratedImage={handleGeneratedImageSearch} 
            currentImage={generatedImage}
            setCurrentImage={setGeneratedImage}
            promptHistory={promptHistory}
            setPromptHistory={setPromptHistory}
          />
        )}

        {screen === 'yukleme' && (
          <YuklemeEkrani />
        )}

        {screen === 'sonuclar' && (
          <SonuclarEkrani 
            uploadedImage={uploadedImageUrl}
            searchResults={searchResults}
            onNewSearch={handleNewSearch}
            onEditImage={handleEditImage}
          />
        )}
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

