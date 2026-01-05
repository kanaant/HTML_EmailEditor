import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { buildTree } from '../DomTree';

// Extract body content from full HTML document
const extractBodyContent = (htmlString) => {
  if (!htmlString) return '';
  
  // If the HTML contains a body tag, extract its content
  const bodyMatch = htmlString.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    return bodyMatch[1];
  }
  
  // If no body tag, check if it has DOCTYPE, html, or head tags that need stripping
  if (htmlString.includes('<!DOCTYPE') || htmlString.includes('<html') || htmlString.includes('<head')) {
    // Create a temp element to parse and extract useful content
    const temp = document.createElement('div');
    temp.innerHTML = htmlString;
    // Remove any stray meta, link, style, title, head elements that shouldn't be in body
    temp.querySelectorAll('meta, link, title, head, style, script').forEach(el => el.remove());
    return temp.innerHTML;
  }
  
  // Otherwise return as-is
  return htmlString;
};

const IframePreview = forwardRef(({ html, onElementSelect, selectedElement, onDomUpdate, onHtmlChange }, ref) => {
  const iframeRef = useRef(null);
  const iframeDocRef = useRef(null);
  const selectedElementRef = useRef(null);

  // Sync HTML back to parent
  const syncHtml = useCallback(() => {
    if (iframeDocRef.current && onHtmlChange) {
      const clone = iframeDocRef.current.body.cloneNode(true);
      // Remove internal classes
      clone.querySelectorAll('.wysiwyg-selected, .wysiwyg-hover, .drop-before, .drop-after, .drop-inside, .drop-left, .drop-right').forEach(el => {
        el.classList.remove('wysiwyg-selected', 'wysiwyg-hover', 'drop-before', 'drop-after', 'drop-inside', 'drop-left', 'drop-right');
        if (el.classList.length === 0) el.removeAttribute('class');
      });
      clone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
      clone.querySelectorAll('[draggable]').forEach(el => el.removeAttribute('draggable'));
      onHtmlChange(clone.innerHTML);
    }
  }, [onHtmlChange]);

  // Update DOM tree
  const updateDomTree = useCallback(() => {
    if (iframeDocRef.current && onDomUpdate) {
      const tree = buildTree(iframeDocRef.current.body);
      onDomUpdate(tree);
    }
  }, [onDomUpdate]);

  // Combined sync
  const syncAll = useCallback(() => {
    updateDomTree();
    syncHtml();
  }, [updateDomTree, syncHtml]);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    getHtml: () => {
      if (iframeDocRef.current) {
        const clone = iframeDocRef.current.body.cloneNode(true);
        clone.querySelectorAll('.wysiwyg-selected, .wysiwyg-hover, .drop-before, .drop-after, .drop-inside, .drop-left, .drop-right').forEach(el => {
          el.classList.remove('wysiwyg-selected', 'wysiwyg-hover', 'drop-before', 'drop-after', 'drop-inside', 'drop-left', 'drop-right');
          if (el.classList.length === 0) el.removeAttribute('class');
        });
        clone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
        clone.querySelectorAll('[draggable]').forEach(el => el.removeAttribute('draggable'));
        return clone.innerHTML;
      }
      return '';
    },
    selectElement: (element) => {
      if (iframeDocRef.current && element) {
        iframeDocRef.current.querySelectorAll('.wysiwyg-selected').forEach(el => el.classList.remove('wysiwyg-selected'));
        element.classList.add('wysiwyg-selected');
        selectedElementRef.current = element;
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    },
    insertElement: (htmlContent) => {
      if (iframeDocRef.current) {
        const temp = document.createElement('div');
        temp.innerHTML = htmlContent;
        const newElement = temp.firstElementChild;
        if (newElement) {
          newElement.setAttribute('draggable', 'true');
          iframeDocRef.current.body.appendChild(newElement);
          syncAll();
        }
      }
    },
    deleteSelected: () => {
      if (selectedElementRef.current && selectedElementRef.current.parentNode) {
        selectedElementRef.current.remove();
        selectedElementRef.current = null;
        onElementSelect?.(null);
        syncAll();
      }
    }
  }));

  const canContainChildren = (el) => {
    const tags = ['DIV', 'SECTION', 'ARTICLE', 'MAIN', 'ASIDE', 'HEADER', 'FOOTER', 'NAV', 'TD', 'TH', 'LI', 'UL', 'OL', 'TABLE', 'TBODY', 'TR', 'FORM', 'FIGURE', 'BODY'];
    return tags.includes(el.tagName);
  };

  useEffect(() => {
    if (!iframeRef.current) return;
    
    const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
    iframeDocRef.current = doc;
    
    // Extract only body content to prevent meta/head tags from appearing in DOM tree
    const bodyContent = extractBodyContent(html) || '<div style="padding: 40px; min-height: 200px;"></div>';
    
    doc.open();
    doc.write(`<!DOCTYPE html><html><head><style>
      * { box-sizing: border-box; }
      body { margin: 0; padding: 0; min-height: 100vh; cursor: default; }
      body.drop-active { background: rgba(16, 185, 129, 0.08) !important; outline: 2px dashed #10b981; outline-offset: -2px; }
      .wysiwyg-selected { outline: 2px solid #7c3aed !important; outline-offset: 2px; }
      .wysiwyg-hover:not(.wysiwyg-selected):not(.drop-inside) { outline: 1px dashed #a78bfa !important; outline-offset: 1px; }
      .drop-before { box-shadow: inset 0 3px 0 0 #10b981 !important; }
      .drop-after { box-shadow: inset 0 -3px 0 0 #10b981 !important; }
      .drop-left { box-shadow: inset 3px 0 0 0 #10b981 !important; }
      .drop-right { box-shadow: inset -3px 0 0 0 #10b981 !important; }
      .drop-inside { outline: 3px dashed #10b981 !important; outline-offset: -3px; background: rgba(16, 185, 129, 0.15) !important; }
      [draggable="true"] { cursor: grab; }
      [contenteditable="true"] { cursor: text !important; outline: 2px solid #10b981 !important; user-select: text !important; -webkit-user-select: text !important; }
    </style></head><body>${bodyContent}</body></html>`);
    doc.close();

    // Make all elements draggable
    const makeDraggable = (el) => {
      if (el.nodeType === 1) {
        el.setAttribute('draggable', 'true');
        Array.from(el.children).forEach(makeDraggable);
      }
    };
    Array.from(doc.body.children).forEach(makeDraggable);

    setTimeout(updateDomTree, 100);

    // Click handler
    const handleClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (e.target === doc.body) {
        doc.querySelectorAll('.wysiwyg-selected').forEach(el => el.classList.remove('wysiwyg-selected'));
        selectedElementRef.current = null;
        onElementSelect?.(null);
        return;
      }

      doc.querySelectorAll('.wysiwyg-selected').forEach(el => el.classList.remove('wysiwyg-selected'));
      e.target.classList.add('wysiwyg-selected');
      selectedElementRef.current = e.target;
      onElementSelect?.(e.target);
    };

    // Double click to edit text
    const handleDblClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const target = e.target;
      if (['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'SPAN', 'A', 'TD', 'TH', 'LI', 'STRONG', 'EM', 'DIV', 'BUTTON'].includes(target.tagName)) {
        target.setAttribute('contenteditable', 'true');
        target.removeAttribute('draggable');
        target.focus();
        const range = doc.createRange();
        range.selectNodeContents(target);
        const sel = iframeRef.current.contentWindow.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    };

    const handleBlur = (e) => {
      if (e.target.hasAttribute('contenteditable')) {
        e.target.removeAttribute('contenteditable');
        if (e.target.nodeType === 1) {
          e.target.setAttribute('draggable', 'true');
        }
        syncAll();
      }
    };

    const handleMouseOver = (e) => {
      if (e.target !== doc.body) e.target.classList.add('wysiwyg-hover');
    };

    const handleMouseOut = (e) => {
      e.target.classList.remove('wysiwyg-hover');
    };

    // Delete key
    const handleKeyDown = (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementRef.current) {
        if (doc.activeElement?.hasAttribute('contenteditable')) return;
        e.preventDefault();
        const el = selectedElementRef.current;
        if (el && el.parentNode && el !== doc.body) {
          el.remove();
          selectedElementRef.current = null;
          onElementSelect?.(null);
          syncAll();
        }
      }
    };

    // Drag and drop
    let draggedElement = null;
    let dropMode = 'after';
    let currentDropTarget = null;

    const clearDropIndicators = () => {
      doc.querySelectorAll('.drop-before, .drop-after, .drop-inside, .drop-left, .drop-right').forEach(el => {
        el.classList.remove('drop-before', 'drop-after', 'drop-inside', 'drop-left', 'drop-right');
      });
      doc.body.classList.remove('drop-active');
    };

    const handleDragStart = (e) => {
      if (e.target.hasAttribute('draggable')) {
        draggedElement = e.target;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', 'internal');
      }
    };

    const handleDragEnd = () => {
      if (draggedElement) draggedElement = null;
      clearDropIndicators();
      currentDropTarget = null;
    };

    const handleDragOver = (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = draggedElement ? 'move' : 'copy';
      
      let target = e.target;
      if (target === draggedElement) return;
      
      if (currentDropTarget && currentDropTarget !== target) {
        currentDropTarget.classList.remove('drop-before', 'drop-after', 'drop-inside', 'drop-left', 'drop-right');
      }
      
      if (target === doc.body || target === doc.documentElement) {
        clearDropIndicators();
        doc.body.classList.add('drop-active');
        dropMode = 'inside';
        currentDropTarget = doc.body;
        return;
      }
      
      doc.body.classList.remove('drop-active');
      currentDropTarget = target;
      target.classList.remove('drop-before', 'drop-after', 'drop-inside', 'drop-left', 'drop-right');
      
      const rect = target.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width;
      const relY = (e.clientY - rect.top) / rect.height;
      const edge = 0.3;
      
      if (relY < edge) {
        dropMode = 'before';
        target.classList.add('drop-before');
      } else if (relY > 1 - edge) {
        dropMode = 'after';
        target.classList.add('drop-after');
      } else if (canContainChildren(target)) {
        dropMode = 'inside';
        target.classList.add('drop-inside');
      } else {
        dropMode = 'after';
        target.classList.add('drop-after');
      }
    };

    const handleDragLeave = (e) => {
      if (!e.relatedTarget || !doc.body.contains(e.relatedTarget)) {
        clearDropIndicators();
      }
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const externalHtml = e.dataTransfer.getData('text/html');
      const isInternal = e.dataTransfer.getData('text/plain') === 'internal';
      
      let target = currentDropTarget || e.target;
      let elementToInsert = null;
      
      if (externalHtml && !isInternal) {
        const temp = document.createElement('div');
        temp.innerHTML = externalHtml;
        elementToInsert = temp.firstElementChild;
        if (elementToInsert) elementToInsert.setAttribute('draggable', 'true');
      } else if (draggedElement && target !== draggedElement && !draggedElement.contains(target)) {
        elementToInsert = draggedElement;
      }
      
      if (elementToInsert) {
        try {
          if (target === doc.body || target === doc.documentElement) {
            doc.body.appendChild(elementToInsert);
          } else if (dropMode === 'inside' && canContainChildren(target)) {
            target.appendChild(elementToInsert);
          } else if (dropMode === 'before') {
            target.parentNode.insertBefore(elementToInsert, target);
          } else {
            target.parentNode.insertBefore(elementToInsert, target.nextSibling);
          }
          
          makeDraggable(elementToInsert);
          doc.querySelectorAll('.wysiwyg-selected').forEach(el => el.classList.remove('wysiwyg-selected'));
          elementToInsert.classList.add('wysiwyg-selected');
          selectedElementRef.current = elementToInsert;
          onElementSelect?.(elementToInsert);
        } catch (err) {
          console.error('Drop failed:', err);
        }
      }

      clearDropIndicators();
      currentDropTarget = null;
      syncAll();
    };

    // Attach listeners
    doc.body.addEventListener('click', handleClick);
    doc.body.addEventListener('dblclick', handleDblClick);
    doc.body.addEventListener('blur', handleBlur, true);
    doc.body.addEventListener('mouseover', handleMouseOver);
    doc.body.addEventListener('mouseout', handleMouseOut);
    doc.addEventListener('keydown', handleKeyDown);
    doc.body.addEventListener('dragstart', handleDragStart);
    doc.body.addEventListener('dragend', handleDragEnd);
    doc.body.addEventListener('dragover', handleDragOver);
    doc.body.addEventListener('dragleave', handleDragLeave);
    doc.body.addEventListener('drop', handleDrop);

    return () => {
      if (doc.body) {
        doc.body.removeEventListener('click', handleClick);
        doc.body.removeEventListener('dblclick', handleDblClick);
        doc.body.removeEventListener('blur', handleBlur, true);
        doc.body.removeEventListener('mouseover', handleMouseOver);
        doc.body.removeEventListener('mouseout', handleMouseOut);
        doc.removeEventListener('keydown', handleKeyDown);
        doc.body.removeEventListener('dragstart', handleDragStart);
        doc.body.removeEventListener('dragend', handleDragEnd);
        doc.body.removeEventListener('dragover', handleDragOver);
        doc.body.removeEventListener('dragleave', handleDragLeave);
        doc.body.removeEventListener('drop', handleDrop);
      }
    };
  }, [html, onElementSelect, onDomUpdate, updateDomTree, syncAll, syncHtml]);

  useEffect(() => {
    if (iframeDocRef.current && selectedElement) {
      iframeDocRef.current.querySelectorAll('.wysiwyg-selected').forEach(el => el.classList.remove('wysiwyg-selected'));
      if (selectedElement.classList) {
        selectedElement.classList.add('wysiwyg-selected');
        selectedElementRef.current = selectedElement;
      }
    }
  }, [selectedElement]);

  return (
    <div className="iframe-preview-container">
      <iframe ref={iframeRef} title="Email Preview" className="iframe-preview" sandbox="allow-same-origin allow-scripts" />
    </div>
  );
});

export default IframePreview;
