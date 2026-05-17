import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import ProductCard from '../shared/ProductCard/ProductCard';

export default function SonuclarEkrani({ uploadedImage, searchResults, onNewSearch, onEditImage }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Reset to page 1 if search results change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchResults]);

  const totalItems = searchResults?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = searchResults ? searchResults.slice(startIndex, endIndex) : [];

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      // Smooth scroll to top of the results panel
      const element = document.getElementById('results-header');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-start justify-center gap-12 transition-all duration-700 ease-in-out py-12">
      
      {/* SOL PANEL (Görsel ve Prompt Alanı) */}
      <div className="flex flex-col items-start w-full md:w-[30%] lg:w-[25%] transition-all duration-700 ease-in-out shrink-0">
        
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

        {/* Input Alanı (Sadece görsel amaçlı veya görseli düzenleme tetikler) */}
        <div className="w-full flex flex-col max-w-md relative z-10">
           <button 
            onClick={onEditImage}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white backdrop-blur-2xl px-4 py-3.5 rounded-2xl text-sm font-medium transition-all shadow-lg flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
          >
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
            <span>Görseli Düzenle</span>
          </button>
        </div>

      </div>

      {/* SAĞ PANEL (Ürün Listesi - %75) */}
      <div className="h-full flex flex-col w-full md:w-[70%] lg:w-[75%]" id="results-header">
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
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 auto-rows-max">
                  {currentProducts.map((product, idx) => {
                    // Provide a stable global index for transition animation delays
                    const globalIdx = startIndex + idx;
                    return (
                      <ProductCard key={globalIdx} product={product} index={globalIdx} />
                    );
                  })}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12 py-4">
                    {/* Önceki Button */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${
                        currentPage === 1
                          ? 'text-slate-300 cursor-not-allowed bg-slate-50 border border-slate-100'
                          : 'text-slate-600 hover:text-orange-500 hover:bg-orange-50 bg-white shadow-sm border border-slate-100 hover:scale-105 active:scale-95'
                      }`}
                      aria-label="Önceki Sayfa"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 rounded-xl font-medium text-sm transition-all duration-300 ${
                          currentPage === page
                            ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20 scale-105'
                            : 'text-slate-600 hover:text-orange-500 hover:bg-orange-50 bg-white shadow-sm border border-slate-100 hover:scale-105 active:scale-95'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    {/* Sonraki Button */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${
                        currentPage === totalPages
                          ? 'text-slate-300 cursor-not-allowed bg-slate-50 border border-slate-100'
                          : 'text-slate-600 hover:text-orange-500 hover:bg-orange-50 bg-white shadow-sm border border-slate-100 hover:scale-105 active:scale-95'
                      }`}
                      aria-label="Sonraki Sayfa"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
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

