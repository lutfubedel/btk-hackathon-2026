import { useState, useRef, useEffect } from 'react';
import { ArrowRight, Hexagon, Layers, Search, Send, ScanEye, User, Sparkles, RefreshCw, ZoomIn, ArrowLeft, X, Edit3, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

// ---------- Chatbot Mesaj Balonu ----------
function ChatBubble({ message }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      {/* Avatar */}
      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
        isUser ? 'bg-orange-500 text-white' : 'bg-white border border-orange-100 text-orange-500'
      }`}>
        {isUser ? <User className="w-4 h-4" /> : <ScanEye className="w-4 h-4" />}
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
      <div className="shrink-0 w-8 h-8 rounded-full bg-white border border-orange-100 flex items-center justify-center text-orange-500 shadow-sm">
        <ScanEye className="w-4 h-4" />
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
  chatMessages,
  setChatMessages,
}) {
  const API_URL = import.meta.env.VITE_API_URL || '';
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Chatbot state
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  // Masking State
  const [isMaskMode, setIsMaskMode] = useState(false);
  const [brushSize, setBrushSize] = useState(40);
  const [maskPrompt, setMaskPrompt] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [imageAspectRatio, setImageAspectRatio] = useState(1);
  
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

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
          ? 'Görseliniz başarıyla yüklendi! Şimdi bu görsel üzerinde değiştirmek istediğiniz noktaları bana anlatabilirsiniz. Örneğin: "Arka planı tamamen beyaz yap" veya "Ürünü mermer zemin üzerine yerleştir". Her aşamada size yardımcı olacağım!'
          : 'Harika bir tasarım ürettik! Şimdi bu görsel üzerinde değiştirmek istediğin noktaları bana anlatabilirsin. Örneğin: "Arka planı tamamen beyaz yap" veya "Dokusunu deri kaplama ile değiştir". Her aşamada sana yardımcı olacağım!',
      }]);
    }
  }, [currentImage, promptHistory, chatMessages, setChatMessages]);

  // ---------- Masking Canvas & En-Boy Oranı Senkronizasyonu ----------
  useEffect(() => {
    if (currentImage) {
      const img = new Image();
      img.onload = () => {
        const ratio = img.naturalWidth / img.naturalHeight;
        setImageAspectRatio(ratio);
        
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.strokeStyle = 'rgba(249, 115, 22, 0.6)'; // orange-500 yarı saydam
          
          // Ekranda 440px genişlikte görüntüleneceği için fırça boyutunu tuvalin gerçek çözünürlüğüne oranla
          const scaledBrushSize = (brushSize / 440) * img.naturalWidth;
          ctx.lineWidth = scaledBrushSize;
          ctxRef.current = ctx;
        }
      };
      img.src = currentImage;
    }
  }, [currentImage, isMaskMode, brushSize]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || !ctxRef.current) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // UI boyutundan gerçek çözünürlüğe ölçekleme
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(x * scaleX, y * scaleY);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || !ctxRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    ctxRef.current.lineTo(x * scaleX, y * scaleY);
    ctxRef.current.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing || !ctxRef.current) return;
    ctxRef.current.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas && ctxRef.current) {
      ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Canvas'tan siyah arka plan üzerine beyaz fırça darbeleri olan mask base64 üretimi
  const generateMaskBase64 = () => {
    const originalCanvas = canvasRef.current;
    if (!originalCanvas) return null;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = originalCanvas.width;
    exportCanvas.height = originalCanvas.height;
    const exportCtx = exportCanvas.getContext('2d', { willReadFrequently: true });

    // Siyah arkaplan ve üzerine orijinal çizimi ekle
    exportCtx.fillStyle = 'black';
    exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    exportCtx.drawImage(originalCanvas, 0, 0);
    
    // Yarı saydam turuncu fırça izlerini katı beyaza dönüştür
    const imageData = exportCtx.getImageData(0, 0, exportCanvas.width, exportCanvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      // Piksel tam siyah değilse (yani fırça izi varsa)
      if (data[i] > 0 || data[i+1] > 0 || data[i+2] > 0) {
        data[i] = 255;     // R
        data[i+1] = 255;   // G
        data[i+2] = 255;   // B
        data[i+3] = 255;   // Alpha
      }
    }
    exportCtx.putImageData(imageData, 0, 0);

    return exportCanvas.toDataURL('image/png').replace(/^data:image\/\w+;base64,/, '');
  };

  // ---------- Inpainting API Gönderimi ----------
  const handleInpaintSubmit = async () => {
    if (!maskPrompt.trim() || isGenerating) return;

    const maskBase64 = generateMaskBase64();
    if (!maskBase64) return;

    const currentMaskPrompt = maskPrompt;
    setMaskPrompt('');
    setIsGenerating(true);
    setIsMaskMode(false); // Düzenleme sırasında mask modunu kapat
    
    try {
      const response = await fetch(API_URL + '/api/inpaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: currentMaskPrompt,
          imageBase64: currentImage.replace(/^data:image\/\w+;base64,/, ''),
          maskBase64: maskBase64,
          mimeType: 'image/png',
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        let errorMsg = 'Görsel düzenlenirken hata oluştu.';
        try {
          const parsed = JSON.parse(text);
          errorMsg = parsed.error || errorMsg;
        } catch (e) {}
        throw new Error(errorMsg);
      }

      const data = await response.json();
      if (!data.success) throw new Error(data.error);

      setCurrentImage(`data:${data.mimeType || 'image/png'};base64,${data.imageBase64}`);
      toast.success('Bölgesel düzenleme başarıyla uygulandı!');
      
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: `"${currentMaskPrompt}" isteğine göre bölgesel düzenleme uygulandı!`,
      }]);

    } catch (err) {
      console.error('Inpaint Error:', err);
      toast.error(err.message || 'Bölgesel düzenleme sırasında bir hata oluştu.');
    } finally {
      setIsGenerating(false);
    }
  };

  // ---------- İlk Görsel Üretimi ----------
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setPromptHistory(prev => [...prev, prompt]);
    const currentPrompt = prompt;
    setPrompt('');
    setIsGenerating(true);

    try {
      const response = await fetch(API_URL + '/api/generate', {
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
      const response = await fetch(API_URL + '/api/chat-edit', {
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
        content: data.reply || (data.imageBase64 ? 'Görsel güncellendi!' : 'İşte cevabım!'),
      }]);

    } catch (err) {
      console.error('Chat Error:', err);
      toast.error(err.message, { duration: 4000 });
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: `❌ ${err.message}`,
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
            className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-size-[3rem_3rem]"
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
              <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-500 to-orange-600">
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
            className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-size-[3rem_3rem]"
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
          className="fixed inset-0 z-1000 bg-black/50 backdrop-blur-md flex items-center justify-center p-6 cursor-zoom-out animate-in fade-in duration-200"
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
              <div className="w-9 h-9 rounded-full bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-sm">
                <ScanEye className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Tasarım Asistanı</p>
                <p className="text-xs text-slate-400">Yapay Zeka ile Anlık Düzenleme</p>
              </div>
            </div>

            {/* Mesaj Alanı */}
            <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4 custom-scrollbar bg-slate-50/30 bg-[radial-gradient(#f9731626_1.5px,transparent_1.5px)] bg-size-[20px_20px]">
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
            className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-size-[3rem_3rem] pointer-events-none z-0"
            style={{ 
              maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, #000 20%, transparent 100%)', 
              WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, #000 20%, transparent 100%)' 
            }}
          />
          
          <div className="relative z-10 w-full max-w-[440px] group transition-all duration-500 ease-out" style={{ aspectRatio: imageAspectRatio }}>
            
            {/* Yükleme/Güncelleme overlay */}
            {(isGenerating || isChatLoading) && (
              <div className="absolute inset-0 z-20 bg-white/70 backdrop-blur-xl rounded-4xl flex flex-col items-center justify-center animate-in fade-in duration-300">
                <Hexagon className="w-12 h-12 text-orange-500 animate-custom-spin mb-3" strokeWidth={1.5} />
                <p className="text-slate-700 font-semibold text-sm">Tasarım Güncelleniyor...</p>
              </div>
            )}

            {/* Görsel */}
            {currentImage && (
              <div className="relative w-full h-full rounded-4xl overflow-hidden shadow-[0_20px_50px_-15px_rgba(0,0,0,0.12)] border border-slate-100 bg-white">
                <img
                  src={currentImage}
                  alt="AI Tasarım"
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out ${(!isMaskMode && !isGenerating && !isChatLoading) ? 'group-hover:scale-[1.02]' : ''} ${(isGenerating || isChatLoading) ? 'blur-sm opacity-50 scale-105' : ''}`}
                  draggable="false"
                />

                {/* Masking Katmanı (Canvas) */}
                {isMaskMode && (
                  <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseOut={stopDrawing}
                    className="absolute inset-0 w-full h-full z-10 cursor-crosshair touch-none"
                  />
                )}

                {/* Büyütme Butonu */}
                {!isMaskMode && (
                  <button
                    onClick={() => setIsImageZoomed(true)}
                    className="absolute top-4 right-4 z-20 bg-black/40 hover:bg-black/60 text-white backdrop-blur-md p-2.5 rounded-full transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-sm"
                    title="Büyüt"
                  >
                    <ZoomIn className="w-4.5 h-4.5" />
                  </button>
                )}

                {/* Alt şık hafif gölge efekti */}
                <div className="absolute bottom-0 left-0 right-0 h-14 bg-linear-to-t from-black/5 to-transparent pointer-events-none rounded-b-4xl" />
              </div>
            )}
          </div>

          {/* ── ALT BUTONLAR / MASK KONTROLLERİ ── */}
          {isMaskMode ? (
            <div className="relative z-10 w-full max-w-[440px] flex flex-col gap-4 bg-white p-5 rounded-3xl shadow-sm border border-slate-200 animate-in slide-in-from-top-4 duration-300">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-orange-500" /> Bölgesel Düzenleme (Mask)
                </p>
                <button onClick={() => {setIsMaskMode(false); clearCanvas();}} className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-slate-500 min-w-[36px]">Fırça:</span>
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  value={brushSize} 
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="flex-1 accent-orange-500"
                />
                <button onClick={clearCanvas} className="p-2 text-slate-500 hover:text-red-500 bg-slate-50 rounded-xl transition-colors cursor-pointer border border-slate-200 hover:border-red-200" title="Temizle">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Fırça boyama ipucu */}
              <div className="bg-orange-50/70 border border-orange-100/80 text-orange-800 text-xs p-3 rounded-2xl leading-normal flex items-start gap-2 shadow-xs">
                <span className="text-base leading-none">💡</span>
                <div>
                  <strong className="font-semibold block mb-0.5">Önemli İpucu:</strong> 
                  Değişiklik yapmak istediğiniz alanın etrafına boş bir daire çizmek yerine, <strong>o alanın tamamını fırça ile tamamen boyayarak doldurun.</strong> Aksi takdirde yapay zeka sadece çizdiğiniz çizginin üzerine bir şeyler eklemeye çalışır ve görsel değişmez.
                </div>
              </div>

              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={maskPrompt}
                  onChange={(e) => setMaskPrompt(e.target.value)}
                  placeholder="Seçili alana ne eklensin?"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm outline-none focus:border-orange-400 focus:bg-white transition-colors"
                />
                <button
                  onClick={handleInpaintSubmit}
                  disabled={!maskPrompt.trim()}
                  className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 disabled:opacity-50 cursor-pointer flex items-center gap-2 shadow-sm transition-all active:scale-95"
                >
                  Uygula
                </button>
              </div>
            </div>
          ) : (
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

              {/* Bölgesel Düzenleme Butonu (BEYAZ/SİLUET) */}
              <button
                onClick={() => setIsMaskMode(true)}
                disabled={isGenerating || isChatLoading}
                className="w-full bg-white border border-slate-200 text-slate-700 hover:text-orange-600 hover:border-orange-300 py-3.5 rounded-2xl text-sm font-semibold transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                Bölgesel Düzenleme (Inpaint)
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
          )}
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
