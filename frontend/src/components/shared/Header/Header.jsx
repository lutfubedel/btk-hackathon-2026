import './Header.css';

export default function Header({ onLogoClick }) {
  return (
    <header className="header" id="app-header">
      <div className="header__inner">
        <div className="header__brand" onClick={onLogoClick}>
          <img 
            src="/visearch_logo_icon.svg" 
            className="header__logo" 
            alt="VISEARCH AI Logo" 
          />
          <div>
            <h1 className="header__title">
              <span className="text-orange-500 font-extrabold">VISEARCH</span> <span className="text-slate-900 font-extrabold">AI</span>
            </h1>
            <p className="header__subtitle">Görsel ile ürün arama motoru</p>
          </div>
        </div>
      </div>
    </header>
  );
}
