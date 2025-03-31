import React, { useState, useEffect } from 'react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number; // Duration in milliseconds, defaults to 3000
  onClose: () => void; // Callback when notification closes
}

const Notification: React.FC<NotificationProps> = ({ 
  message, 
  type, 
  duration = 3000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Call onClose after the fade-out animation (adjust timing if needed)
      setTimeout(onClose, 300); // Match transition duration
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  // Determine background color based on type
  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#d4edda'; // Light green
      case 'error':
        return '#f8d7da'; // Light red
      case 'info':
      default:
        return '#d1ecf1'; // Light blue
    }
  };

  // Determine text color based on type
  const getTextColor = () => {
    switch (type) {
      case 'success':
        return '#155724'; // Dark green
      case 'error':
        return '#721c24'; // Dark red
      case 'info':
      default:
        return '#0c5460'; // Dark blue
    }
  };

  const styles: { [key: string]: React.CSSProperties } = {
    notification: {
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      // transform: 'translateX(-50%)', // Removed redundant transform
      padding: '1rem 1.5rem',
      borderRadius: '4px',
      backgroundColor: getBackgroundColor(),
      color: getTextColor(),
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      zIndex: 1000,
      transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out',
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(20px)',
      fontFamily: "'Poppins', sans-serif",
      fontSize: '0.9rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    closeButton: {
      background: 'none',
      border: 'none',
      color: getTextColor(),
      fontSize: '1.2rem',
      cursor: 'pointer',
      padding: '0',
      lineHeight: '1',
      marginLeft: '1rem',
      opacity: 0.7,
    }
  };

  const handleManualClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Match transition duration
  };

  return (
    <div style={styles.notification} role="alert">
      <span>{message}</span>
      <button 
        onClick={handleManualClose} 
        style={styles.closeButton}
        aria-label="Close notification"
      >
        &times; 
      </button>
    </div>
  );
};

export default Notification;
