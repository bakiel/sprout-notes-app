import React from 'react';

interface LoadingIndicatorProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  message = "Loading...", 
  size = 'medium' 
}) => {
  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return { width: '20px', height: '20px', borderWidth: '3px' };
      case 'large':
        return { width: '60px', height: '60px', borderWidth: '6px' };
      case 'medium':
      default:
        return { width: '40px', height: '40px', borderWidth: '4px' };
    }
  };

  return (
    <div style={styles.container}>
      <div style={{ ...styles.spinner, ...getSizeStyle() }}></div>
      {message && <p style={styles.message}>{message}</p>}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    color: '#2e7d32', // Primary Green
  } as React.CSSProperties,
  spinner: {
    borderStyle: 'solid',
    borderColor: '#8bc34a', // Light Green
    borderTopColor: '#2e7d32', // Primary Green
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  } as React.CSSProperties,
  message: {
    marginTop: '1rem',
    fontWeight: 600,
    fontFamily: "'Montserrat', sans-serif",
  } as React.CSSProperties,
};

// Add keyframes for the spin animation globally if not already present
// Ideally, this would be in a global CSS file (e.g., app.css)
const keyframes = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

// Inject keyframes into the document head (simple approach for demonstration)
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = keyframes;
  document.head.appendChild(styleSheet);
}


export default LoadingIndicator;
