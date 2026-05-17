export default function Header({ onLogoClick }) {
  return (
    <header className="sticky top-0 z-100 bg-white/90 backdrop-blur-[20px] border-b border-[#eef0f4] py-3.5 px-6" id="app-header">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={onLogoClick}>
          <img 
            src="/visearch_logo_icon.svg" 
            className="w-11 h-11 object-contain transition-transform duration-150 group-hover:scale-110" 
            alt="VISEARCH AI Logo" 
          />
          <div>
            <h1 className="text-[1.35rem] font-extrabold tracking-[-0.03em] text-[#1a1a2e] m-0">
              <span className="text-orange-500 font-extrabold">VISEARCH</span> <span className="text-slate-900 font-extrabold">AI</span>
            </h1>
            <p className="text-[0.68rem] text-[#9ca3b4] font-medium tracking-[0.06em] uppercase m-0">Görsel ile ürün arama motoru</p>
          </div>
        </div>
      </div>
    </header>
  );
}
