import React from 'react';

interface SocialShareButtonsProps {
  url: string;
  title: string;
  description: string;
  shoppingList?: {
    [category: string]: string[];
  };
}

const SocialShareButtons: React.FC<SocialShareButtonsProps> = ({
  url,
  title,
  description,
  shoppingList,
}) => {
  // Generate WhatsApp shopping list text
  const formatShoppingListForWhatsApp = (list: { [category: string]: string[] }): string => {
    if (!list) return '';
    
    // Create WhatsApp-friendly shopping list with emojis and checkboxes
    let formattedText = `🛒 *Shopping List for ${title}* 🛒\n\n`;
    
    // Category emojis
    const categoryEmojis: { [key: string]: string } = {
      'Produce': '🥬',
      'Fruits': '🍎',
      'Vegetables': '🥕',
      'Pantry Staples': '🧂',
      'Grains': '🌾',
      'Beans & Legumes': '🫘',
      'Spices & Herbs': '🌿',
      'Refrigerated': '🧊',
      'Frozen': '❄️',
      'Canned Goods': '🥫',
      'Nuts & Seeds': '🥜',
      'Baking': '🍞',
      'Oils': '🫒',
      'Sauces & Condiments': '🍯',
      'Drinks': '🥤',
      'Other': '📋'
    };

    // Loop through each category
    Object.entries(list).forEach(([category, items]) => {
      // Get emoji for the category or use a default
      const emoji = categoryEmojis[category] || '📋';
      
      // Add category header
      formattedText += `\n${emoji} *${category}*\n`;
      
      // Add items with checkboxes
      items.forEach(item => {
        formattedText += `□ ${item}\n`;
      });
    });
    
    formattedText += '\n👨‍🍳 Shared from Sprout Notes 🌱';
    
    return formattedText;
  };

  // Handle sharing to different platforms
  const shareToFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title)}`;
    window.open(fbUrl, '_blank', 'width=600,height=400');
  };

  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  const shareToWhatsApp = () => {
    const text = shoppingList
      ? formatShoppingListForWhatsApp(shoppingList)
      : `${title}\n\n${description}\n\n${url}`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareToPinterest = () => {
    // For Pinterest, ideally we'd include an image, but we'll leave it simple for now
    const pinterestUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(title + ' - ' + description)}`;
    window.open(pinterestUrl, '_blank', 'width=600,height=400');
  };

  // Web Share API for mobile devices
  const useWebShareAPI = () => {
    if (navigator.share) {
      navigator.share({
        title,
        text: description,
        url,
      }).catch(err => console.error('Error sharing:', err));
    } else {
      alert('Web Share API not supported in your browser. Please use the other share buttons.');
    }
  };

  return (
    <div className="social-share-buttons">
      {/* Main Share Button (uses Web Share API if available) */}
      <button 
        onClick={useWebShareAPI} 
        className="share-btn primary-share-btn"
        aria-label="Share"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3"></circle>
          <circle cx="6" cy="12" r="3"></circle>
          <circle cx="18" cy="19" r="3"></circle>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
        </svg>
        <span>Share</span>
      </button>

      {/* Platform-specific buttons */}
      <div className="platform-buttons">
        <button 
          onClick={shareToFacebook} 
          className="platform-btn facebook-btn"
          aria-label="Share to Facebook"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
          </svg>
        </button>
        
        <button 
          onClick={shareToTwitter} 
          className="platform-btn twitter-btn"
          aria-label="Share to Twitter"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
          </svg>
        </button>
        
        <button 
          onClick={shareToPinterest} 
          className="platform-btn pinterest-btn"
          aria-label="Share to Pinterest"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.627 0-12 5.373-12 12 0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
          </svg>
        </button>
        
        <button 
          onClick={shareToWhatsApp} 
          className={`platform-btn whatsapp-btn ${shoppingList ? 'whatsapp-list-btn' : ''}`}
          aria-label="Share to WhatsApp"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <span>{shoppingList ? 'Send List' : ''}</span>
        </button>
      </div>
    </div>
  );
};

export default SocialShareButtons;
