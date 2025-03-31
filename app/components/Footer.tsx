import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer style={styles.footer}>
      <p>&copy; {new Date().getFullYear()} Sprout Notes. All rights reserved.</p>
      {/* Add other footer content if needed */}
    </footer>
  );
};

// Basic inline styles
const styles = {
  footer: {
    backgroundColor: '#e0e0e0', // Light gray, adjust as needed
    color: '#333333',
    textAlign: 'center',
    padding: '1rem',
    marginTop: '2rem', // Add some space above the footer
    fontSize: '0.9rem',
    fontFamily: "'Poppins', sans-serif",
  } as React.CSSProperties,
};

export default Footer;
