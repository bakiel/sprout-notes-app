import React, { useState, useEffect } from 'react';

interface Note {
  id?: string;
  title: string;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
  tags?: string[];
  relatedRecipeId?: string;
}

interface NoteEditorProps {
  initialNote?: Note;
  onSave: (note: Note) => void;
  onCancel?: () => void;
}

const LOCAL_STORAGE_KEY = 'sprout-notes-draft';

const NoteEditor: React.FC<NoteEditorProps> = ({ 
  initialNote,
  onSave,
  onCancel
}) => {
  const defaultNote: Note = {
    title: '',
    content: '',
    tags: [],
  };
  
  // Initialize state with provided note or default values
  const [note, setNote] = useState<Note>(initialNote || defaultNote);
  
  // Auto-save draft to localStorage
  useEffect(() => {
    // Save current note to localStorage as draft
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(note));
    
    // Cleanup function to remove draft when component unmounts
    return () => {
      // Only clear if we're not editing an existing note
      if (!initialNote?.id) {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    };
  }, [note, initialNote]);
  
  // Load draft from localStorage on mount
  useEffect(() => {
    // Only load draft if we're not editing an existing note
    if (!initialNote?.id) {
      const savedDraft = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedDraft) {
        try {
          const parsedDraft = JSON.parse(savedDraft);
          setNote(parsedDraft);
        } catch (e) {
          console.error("Failed to parse draft note from localStorage", e);
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
      }
    }
  }, [initialNote]);
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNote(prev => ({ ...prev, title: e.target.value }));
  };
  
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(prev => ({ ...prev, content: e.target.value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Add timestamps
    const noteToSave = {
      ...note,
      updatedAt: new Date(),
      createdAt: note.createdAt || new Date(),
    };
    
    // Call save handler
    onSave(noteToSave);
    
    // Clear localStorage draft if this is a new note
    if (!initialNote?.id) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
    
    // Reset form if this is a new note (not editing)
    if (!initialNote) {
      setNote(defaultNote);
    }
  };
  
  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="Note Title"
          value={note.title}
          onChange={handleTitleChange}
          style={styles.titleInput}
          required
          aria-label="Note title"
        />
        
        <textarea
          placeholder="Write your note here..."
          value={note.content}
          onChange={handleContentChange}
          style={styles.contentTextarea}
          required
          rows={10}
          aria-label="Note content"
        />
        
        <div style={styles.buttonGroup}>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              style={styles.cancelButton}
            >
              Cancel
            </button>
          )}
          
          <button type="submit" style={styles.saveButton}>
            {initialNote ? 'Update Note' : 'Save Note'}
          </button>
        </div>
      </form>
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
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  } as React.CSSProperties,
  titleInput: {
    padding: '0.75rem',
    fontSize: '1.25rem',
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 600,
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    backgroundColor: '#f9f9f9',
  } as React.CSSProperties,
  contentTextarea: {
    padding: '0.75rem',
    fontSize: '1rem',
    fontFamily: "'Poppins', sans-serif",
    lineHeight: 1.6,
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    resize: 'vertical',
    minHeight: '200px',
  } as React.CSSProperties,
  buttonGroup: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    marginTop: '1rem',
  } as React.CSSProperties,
  saveButton: {
    backgroundColor: '#2e7d32', // Primary Green
    color: 'white',
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    fontFamily: "'Montserrat', sans-serif", 
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  } as React.CSSProperties,
  cancelButton: {
    backgroundColor: '#f5f5f5',
    color: '#333',
    padding: '0.75rem 1.5rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  } as React.CSSProperties,
};

export default NoteEditor;
