import { ExternalLink } from 'lucide-react';

export default function ProductCard({ product, index }) {
  const handleClick = (e) => {
    e.preventDefault();
    if (product.link && product.link !== '#') {
      window.open(product.link, '_blank', 'noopener,noreferrer');
    }
  };

  const storeColor = product.storeColor || '#F27A1A'; // Default to a color

  return (
    <a 
      href={product.link || '#'}
      onClick={handleClick}
      className="group bg-white/40 backdrop-blur-xl rounded-[2rem] p-3 border border-white/60 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 ease-out flex flex-col"
      style={{ transitionDelay: `${Math.min(index * 50, 1500)}ms` }}
      title={product.title}
    >
      {/* Ürün Resmi */}
      <div className="relative w-full aspect-square rounded-[1.5rem] overflow-hidden mb-4 bg-slate-100 shadow-inner">
        <img 
          src={product.image || product.thumbnail} 
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            // Optionally set a fallback image or text here
            e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="20">🖼️</text></svg>';
          }}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
        
        {/* Source Icon Badge (optional, based on API data) */}
        {product.sourceIcon && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md p-1.5 rounded-full shadow-sm">
             <img src={product.sourceIcon} alt="" className="w-4 h-4 rounded-full" />
          </div>
        )}

        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 shadow-sm">
          <ExternalLink className="w-4 h-4 text-slate-700" />
        </div>
      </div>
      
      {/* Ürün Detayları */}
      <div className="px-3 pb-3 flex-1 flex flex-col">
        <h3 className="font-medium text-slate-800 line-clamp-2 leading-snug mb-3 group-hover:text-indigo-600 transition-colors">
          {product.title}
        </h3>
        <div className="mt-auto flex items-center justify-between gap-1.5 sm:gap-2 pt-1 overflow-hidden">
          <span 
            className="font-semibold text-[15px] sm:text-[17px] text-slate-900 tracking-tight truncate"
            title={typeof product.price === 'string' ? product.price : 'Fiyat Yok'}
          >
            {product.price || 'Fiyat Yok'}
          </span>
          <span 
            className="text-[10px] sm:text-[11px] font-bold px-2 py-1 sm:py-1.5 rounded-full text-white shadow-sm tracking-wider shrink-0 truncate max-w-[45%]"
            style={{ backgroundColor: storeColor }}
            title={product.source || 'Mağaza'}
          >
            {product.source || 'Mağaza'}
          </span>
        </div>
      </div>
    </a>
  );
}
