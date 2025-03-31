import React from 'react';
// Import icons from react-icons later if needed
// import { FaLeaf } from 'react-icons/fa'; 

// Define props for install button functionality
interface HeaderProps {
  showInstallButton?: boolean;
  onInstallClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ showInstallButton = false, onInstallClick }) => {
  // In a real app, showInstallButton and onInstallClick would likely come from context or state management
  // For now, we use props as placeholders. The actual state lives in App/root.tsx.
  
  // Placeholder logic to simulate receiving the state/handler (REMOVE LATER)
  const displayInstallButton = showInstallButton; // Use prop directly
  const handleInstall = onInstallClick; // Use prop directly

  return (
    <header style={styles.header}>
      <nav style={styles.nav}>
        {/* Placeholder for Logo */}
        <div style={styles.logo}>
          {/* <FaLeaf size={24} style={{ marginRight: '8px' }} /> */}
          <span style={styles.logoText}>Sprout Notes 🌱</span>
        </div>
        {/* Placeholder for Navigation Links */}
        <ul style={styles.navList}>
          {/* Example Links */}
          {/* <li style={styles.navItem}><a href="#recipe-generator" style={styles.navLink}>Generator</a></li>
          <li style={styles.navItem}><a href="#notes-section" style={styles.navLink}>Notes</a></li> */}
          {/* Conditionally render Install Button */}
          {displayInstallButton && handleInstall && (
             <li style={styles.navItem}>
               <button onClick={handleInstall} style={styles.installButton}>
                 Install App
               </button>
             </li>
          )}
        </ul>
      </nav>
    </header>
  );
};

// Basic inline styles (can be moved to CSS later)
const styles = {
  header: {
    backgroundColor: '#1b5e20', // Dark Green Accent
    padding: '1rem 2rem',
    color: '#f5f5dc', // Beige text
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
  },
  logoText: {
    fontFamily: "'Montserrat', sans-serif",
    fontSize: '1.5rem',
    fontWeight: 600,
  },
  navList: {
    listStyle: 'none',
    display: 'flex',
    gap: '1.5rem',
  },
  navItem: {
    // Styles for nav items
  },
  navLink: {
    color: '#f5f5dc',
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: 400, // Poppins regular
    fontFamily: "'Poppins', sans-serif",
    // Add hover effect later
  } as React.CSSProperties, 
  installButton: {
    backgroundColor: '#8bc34a', // Light Green
    color: '#1b5e20', // Dark Green text
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.9rem',
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  } as React.CSSProperties,
};

export default Header;
