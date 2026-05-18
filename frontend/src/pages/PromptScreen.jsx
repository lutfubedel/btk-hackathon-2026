import { useState, useRef, useEffect } from 'react';
import { ArrowRight, Hexagon, Layers, Search, Send, Bot, User, Sparkles, RefreshCw, ZoomIn, ArrowLeft, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

// ---------- Chatbot Mesaj Balonu ----------
function ChatBubble({ message }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
        isUser ? 'bg-orange-500 text-white' : 'bg-white border border-orange-100 text-orange-500'
      }`}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Balon */}
      <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
        isUser
          ? 'bg-orange-500 text-white rounded-tr-sm'
          : 'bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-sm'
      }`}>
        {message.content}
      </div>
    </div>
  );
}

// ---------- Typing Indicator ----------
function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-in fade-in duration-300">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-orange-100 flex items-center justify-center text-orange-500 shadow-sm">
        <Bot className="w-4 h-4" />
      </div>
      <div className="bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1">
        <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

// ---------- Ana Bileşen ----------
export default function PromptScreen({
  onSearchGeneratedImage,
  currentImage,
  setCurrentImage,
  promptHistory,
  setPromptHistory,
}) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Chatbot state
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  const messagesEndRef = useRef(null);
  const chatEndRef = useRef(null);
  const chatInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [promptHistory]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatLoading]);

  // İlk görsel üretildiğinde veya yüklendiğinde bot mesajı ekle
  useEffect(() => {
    if (currentImage && chatMessages.length === 0) {
      const isUploadedLocal = promptHistory.length === 0;
      setChatMessages([{
        role: 'assistant',
        content: isUploadedLocal 
          ? '✨ Görseliniz başarıyla yüklendi! Şimdi bu görsel üzerinde değiştirmek istediğiniz noktaları bana anlatabilirsiniz. Örneğin: "Arka planı tamamen beyaz yap" veya "Ürünü mermer zemin üzerine yerleştir". Her aşamada size yardımcı olacağım!'
          : '✨ Harika bir tasarım ürettik! Şimdi bu görsel üzerinde değiştirmek istediğin noktaları bana anlatabilirsin. Örneğin: "Arka planı tamamen beyaz yap" veya "Dokusunu deri kaplama ile değiştir". Her aşamada sana yardımcı olacağım!',
      }]);
    }
  }, [currentImage, promptHistory]);

  // ---------- İlk Görsel Üretimi ----------
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setPromptHistory(prev => [...prev, prompt]);
    const currentPrompt = prompt;
    setPrompt('');
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: currentPrompt,
          ...(currentImage ? {
            imageBase64: currentImage.replace(/^data:image\/\w+;base64,/, ''),
            mimeType: 'image/png',
          } : {}),
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        let errorMsg = 'Görsel üretilirken bir hata oluştu.';
        try {
          const parsed = JSON.parse(text);
          errorMsg = parsed.error || errorMsg;
        } catch (e) {}
        throw new Error(errorMsg);
      }

      const data = await response.json();

      if (!data.success) {
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

  // ---------- Chatbot Gönderimi ----------
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setIsChatLoading(true);

    // Kullanıcı mesajını ekle
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const response = await fetch('/api/chat-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          imageBase64: currentImage ? currentImage.replace(/^data:image\/\w+;base64,/, '') : null,
          mimeType: 'image/png',
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        let errorMsg = 'Bir hata oluştu.';
        try {
          const parsed = JSON.parse(text);
          errorMsg = parsed.error || errorMsg;
        } catch (e) {}
        throw new Error(errorMsg);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Bir hata oluştu.');
      }

      // Görseli güncelle (varsa)
      if (data.imageBase64) {
        setCurrentImage(`data:${data.mimeType || 'image/png'};base64,${data.imageBase64}`);
      }

      // Bot mesajını ekle
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply || (data.imageBase64 ? '✅ Görsel güncellendi!' : 'İşte cevabım!'),
      }]);

    } catch (err) {
      console.error('Chat Error:', err);
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: `❌ Üzgünüm, bir sorun oluştu: ${err.message}`,
      }]);
    } finally {
      setIsChatLoading(false);
      chatInputRef.current?.focus();
    }
  };

  const handleSearchWeb = () => {
    if (currentImage) {
      const base64Data = currentImage.replace(/^data:image\/\w+;base64,/, '');
      onSearchGeneratedImage(base64Data, 'image/png');
    }
  };

  // Yeni resim üretme sayfasına/durumuna geri dönmek için state'leri sıfırlar
  const handleResetToCreate = () => {
    setCurrentImage(null);
    setPromptHistory([]);
    setChatMessages([]);
  };

  // ========== GÖRSEL YOK: Sade Prompt Ekranı ==========
  if (!currentImage && !isGenerating) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[80vh] py-8 relative">
        {/* Arka plan efektleri - Modern Izgara */}
        <div className="fixed inset-0 pointer-events-none z-0 flex justify-center items-center overflow-hidden bg-slate-50/50">
          <div 
            className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3rem_3rem]"
            style={{ 
              maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, #000 20%, transparent 100%)', 
              WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, #000 20%, transparent 100%)' 
            }}
          />
          <div className="absolute w-[40vw] h-[40vw] rounded-full bg-orange-400/5 blur-[100px] top-[-10%] right-[-5%]" />
          <div className="absolute w-[40vw] h-[40vw] rounded-full bg-slate-400/10 blur-[100px] bottom-[-10%] left-[-5%]" />
        </div>

        <div className="z-10 flex flex-col items-center w-full max-w-2xl px-4">
          {/* Başlık */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-[3.5rem] font-extrabold text-slate-900 mb-5 tracking-tighter leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">
                Aklınızdaki tasarımı
              </span>
              <br className="hidden md:block" />
              kelimelere dökün.
            </h1>
            <p className="text-slate-500 text-lg font-light max-w-md mx-auto leading-relaxed">
              Renkleri, dokuyu ve tarzınızı tarif edin. Sizi tam olarak yansıtan o parçayı birlikte bulalım.
            </p>
          </div>

          {/* Prompt Input */}
          <form onSubmit={handleSubmit} className="w-full">
            <div className="relative flex items-center bg-white/80 backdrop-blur-2xl border border-slate-200/60 p-2.5 rounded-[2.5rem] shadow-sm hover:shadow-md transition-shadow">
              <div className="pl-4 pr-2 text-orange-500 flex items-center justify-center">
                <Layers className="w-5 h-5" strokeWidth={2} />
              </div>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ne tasarlamak istersin? Detaylıca tarif et..."
                className="w-full bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400 px-2 py-3 text-lg font-light"
              />
              <button
                type="submit"
                disabled={!prompt.trim()}
                className="bg-orange-600 text-white p-3.5 rounded-full hover:bg-orange-700 transition-all duration-300 disabled:opacity-40 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ========== GÖRSEL YÜKLENIYOR ==========
  if (isGenerating && !currentImage) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[80vh]">
        <div className="fixed inset-0 pointer-events-none z-0 flex justify-center items-center overflow-hidden bg-slate-50/50">
          <div 
            className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3rem_3rem]"
            style={{ 
              maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, #000 20%, transparent 100%)', 
              WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, #000 20%, transparent 100%)' 
            }}
          />
          <div className="absolute w-[40vw] h-[40vw] rounded-full bg-orange-400/5 blur-[100px] top-[-10%] right-[-5%]" />
        </div>
        <div className="z-10 flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/80 shadow-xl flex items-center justify-center">
            <Hexagon className="w-10 h-10 text-orange-500 animate-[spin_3s_linear_infinite]" strokeWidth={1.5} />
          </div>
          <p className="text-slate-700 font-semibold text-lg">Tasarım Oluşturuluyor...</p>
          <p className="text-slate-400 text-sm">Bu birkaç saniye sürebilir</p>
        </div>
      </div>
    );
  }

  // ========== GÖRSEL HAZIR: Split Layout ==========
  return (
    <>
      {/* Zoom Modal */}
      {isImageZoomed && (
        <div
          className="fixed inset-0 z-[1000] bg-black/50 backdrop-blur-md flex items-center justify-center p-6 cursor-zoom-out animate-in fade-in duration-200"
          onClick={() => setIsImageZoomed(false)}
        >
          <div className="relative max-w-[95vw] max-h-[85vh] md:max-w-[750px] md:max-h-[750px] flex items-center justify-center">
            <img
              src={currentImage}
              alt="Zoomed View"
              className="max-w-full max-h-full object-contain rounded-3xl shadow-2xl border border-white/10 animate-in zoom-in-95 duration-200"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsImageZoomed(false);
              }}
              className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white hover:text-orange-400 border border-white/10 backdrop-blur-md p-2.5 rounded-full transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95"
              title="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <div className="w-full flex flex-col lg:flex-row items-stretch lg:h-[calc(100vh-73px)] lg:overflow-hidden relative z-10">

        {/* ── SOL: Chatbot Arayüzü (Köşeleri dik, %30 genişlik, tam ekran yüksekliği) ── */}
        <div className="w-full lg:w-[30%] flex flex-col bg-white border-r border-slate-200 shadow-md">
          <div className="flex flex-col h-full w-full rounded-none overflow-hidden bg-white">
            
            {/* Chatbot Başlık */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-white">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-sm">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Tasarım Asistanı</p>
                <p className="text-xs text-slate-400">Yapay Zeka ile Anlık Düzenleme</p>
              </div>
            </div>

            {/* Mesaj Alanı */}
            <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4 custom-scrollbar bg-slate-50/30 bg-[radial-gradient(#f9731626_1.5px,transparent_1.5px)] [background-size:20px_20px]">
              {chatMessages.map((msg, i) => <ChatBubble key={i} message={msg} />)}
              {isChatLoading && <TypingIndicator />}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="border-t border-slate-100 p-4 bg-white">
              <form onSubmit={handleChatSubmit} className="flex items-center gap-2">
                <input
                  ref={chatInputRef}
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={isChatLoading || isGenerating}
                  placeholder='Aklınızdaki dokunuşu tarif edin...'
                  className="flex-1 bg-slate-50 border border-slate-200/60 rounded-2xl px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-orange-300 transition-all disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isChatLoading || isGenerating}
                  className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-2xl transition-all disabled:opacity-40 shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center"
                >
                  {isChatLoading ? (
                    <Hexagon className="w-5 h-5 animate-custom-spin" strokeWidth={1.5} />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* ── SAĞ: Görsel Alanı & Altındaki Butonlar (%70 genişlik, ortalanmış) ── */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8 lg:p-12 lg:overflow-y-auto relative bg-slate-50/30">
          {/* Izgara Deseni (Canvas Arka Planı) */}
          <div 
            className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none z-0"
            style={{ 
              maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, #000 20%, transparent 100%)', 
              WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, #000 20%, transparent 100%)' 
            }}
          />
          
          <div className="relative z-10 w-full max-w-[440px] aspect-square group">
            
            {/* Yükleme/Güncelleme overlay */}
            {(isGenerating || isChatLoading) && (
              <div className="absolute inset-0 z-20 bg-white/70 backdrop-blur-xl rounded-[2rem] flex flex-col items-center justify-center animate-in fade-in duration-300">
                <Hexagon className="w-12 h-12 text-orange-500 animate-custom-spin mb-3" strokeWidth={1.5} />
                <p className="text-slate-700 font-semibold text-sm">Tasarım Güncelleniyor...</p>
              </div>
            )}

            {/* Görsel */}
            {currentImage && (
              <div className="relative w-full h-full rounded-[2rem] overflow-hidden shadow-[0_20px_50px_-15px_rgba(0,0,0,0.12)] border border-slate-100 bg-white">
                <img
                  src={currentImage}
                  alt="AI Tasarım"
                  className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.02] ${(isGenerating || isChatLoading) ? 'blur-sm opacity-50 scale-105' : ''}`}
                />

                {/* Büyütme Butonu */}
                <button
                  onClick={() => setIsImageZoomed(true)}
                  className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white backdrop-blur-md p-2.5 rounded-full transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-sm"
                  title="Büyüt"
                >
                  <ZoomIn className="w-4.5 h-4.5" />
                </button>

                {/* Alt şık hafif gölge efekti */}
                <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-black/5 to-transparent pointer-events-none rounded-b-[2rem]" />
              </div>
            )}
          </div>

          {/* ── ALT BUTONLAR (Resmin hemen altında) ── */}
          <div className="relative z-10 w-full max-w-[440px] flex flex-col gap-3">
            {/* Ürünü Ara Butonu (TURUNCU) */}
            <button
              onClick={handleSearchWeb}
              disabled={isGenerating || isChatLoading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3.5 rounded-2xl text-sm font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              Ürünü İnternette Ara
            </button>

            {/* Yeni Resim Üret (Geri Dön) Butonu (SİYAH) */}
            <button
              onClick={handleResetToCreate}
              disabled={isGenerating || isChatLoading}
              className="w-full bg-slate-950 hover:bg-slate-900 text-white py-3.5 rounded-2xl text-sm font-semibold transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Yeni Resim Üret
            </button>
          </div>
        </div>

      </div>

      {/* Şık ve Turuncu Temaya Uygun Scrollbar, Spinner & Sayfa Kaydırmasını Engelleme CSS Inject */}
      <style dangerouslySetInnerHTML={{__html: `
        @media (min-width: 1024px) {
          html, body {
            overflow: hidden !important;
            height: 100vh !important;
          }
        }
        @keyframes custom-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-custom-spin {
          animation: custom-spin 2s linear infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #f97316; /* orange-500 */
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #ea580c; /* orange-600 */
        }
      `}} />
    </>
  );
}
