import { useState, useCallback } from 'react';

// Build tree from DOM element
export const buildTree = (element, path = '0') => {
  if (!element || element.nodeType !== 1) return null;
  
  const tagName = element.tagName?.toLowerCase() || 'unknown';
  const id = element.id || null;
  const className = element.className ? 
    (typeof element.className === 'string' ? element.className : element.className.baseVal || '') : '';
  
  const cleanedClass = className
    .replace(/wysiwyg-selected|wysiwyg-hover|drop-before|drop-after|drop-inside|drop-left|drop-right/g, '')
    .trim();
  
  let preview = '';
  if (element.childNodes.length > 0) {
    for (const child of element.childNodes) {
      if (child.nodeType === 3) {
        preview = child.textContent?.trim().slice(0, 30) || '';
        if (preview) break;
      }
    }
  }
  
  const children = [];
  let childIndex = 0;
  for (const child of element.children) {
    if (child.nodeType === 1) {
      const childTree = buildTree(child, `${path}-${childIndex}`);
      if (childTree) {
        children.push(childTree);
        childIndex++;
      }
    }
  }
  
  return { path, tagName, id, className: cleanedClass, preview, children, element };
};

const TreeNode = ({ node, selectedElement, onSelect, onDrop, onReorder, onDelete, level = 0 }) => {
  const [expanded, setExpanded] = useState(level < 2);
  const [dropTarget, setDropTarget] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedElement === node.element;
  
  const handleToggle = (e) => {
    e.stopPropagation();
    setExpanded(prev => !prev);
  };
  
  const handleClick = (e) => {
    e.stopPropagation();
    onSelect(node.path, node.element);
  };

  const handleKeyDown = (e) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && isSelected) {
      e.preventDefault();
      e.stopPropagation();
      if (onDelete) {
        onDelete(node.element);
      }
    }
  };

  const handleDragStart = (e) => {
    e.stopPropagation();
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/x-tree-node', node.path);
    e.dataTransfer.setData('text/plain', 'tree-internal');
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDropTarget(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;
    
    if (y < height * 0.25) {
      setDropTarget('before');
    } else if (y > height * 0.75) {
      setDropTarget('after');
    } else {
      setDropTarget('inside');
    }
  };

  const handleDragLeave = (e) => {
    e.stopPropagation();
    setDropTarget(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const html = e.dataTransfer.getData('text/html');
    const isTreeInternal = e.dataTransfer.getData('text/plain') === 'tree-internal';
    const sourcePath = e.dataTransfer.getData('application/x-tree-node');
    
    if (isTreeInternal && sourcePath && onReorder) {
      onReorder(sourcePath, node.path, node.element, dropTarget || 'inside');
    } else if (html && onDrop) {
      onDrop(html, node.element, dropTarget || 'inside');
    }
    
    setDropTarget(null);
  };
  
  return (
    <div 
      className={`tree-node ${isDragging ? 'dragging' : ''}`} 
      style={{ marginLeft: level > 0 ? 12 : 0 }}
      tabIndex={isSelected ? 0 : -1}
      onKeyDown={handleKeyDown}
    >
      <div 
        className={`tree-node-content ${isSelected ? 'selected' : ''} ${dropTarget ? `drop-${dropTarget}` : ''}`}
        onClick={handleClick}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {hasChildren ? (
          <button className="tree-expand-btn" onClick={handleToggle}>
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}>
              <polyline points="9 6 15 12 9 18"/>
            </svg>
          </button>
        ) : (
          <span className="tree-spacer" />
        )}
        
        <span className="tree-tag">{node.tagName}</span>
        {node.id && <span className="tree-id">#{node.id}</span>}
        {node.className && <span className="tree-class">.{node.className.split(' ')[0]}</span>}
        {node.preview && <span className="tree-preview">"{node.preview.slice(0, 15)}..."</span>}
      </div>
      
      {hasChildren && expanded && (
        <div className="tree-children">
          {node.children.map(child => (
            <TreeNode 
              key={child.path}
              node={child}
              selectedElement={selectedElement}
              onSelect={onSelect}
              onDrop={onDrop}
              onReorder={onReorder}
              onDelete={onDelete}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const DomTree = ({ tree, selectedElement, onSelect, onDrop, onReorder, onDelete }) => {
  return (
    <div className="dom-tree">
      <div className="dom-tree-header">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
        DOM Structure
      </div>
      
      <div className="dom-tree-content">
        {!tree ? (
          <div className="dom-tree-empty"><p>No content</p></div>
        ) : tree.children && tree.children.length > 0 ? (
          tree.children.map(child => (
            <TreeNode 
              key={child.path}
              node={child}
              selectedElement={selectedElement}
              onSelect={onSelect}
              onDrop={onDrop}
              onReorder={onReorder}
              onDelete={onDelete}
              level={0}
            />
          ))
        ) : (
          <div className="dom-tree-empty"><p>Empty document</p></div>
        )}
      </div>
    </div>
  );
};

export default DomTree;
