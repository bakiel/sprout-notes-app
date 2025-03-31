import React, { useState } from 'react';

interface Note {
  id?: string;
  title: string;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
  tags?: string[];
  relatedRecipeId?: string;
}

interface NoteListProps {
  notes: Note[];
  onSelectNote: (note: Note) => void;
  onDeleteNote?: (noteId: string) => void;
}

const NoteList: React.FC<NoteListProps> = ({ 
  notes, 
  onSelectNote,
  onDeleteNote
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter notes based on search term
  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Sort notes by most recently updated
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return dateB - dateA;
  });
  
  const formatDate = (date?: Date): string => {
    if (!date) return '';
    
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    
    // Get difference in days
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) {
      return 'Today';
    } else if (diffDays <= 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  const getContentPreview = (content: string, maxLength: number = 120): string => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };
  
  return (
    <div style={styles.container}>
      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
      </div>
      
      <div style={styles.notesList}>
        {sortedNotes.length === 0 ? (
          <div style={styles.emptyState}>
            {searchTerm ? 
              'No notes match your search term.' : 
              'No notes yet. Create your first note!'}
          </div>
        ) : (
          sortedNotes.map((note, idx) => note.id ? (
            <div 
              key={note.id} 
              style={styles.noteCard}
              onClick={() => onSelectNote(note)}
            >
              <div style={styles.noteHeader}>
                <h3 style={styles.noteTitle}>{note.title}</h3>
                {onDeleteNote && note.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the card click
                      if (window.confirm('Are you sure you want to delete this note?')) {
                        onDeleteNote(note.id as string);
                      }
                    }}
                    style={styles.deleteButton}
                    aria-label="Delete note"
                  >
                    ×
                  </button>
                )}
              </div>
              
              <p style={styles.notePreview}>
                {getContentPreview(note.content)}
              </p>
              
              <div style={styles.noteFooter}>
                <span style={styles.noteDate}>
                  {formatDate(note.updatedAt)}
                </span>
                
                {note.tags && note.tags.length > 0 && (
                  <div style={styles.tagContainer}>
                    {note.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} style={styles.tag}>{tag}</span>
                    ))}
                    {note.tags.length > 3 && (
                      <span style={styles.moreTag}>+{note.tags.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div key={`temp-note-${idx}`} style={styles.noteCard}>
              <div style={styles.noteHeader}>
                <h3 style={styles.noteTitle}>{note.title}</h3>
              </div>
              <p style={styles.notePreview}>
                {getContentPreview(note.content)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    padding: '1rem',
    maxWidth: '800px',
    margin: '0 auto',
  } as React.CSSProperties,
  searchContainer: {
    marginBottom: '1rem',
  } as React.CSSProperties,
  searchInput: {
    width: '100%',
    padding: '0.75rem',
    fontSize: '1rem',
    fontFamily: "'Poppins', sans-serif",
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    backgroundColor: '#f9f9f9',
  } as React.CSSProperties,
  notesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  } as React.CSSProperties,
  noteCard: {
    padding: '1rem',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    backgroundColor: '#f9f9f9',
    cursor: 'pointer',
    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
    // Added hover effect will be better handled in actual CSS
  } as React.CSSProperties,
  noteHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  } as React.CSSProperties,
  noteTitle: {
    margin: 0,
    fontFamily: "'Montserrat', sans-serif",
    fontSize: '1.1rem',
    fontWeight: 600,
    color: '#2e7d32',
  } as React.CSSProperties,
  deleteButton: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '1.5rem',
    color: '#888',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    padding: 0,
    // Added hover effect will be better handled in actual CSS
  } as React.CSSProperties,
  notePreview: {
    margin: '0.5rem 0',
    fontSize: '0.95rem',
    lineHeight: 1.5,
    color: '#555',
    fontFamily: "'Poppins', sans-serif",
  } as React.CSSProperties,
  noteFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '0.5rem',
    fontSize: '0.8rem',
  } as React.CSSProperties,
  noteDate: {
    color: '#888',
  } as React.CSSProperties,
  tagContainer: {
    display: 'flex',
    gap: '0.25rem',
  } as React.CSSProperties,
  tag: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    padding: '0.25rem 0.5rem',
    borderRadius: '12px',
    fontSize: '0.7rem',
    fontWeight: 500,
  } as React.CSSProperties,
  moreTag: {
    backgroundColor: '#f5f5f5',
    color: '#777',
    padding: '0.25rem 0.5rem',
    borderRadius: '12px',
    fontSize: '0.7rem',
    fontWeight: 500,
  } as React.CSSProperties,
  emptyState: {
    padding: '2rem',
    textAlign: 'center',
    color: '#888',
    fontStyle: 'italic',
  } as React.CSSProperties,
};

export default NoteList;
