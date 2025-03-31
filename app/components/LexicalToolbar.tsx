import React from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  FORMAT_TEXT_COMMAND,
  $getSelection,
  $isRangeSelection,
} from 'lexical';
import type { TextFormatType } from 'lexical'; // Use type-only import
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode,
  ListNode,
} from '@lexical/list';
import { $findMatchingParent } from '@lexical/utils';

const LexicalToolbar: React.FC = () => {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = React.useState(false);
  const [isItalic, setIsItalic] = React.useState(false);
  const [isUL, setIsUL] = React.useState(false);
  const [isOL, setIsOL] = React.useState(false);

  const updateToolbar = React.useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Update text format states
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));

      // Update list states
      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent();
              return parent !== null && $isListNode(parent);
            });

      if (element === null) {
        setIsUL(false);
        setIsOL(false);
      } else {
        const type = $isListNode(element) ? element.getListType() : null;
        setIsUL(type === 'bullet');
        setIsOL(type === 'number');
      }
    }
  }, [editor]);

  React.useEffect(() => {
    // Register listener for selection changes
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar();
      });
    });
  }, [editor, updateToolbar]);

  const formatText = (format: TextFormatType) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  const formatList = (type: 'bullet' | 'number') => {
    if (type === 'bullet') {
      if (!isUL) {
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
      } else {
        editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
      }
    } else { // type === 'number'
      if (!isOL) {
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
      } else {
        editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
      }
    }
  };

  return (
    <div style={styles.toolbar}>
      <button 
        onClick={() => formatText('bold')} 
        style={{ ...styles.button, ...(isBold ? styles.buttonActive : {}) }}
        aria-pressed={isBold}
        title="Bold (Cmd+B)"
      >
        B
      </button>
      <button 
        onClick={() => formatText('italic')} 
        style={{ ...styles.button, ...(isItalic ? styles.buttonActive : {}) }}
        aria-pressed={isItalic}
        title="Italic (Cmd+I)"
      >
        I
      </button>
      <button 
        onClick={() => formatList('bullet')} 
        style={{ ...styles.button, ...(isUL ? styles.buttonActive : {}) }}
        aria-pressed={isUL}
        title="Unordered List"
      >
        UL
      </button>
      <button 
        onClick={() => formatList('number')} 
        style={{ ...styles.button, ...(isOL ? styles.buttonActive : {}) }}
        aria-pressed={isOL}
        title="Ordered List"
      >
        OL
      </button>
    </div>
  );
};

const styles = {
  toolbar: {
    display: 'flex',
    gap: '0.5rem',
    padding: '0.5rem',
    borderBottom: '1px solid #e0e0e0',
    backgroundColor: '#f9f9f9',
  } as React.CSSProperties,
  button: {
    padding: '0.3rem 0.6rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 600,
  } as React.CSSProperties,
  buttonActive: {
    backgroundColor: '#e0e0e0',
    borderColor: '#bbb',
  } as React.CSSProperties,
};

export default LexicalToolbar;
