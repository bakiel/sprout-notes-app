import React, { useState, useEffect } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'; // Use named import
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import type { EditorState } from 'lexical';
import LexicalToolbar from './LexicalToolbar'; // Import the toolbar

// Define Lexical theme (can be customized)
const editorTheme = {
  // Theme styling goes here, or import a pre-made theme CSS
  ltr: 'ltr',
  rtl: 'rtl',
  placeholder: 'editor-placeholder',
  paragraph: 'editor-paragraph',
  // ... other theme classes
};

// Define initial editor configuration
const initialConfig = {
  namespace: 'MyEditor',
  theme: editorTheme,
  onError(error: Error) {
    console.error(error);
    // Potentially show an error notification to the user
  },
  // Register nodes used by the editor
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode,
    CodeNode,
    CodeHighlightNode,
    TableNode,
    TableCellNode,
    TableRowNode,
    AutoLinkNode,
    LinkNode,
  ],
  // Set editable to true
  editable: true, 
};


interface Note {
  id?: string;
  title: string;
  content: string; // Will store stringified Lexical JSON state
  createdAt?: Date;
  updatedAt?: Date;
  tags?: string[];
  category?: string; 
  relatedRecipeId?: string;
}

interface NoteEditorProps {
  initialNote?: Note;
  currentRecipeId?: string; 
  onSave: (note: Note) => void;
  onCancel?: () => void;
}

const LOCAL_STORAGE_KEY = 'sprout-notes-draft';
const NOTE_CATEGORIES = ["General", "Ideas", "Recipe Modifications", "Shopping Lists", "Techniques"]; 

// Helper function to handle editor state changes
function editorStateToString(editorState: EditorState): string {
  return JSON.stringify(editorState.toJSON());
}

// Helper function to initialize editor state from string
function stringToInitialEditorState(contentString?: string): string | null {
   if (!contentString) return null;
   try {
     JSON.parse(contentString); // Validate JSON
     return contentString; // Return valid JSON string
   } catch (e) {
     console.warn("Content is not valid Lexical JSON, treating as plain text:", e);
     return null; 
   }
}


const NoteEditor: React.FC<NoteEditorProps> = ({ 
  initialNote,
  currentRecipeId, 
  onSave,
  onCancel
}) => {
  const defaultNote: Note = {
    title: '',
    content: '', 
    tags: [],
    category: NOTE_CATEGORIES[0], 
  };
  
  const [note, setNote] = useState<Note>(initialNote || defaultNote);
  const [tagsInput, setTagsInput] = useState<string>(initialNote?.tags?.join(', ') || '');
  const [linkToRecipe, setLinkToRecipe] = useState<boolean>(!!initialNote?.relatedRecipeId); 

  // Update internal state when initialNote prop changes
  useEffect(() => {
    const currentNote = initialNote || defaultNote;
    setNote(currentNote);
    setTagsInput(currentNote.tags?.join(', ') || '');
    setLinkToRecipe(!!currentNote.relatedRecipeId); 
  }, [initialNote]);
  
  // --- Draft Saving/Loading (Commented out for now) ---
  /*
  useEffect(() => {
    // Save draft logic here
  }, [note, tagsInput, linkToRecipe]); 
  
  useEffect(() => {
    // Load draft logic here
  }, []); 
  */
  // --- End Draft Saving/Loading ---

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNote(prev => ({ ...prev, title: e.target.value }));
  };
  
  const handleContentChange = (editorState: EditorState) => {
    const contentString = editorStateToString(editorState);
    setNote(prev => ({ ...prev, content: contentString }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagsInput(e.target.value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNote(prev => ({ ...prev, category: e.target.value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const tagsArray = tagsInput.split(',')
                               .map(tag => tag.trim())
                               .filter(tag => tag.length > 0);
                               
    const noteToSave: Note = {
      ...note, 
      id: initialNote?.id, 
      tags: tagsArray, 
      relatedRecipeId: linkToRecipe ? initialNote?.relatedRecipeId || currentRecipeId : undefined, 
      updatedAt: new Date(),
      createdAt: initialNote?.createdAt || new Date(), 
    };
    
    onSave(noteToSave);
    
    if (!initialNote) {
      setNote(defaultNote); 
      setTagsInput(''); 
      setLinkToRecipe(false); 
      // TODO: Clear Lexical editor state
    }
  };
  
  // Recalculate initialConfig for LexicalComposer based on current note content
  const currentInitialConfig = {
    ...initialConfig,
    // Pass the stringified JSON state or null
    editorState: stringToInitialEditorState(note.content) 
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
        
        {/* Use a key to force re-mount and re-initialization when switching notes */}
        <LexicalComposer initialConfig={currentInitialConfig} key={initialNote?.id || 'new'}>
          <div className="editor-container" style={styles.editorContainer}>
             <LexicalToolbar /> {/* Render the toolbar */}
             <RichTextPlugin
               contentEditable={<ContentEditable style={styles.contentEditable} aria-label="Note content" />}
               placeholder={<div style={styles.placeholder}>Write your note here...</div>}
               ErrorBoundary={LexicalErrorBoundary} // Ensure ErrorBoundary prop is present
             />
             <HistoryPlugin />
             <OnChangePlugin onChange={handleContentChange} />
             {/* TODO: Add other plugins (ListPlugin, LinkPlugin, etc.) */}
          </div>
        </LexicalComposer>

        <input
          type="text"
          placeholder="Tags (comma-separated)"
          value={tagsInput}
          onChange={handleTagsChange}
          style={styles.tagsInput}
          aria-label="Note tags"
        />

        <select
          value={note.category || NOTE_CATEGORIES[0]} 
          onChange={handleCategoryChange}
          style={styles.categorySelect}
          aria-label="Note category"
        >
          {NOTE_CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {currentRecipeId && (
          <label style={styles.linkCheckboxLabel}>
            <input
              type="checkbox"
              checked={linkToRecipe}
              onChange={(e) => setLinkToRecipe(e.target.checked)}
            />
            Link to current recipe
          </label>
        )}
        
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
  editorContainer: {
    position: 'relative', 
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    backgroundColor: '#ffffff', 
    minHeight: '200px', 
    fontFamily: "'Poppins', sans-serif",
    fontSize: '1rem',
    lineHeight: 1.6,
  } as React.CSSProperties,
  contentEditable: {
    outline: 'none', 
    padding: '0.75rem',
    minHeight: '200px', 
    resize: 'vertical', 
    overflow: 'auto', 
  } as React.CSSProperties,
  placeholder: {
    position: 'absolute',
    top: '0.75rem',
    left: '0.75rem',
    color: '#aaa',
    pointerEvents: 'none', 
    fontFamily: "'Poppins', sans-serif",
    fontSize: '1rem',
  } as React.CSSProperties,
  buttonGroup: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    marginTop: '1rem',
  } as React.CSSProperties,
  saveButton: {
    backgroundColor: '#2e7d32', 
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
  tagsInput: {
    padding: '0.75rem',
    fontSize: '0.9rem',
    fontFamily: "'Poppins', sans-serif",
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    backgroundColor: '#f9f9f9',
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
  categorySelect: {
    padding: '0.75rem',
    fontSize: '0.9rem',
    fontFamily: "'Poppins', sans-serif",
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    backgroundColor: '#f9f9f9',
  } as React.CSSProperties,
  linkCheckboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontFamily: "'Poppins', sans-serif",
    fontSize: '0.9rem',
    color: '#555',
  } as React.CSSProperties,
};

export default NoteEditor;
