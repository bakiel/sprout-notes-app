import React, { useState } from 'react';

interface RecipeReviewProps {
  onSubmitReview: (rating: number, comment: string) => void;
  existingReviews?: Review[];
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  date: string;
}

const RecipeReview: React.FC<RecipeReviewProps> = ({ onSubmitReview, existingReviews = [] }) => {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showForm, setShowForm] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Call the parent component's handler
    onSubmitReview(rating, comment);
    
    // Reset form
    setRating(5);
    setComment('');
    setIsSubmitting(false);
    setShowForm(false);
  };

  return (
    <div style={styles.container}>
      <h4 style={styles.title}>Reviews</h4>
      
      {/* Display existing reviews */}
      {existingReviews.length > 0 ? (
        <div style={styles.reviewsList}>
          {existingReviews.map((review) => (
            <div key={review.id} style={styles.reviewItem}>
              <div style={styles.reviewHeader}>
                <div style={styles.starRating}>
                  {[...Array(5)].map((_, i) => (
                    <span key={i} style={{
                      color: i < review.rating ? '#FFD700' : '#ccc',
                      fontSize: '1.2rem',
                    }}>★</span>
                  ))}
                </div>
                <div style={styles.reviewDate}>{review.date}</div>
              </div>
              <p style={styles.reviewComment}>{review.comment}</p>
            </div>
          ))}
        </div>
      ) : (
        <p style={styles.noReviews}>No reviews yet. Be the first to review this recipe!</p>
      )}
      
      {/* Toggle review form button */}
      <button 
        onClick={() => setShowForm(!showForm)} 
        style={showForm ? styles.cancelButton : styles.addReviewButton}
      >
        {showForm ? 'Cancel' : 'Add Review'}
      </button>
      
      {/* Review form */}
      {showForm && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Rating:</label>
            <div style={styles.starSelector}>
              {[...Array(5)].map((_, i) => (
                <span 
                  key={i}
                  onClick={() => setRating(i + 1)}
                  style={{
                    cursor: 'pointer',
                    color: i < rating ? '#FFD700' : '#ccc',
                    fontSize: '1.5rem',
                    padding: '0 0.2rem',
                  }}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
          
          <div style={styles.formGroup}>
            <label htmlFor="comment" style={styles.label}>Your Review:</label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={styles.textarea}
              placeholder="Share your experience with this recipe..."
              required
              rows={4}
            />
          </div>
          
          <button 
            type="submit" 
            style={styles.submitButton}
            disabled={isSubmitting || !comment.trim()}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}
    </div>
  );
};

const styles = {
  container: {
    marginTop: '2rem',
    padding: '1rem',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    fontFamily: "'Poppins', sans-serif",
  } as React.CSSProperties,
  title: {
    fontFamily: "'Montserrat', sans-serif",
    color: '#2e7d32',
    marginTop: '0',
    marginBottom: '1rem',
    fontSize: '1.1rem',
  } as React.CSSProperties,
  reviewsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginBottom: '1.5rem',
  } as React.CSSProperties,
  reviewItem: {
    padding: '1rem',
    backgroundColor: 'white',
    borderRadius: '6px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  } as React.CSSProperties,
  reviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  } as React.CSSProperties,
  starRating: {
    display: 'flex',
  } as React.CSSProperties,
  reviewDate: {
    fontSize: '0.8rem',
    color: '#666',
  } as React.CSSProperties,
  reviewComment: {
    margin: '0',
    fontSize: '0.95rem',
    lineHeight: '1.5',
  } as React.CSSProperties,
  noReviews: {
    fontStyle: 'italic',
    color: '#666',
    textAlign: 'center',
    margin: '1rem 0',
  } as React.CSSProperties,
  form: {
    marginTop: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  } as React.CSSProperties,
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  } as React.CSSProperties,
  label: {
    fontWeight: 600,
    color: '#1b5e20',
    fontSize: '0.9rem',
  } as React.CSSProperties,
  starSelector: {
    display: 'flex',
    alignItems: 'center',
  } as React.CSSProperties,
  textarea: {
    padding: '0.75rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontFamily: "'Poppins', sans-serif",
    fontSize: '0.9rem',
    resize: 'vertical',
  } as React.CSSProperties,
  addReviewButton: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    border: '1px solid #8bc34a',
    borderRadius: '4px',
    padding: '0.5rem 1rem',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
    alignSelf: 'flex-start',
  } as React.CSSProperties,
  cancelButton: {
    backgroundColor: '#f5f5f5',
    color: '#666',
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '0.5rem 1rem',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
    alignSelf: 'flex-start',
  } as React.CSSProperties,
  submitButton: {
    backgroundColor: '#2e7d32',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '0.75rem 1rem',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
    alignSelf: 'flex-end',
    transition: 'background-color 0.2s ease',
  } as React.CSSProperties,
};

export default RecipeReview;
