import React, { useMemo } from 'react';
import { createHeadlessEditor } from '@lexical/headless'; // Correct import path
import { $generateHtmlFromNodes } from '@lexical/html';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';

interface LexicalRendererProps {
  content: string; // Stringified Lexical JSON state
  previewLength?: number; // Optional length for preview
}

// Define the editor configuration (needs to match the nodes used in NoteEditor)
const editorConfig = {
  namespace: 'LexicalRenderer',
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
  onError: (error: Error) => {
    console.error("Error in LexicalRenderer editor:", error);
  },
  // Theme is not strictly needed for headless rendering to HTML, but good practice
  theme: { 
    ltr: 'ltr',
    rtl: 'rtl',
    paragraph: 'editor-paragraph', // Example class
    // Add other necessary theme classes if styles depend on them during HTML generation
  },
};

// Create a single headless editor instance (can be reused)
const headlessEditor = createHeadlessEditor(editorConfig);

const LexicalRenderer: React.FC<LexicalRendererProps> = ({ content, previewLength }) => {
  const html = useMemo(() => {
    if (!content) {
      return '';
    }

    try {
      // Attempt to parse the content string into an EditorState JSON object
      const editorStateJSON = JSON.parse(content);
      
      // Import the JSON into the editor state
      const editorState = headlessEditor.parseEditorState(editorStateJSON);

      // Generate HTML within the editor's update cycle
      let generatedHtml = '';
      editorState.read(() => {
        // Generate HTML using the headless editor instance
        generatedHtml = $generateHtmlFromNodes(headlessEditor, null); 
      });

      // Basic preview logic (can be improved)
      if (previewLength) {
         // Simple truncation based on characters (might cut mid-tag)
         // A more robust solution would parse the HTML and truncate text nodes
         if (generatedHtml.length > previewLength) {
            // Find the end of the last full word within the limit
            const truncated = generatedHtml.substring(0, previewLength);
            const lastSpace = truncated.lastIndexOf(' ');
            generatedHtml = (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + '...';
         }
      }

      return generatedHtml;

    } catch (error) {
      console.error("Failed to parse/render Lexical content:", error);
      // Fallback: Display the raw content if parsing fails (treat as plain text)
      // Basic escaping to prevent XSS from potentially malformed content string
      // --- Commenting out fallback due to persistent syntax errors ---
      // let escapedContent = String(content || ''); // Ensure content is a string
      // escapedContent = escapedContent.replace(/&/g, "&"); 
      // escapedContent = escapedContent.replace(/</g, "<");
      // escapedContent = escapedContent.replace(/>/g, ">");
      // escapedContent = escapedContent.replace(/"/g, """); 
      // escapedContent = escapedContent.replace(/'/g, "&#039;");
      // return `<p>${escapedContent}</p>`; 
      // --- End commented out fallback ---
      return '<p>[Error rendering note content]</p>'; // Return error message instead
    }
  }, [content, previewLength]);

  // Render the generated HTML using dangerouslySetInnerHTML
  // Ensure the content source is trusted (originates from your Lexical editor)
  // Ensure html is always a string, defaulting to empty string if null/undefined
  return <div dangerouslySetInnerHTML={{ __html: html || '' }} />;
};

export default LexicalRenderer;
