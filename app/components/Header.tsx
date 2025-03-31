import React from 'react';
// Import icons from react-icons later if needed
// import { FaLeaf } from 'react-icons/fa'; 

const Header: React.FC = () => {
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
  } as React.CSSProperties, // Type assertion needed for complex styles
};

export default Header;
