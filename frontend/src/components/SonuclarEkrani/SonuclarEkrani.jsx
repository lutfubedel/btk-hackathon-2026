import { Search } from 'lucide-react';
import ProductCard from '../shared/ProductCard/ProductCard';

export default function SonuclarEkrani({ uploadedImage, searchResults, onNewSearch }) {
  return (
    <div className="w-full max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-start justify-center gap-12 transition-all duration-700 ease-in-out py-12">
      
      {/* SOL PANEL (Görsel ve Prompt Alanı) */}
      <div className="flex flex-col items-start w-full md:w-[40%] transition-all duration-700 ease-in-out">
        
        {/* Görsel Alanı */}
        <div className="w-full mb-6">
          <div className="relative w-full aspect-square max-w-md group">
            {uploadedImage ? (
              <div className="relative w-full h-full rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] border border-white/80 overflow-hidden bg-white">
                <img 
                  src={uploadedImage} 
                  alt="Aranan Görsel" 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="relative w-full h-full rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] border border-white/80 overflow-hidden bg-slate-100 flex items-center justify-center">
                 <span className="text-slate-400">Görsel bulunamadı</span>
              </div>
            )}
          </div>
        </div>

        {/* Input Alanı (Sadece görsel amaçlı veya yeni arama tetikleyebilir) */}
        <div className="w-full flex flex-col max-w-md relative z-10">
           <button 
            onClick={onNewSearch}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white backdrop-blur-2xl px-4 py-3.5 rounded-2xl text-sm font-medium transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4 text-white" />
            <span>Yeni Bir Görsel İle Ara</span>
          </button>
        </div>

      </div>

      {/* SAĞ PANEL (Ürün Listesi - %60) */}
      <div className="h-full flex flex-col w-full md:w-[60%]">
        <div className="w-full py-2 flex flex-col">
          
          {/* Ürünler Başlık ve Yeni Arama Butonu */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-light text-slate-800 tracking-tight">Benzer Ürünler</h2>
              <p className="text-slate-500 mt-1 font-light">Tasarımınıza en yakın gerçek ürünler bulundu.</p>
            </div>
            <button 
              onClick={onNewSearch}
              className="text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 flex items-center gap-2 px-5 py-2.5 rounded-2xl transition-all shadow-md"
            >
              <Search className="w-4 h-4" />
              Yeni Arama
            </button>
          </div>

          {/* Ürün Kartları Grid'i */}
          <div className="flex-1 pr-2 pb-10">
            {searchResults && searchResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
                {searchResults.map((product, idx) => (
                  <ProductCard key={idx} product={product} index={idx} />
                ))}
              </div>
            ) : (
              <div className="w-full h-40 flex flex-col items-center justify-center text-slate-500">
                <Search className="w-8 h-8 text-slate-300 mb-3" />
                <p>Benzer ürün bulunamadı.</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
