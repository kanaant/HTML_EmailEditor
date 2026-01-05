import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// Simple HTML prettifier
const prettifyHtml = (html) => {
  if (!html) return '';
  
  let formatted = '';
  let indent = 0;
  const indentStr = '  ';
  
  const selfClosing = ['br', 'hr', 'img', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'param', 'source', 'track', 'wbr'];
  
  // Clean and split by tags
  const clean = html.replace(/>\s+</g, '><').trim();
  const tokens = clean.replace(/></g, '>\n<').split('\n');
  
  tokens.forEach(token => {
    const trimmed = token.trim();
    if (!trimmed) return;
    
    const isClosing = trimmed.startsWith('</');
    const isSelfClosing = trimmed.endsWith('/>') || selfClosing.some(t => {
      const match = trimmed.match(/^<(\w+)/);
      return match && match[1].toLowerCase() === t;
    });
    const isOpening = trimmed.startsWith('<') && !isClosing && !isSelfClosing && !trimmed.includes('</');
    
    if (isClosing) {
      indent = Math.max(0, indent - 1);
    }
    
    formatted += indentStr.repeat(indent) + trimmed + '\n';
    
    if (isOpening) {
      indent++;
    }
  });
  
  return formatted.trim();
};

// Escape HTML for display
const escapeHtml = (str) => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

// Simple syntax highlighting (without nested issues)
const highlightHtml = (code) => {
  if (!code) return '';
  
  const lines = code.split('\n');
  const highlightedLines = lines.map(line => {
    // Escape the line first
    let escaped = escapeHtml(line);
    
    // Highlight tags: <tagname and </tagname
    escaped = escaped.replace(/(&lt;\/?)([\w-]+)/g, '$1<span class="hl-tag">$2</span>');
    
    // Highlight attributes: attr=
    escaped = escaped.replace(/([\w-]+)(=)/g, '<span class="hl-attr">$1</span>$2');
    
    // Highlight quoted strings: "..."
    escaped = escaped.replace(/(&quot;)([^&]*)(&quot;)/g, '$1<span class="hl-str">$2</span>$3');
    
    return escaped;
  });
  
  return highlightedLines.join('\n');
};

const CodeView = ({ html, onHtmlChange, selectedElement }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableHtml, setEditableHtml] = useState('');
  const textareaRef = useRef(null);
  
  // Format the HTML for display
  const formattedHtml = useMemo(() => prettifyHtml(html), [html]);
  
  // Highlighted HTML for display
  const highlightedHtml = useMemo(() => highlightHtml(formattedHtml), [formattedHtml]);
  
  const handleDoubleClick = useCallback(() => {
    setEditableHtml(formattedHtml);
    setIsEditing(true);
  }, [formattedHtml]);
  
  const handleBlur = useCallback(() => {
    setIsEditing(false);
    if (editableHtml.trim() !== formattedHtml.trim()) {
      onHtmlChange(editableHtml);
    }
  }, [editableHtml, formattedHtml, onHtmlChange]);
  
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
    }
  }, []);
  
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);
  
  return (
    <div className="editor-panel code-panel">
      <div className="editor-panel-header">
        <span>HTML Code</span>
        <span className="code-hint">{isEditing ? 'Editing (Esc to cancel)' : 'Double-click to edit'}</span>
      </div>
      <div className="editor-panel-content" style={{ padding: 0 }}>
        {isEditing ? (
          <textarea
            ref={textareaRef}
            className="code-textarea"
            value={editableHtml}
            onChange={(e) => setEditableHtml(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            spellCheck={false}
          />
        ) : (
          <pre 
            className="code-display"
            onDoubleClick={handleDoubleClick}
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        )}
      </div>
    </div>
  );
};

export default CodeView;
