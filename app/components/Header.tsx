import React from 'react';

// Get base URL for assets (handles GitHub Pages deployment)
const baseUrl = import.meta.env.BASE_URL || '/';
const logoUrl = `${baseUrl}icons/icon-48x48.png`;

interface HeaderProps {
  showInstallButton?: boolean;
  onInstallClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ showInstallButton = false, onInstallClick }) => {
  return (
    <header className="site-header">
      <nav className="site-nav">
        <div className="site-logo">
          <a href={baseUrl} className="logo-link">
            <img
              src={logoUrl}
              alt="Sprout Notes"
              className="logo-image"
            />
            <span className="logo-text">Sprout Notes</span>
          </a>
        </div>
        <ul className="nav-list">
          <li className="nav-item">
            <a href="/" className="nav-link">Home</a>
          </li>
          <li className="nav-item">
            <a href="/archive" className="nav-link">Archive</a>
          </li>
          {showInstallButton && onInstallClick && (
            <li className="nav-item">
              <button onClick={onInstallClick} className="btn btn--secondary nav-install-btn">
                Install App
              </button>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
