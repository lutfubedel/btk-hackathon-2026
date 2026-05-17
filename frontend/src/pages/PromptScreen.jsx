import { useState, useRef, useEffect } from 'react';
import { ArrowRight, Hexagon, Layers, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function PromptScreen({ 
  onSearchGeneratedImage,
  currentImage,
  setCurrentImage,
  promptHistory,
  setPromptHistory
}) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [promptHistory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    
    setPromptHistory(prev => [...prev, prompt]);
    const currentPrompt = prompt;
    setPrompt('');
    setIsGenerating(true);
    
    try {
      // AI Gorsel Uretim API Cagirisi
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: currentPrompt,
          // Eger onceden uretilmis gorsel varsa, onu da gonder ki uzerinde degisiklik yapsin
          ...(currentImage ? { 
            imageBase64: currentImage.replace(/^data:image\/\w+;base64,/, ''),
            mimeType: 'image/png' 
          } : {})
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Görsel üretilirken bir hata oluştu.');
      }

      if (data.imageBase64) {
        setCurrentImage(`data:${data.mimeType || 'image/png'};base64,${data.imageBase64}`);
        toast.success('Görsel başarıyla oluşturuldu!');
      } else if (data.text) {
        toast.success(data.text, { icon: '🤖' });
      } else {
        throw new Error('Gemini geçerli bir yanıt dönmedi.');
      }
    } catch (err) {
      console.error('Generation Error:', err);
      toast.error(err.message || 'Görsel üretilirken bir hata oluştu.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSearchWeb = () => {
    if (currentImage) {
      // Base64 gorseli kullanarak internette arama baslat
      const base64Data = currentImage.replace(/^data:image\/\w+;base64,/, '');
      onSearchGeneratedImage(base64Data, 'image/png');
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center transition-all duration-700 ease-in-out relative min-h-[80vh] py-8 bg-slate-50/30">
      
      {/* Arka plan efektleri (Sade Modern Turuncu Tema) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute transition-all duration-1000 ease-in-out bg-orange-400/10 rounded-full blur-[100px] w-[45vw] h-[45vw] top-[5%] left-[25%]" />
        <div className="absolute transition-all duration-1000 ease-in-out bg-slate-400/10 rounded-full blur-[120px] w-[55vw] h-[55vw] bottom-[-10%] right-[-10%]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4wMikiLz48L3N2Zz4=')] mask-[radial-gradient(ellipse_70%_70%_at_50%_50%,#000_10%,transparent_100%)] opacity-100" />
      </div>

      <div className="w-full flex flex-col items-center transition-all duration-700 ease-out z-10 max-w-4xl mx-auto px-4">
        
        {/* Karşılama Metni / Başlık - Görsel yokken göster */}
        {!currentImage && !isGenerating && (
          <div className="text-center transition-all duration-700 ease-in-out flex flex-col items-center opacity-100 scale-100 mb-12 translate-y-0">
            <h1 className="text-4xl md:text-[3.5rem] font-extrabold text-slate-900 mb-6 tracking-tighter leading-tight">
              <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-500 to-orange-600">Aklınızdaki tasarımı</span>
              <br className="hidden md:block" />
              kelimelere dökün.
            </h1>
            <p className="text-slate-500/90 text-lg font-light max-w-md mx-auto leading-relaxed">
              Renkleri, dokuyu ve tarzınızı tarif edin. Sizi tam olarak yansıtan o parçayı birlikte bulalım.
            </p>
          </div>
        )}

        {/* Görsel Üretim Alanı */}
        {(currentImage || isGenerating) && (
          <div className="w-full transition-all duration-700 ease-in-out origin-top opacity-100 scale-100 mt-0 mb-8">
            <div className="relative w-full aspect-square max-w-md mx-auto group">
              
              {/* Yükleme (Pulse/Skeleton) Animasyonu */}
              {isGenerating && (
                <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-white/60 flex flex-col items-center justify-center animate-in fade-in duration-300">
                  <Hexagon className="w-12 h-12 text-orange-500 animate-[spin_3s_linear_infinite] mb-4" strokeWidth={1.5} />
                  <p className="text-slate-700 font-medium tracking-wide">
                    {currentImage ? 'Tasarım Güncelleniyor...' : 'Tasarım Oluşturuluyor...'}
                  </p>
                </div>
              )}
              
              {/* Üretilen Görsel */}
              {currentImage && (
                <div className="relative w-full h-full rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] border border-white/80 overflow-hidden bg-white transition-all duration-1000 transform scale-100 opacity-100">
                  <img 
                    src={currentImage} 
                    alt="AI Generated" 
                    className={`w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105 ${isGenerating ? 'scale-110 blur-sm opacity-50' : ''}`}
                  />
                  
                  {/* Ürünü Ara Butonu */}
                  <div className={`absolute bottom-6 left-0 right-0 px-6 flex justify-center z-20 transition-all duration-500 opacity-100 translate-y-0`}>
                    <button 
                      onClick={handleSearchWeb}
                      disabled={isGenerating}
                      className="w-full bg-slate-900/90 hover:bg-slate-900 text-white backdrop-blur-md px-4 py-3.5 rounded-2xl text-sm font-medium transition-all shadow-lg flex items-center justify-center gap-2 hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                      <Search className="w-4 h-4" />
                      <span>Ürünü Ara</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sohbet / Mesaj Alanı ve Input */}
        <div className={`w-full flex flex-col transition-all duration-700 ease-in-out max-w-xl mx-auto`}>
          
          {/* Birleştirilmiş Prompt Görünümü */}
          {promptHistory.length > 0 && (
            <div className="mb-5 flex justify-center w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
              <p className="text-sm font-medium text-slate-700 bg-white/60 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/80 shadow-sm text-center max-w-full wrap-break-words leading-relaxed">
                {promptHistory.join(' + ')}
              </p>
            </div>
          )}

          {/* Prompt Input Alanı */}
          <form onSubmit={handleSubmit} className="relative z-10 w-full">
            <div className={`relative flex items-center transition-all duration-500 bg-white/80 backdrop-blur-2xl border border-slate-200/60 p-2.5 rounded-[2.5rem] shadow-sm hover:shadow-md`}>
              <div className="pl-4 pr-2 text-orange-500 flex items-center justify-center">
                <Layers className="w-5 h-5 drop-shadow-sm" strokeWidth={2} />
              </div>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isGenerating}
                placeholder={!currentImage ? "Ne tasarlamak istersin? Detaylıca tarif et..." : "Görseli değiştirmek için yeni bir özellik yaz..."}
                className="w-full bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400 px-2 py-3 text-lg font-light disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!prompt.trim() || isGenerating}
                className="bg-orange-600 text-white p-3.5 rounded-full hover:bg-orange-700 transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 flex items-center justify-center group"
              >
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5" />
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
