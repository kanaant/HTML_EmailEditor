import { useState, useCallback } from 'react';

// HTML element types that can be added
const ELEMENT_TYPES = [
  { 
    type: 'div', 
    label: 'Container', 
    icon: '□',
    defaultHtml: '<div style="padding: 20px; border: 1px dashed #ccc;">Container</div>'
  },
  { 
    type: 'p', 
    label: 'Paragraph', 
    icon: '¶',
    defaultHtml: '<p style="margin: 10px 0;">New paragraph text...</p>'
  },
  { 
    type: 'h1', 
    label: 'Heading 1', 
    icon: 'H1',
    defaultHtml: '<h1 style="margin: 10px 0; font-size: 24px;">Heading</h1>'
  },
  { 
    type: 'h2', 
    label: 'Heading 2', 
    icon: 'H2',
    defaultHtml: '<h2 style="margin: 10px 0; font-size: 20px;">Subheading</h2>'
  },
  { 
    type: 'img', 
    label: 'Image', 
    icon: '🖼',
    defaultHtml: '<img src="https://via.placeholder.com/300x150" alt="Placeholder" style="max-width: 100%; display: block;" />'
  },
  { 
    type: 'a', 
    label: 'Link', 
    icon: '🔗',
    defaultHtml: '<a href="#" style="color: #7c3aed; text-decoration: underline;">Link text</a>'
  },
  { 
    type: 'button', 
    label: 'Button', 
    icon: '▣',
    defaultHtml: '<a href="#" style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Click Me</a>'
  },
  { 
    type: 'ul', 
    label: 'List', 
    icon: '≡',
    defaultHtml: '<ul style="margin: 10px 0; padding-left: 20px;"><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>'
  },
  { 
    type: 'table', 
    label: 'Table', 
    icon: '▦',
    defaultHtml: '<table style="width: 100%; border-collapse: collapse;"><tr><td style="border: 1px solid #ddd; padding: 8px;">Cell 1</td><td style="border: 1px solid #ddd; padding: 8px;">Cell 2</td></tr><tr><td style="border: 1px solid #ddd; padding: 8px;">Cell 3</td><td style="border: 1px solid #ddd; padding: 8px;">Cell 4</td></tr></table>'
  },
  { 
    type: 'hr', 
    label: 'Divider', 
    icon: '—',
    defaultHtml: '<hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />'
  },
  { 
    type: 'spacer', 
    label: 'Spacer', 
    icon: '⬜',
    defaultHtml: '<div style="height: 30px;"></div>'
  },
];

const ElementsToolbar = ({ onElementDrag }) => {
  const [draggedElement, setDraggedElement] = useState(null);

  const handleDragStart = useCallback((e, element) => {
    setDraggedElement(element);
    e.dataTransfer.setData('text/html', element.defaultHtml);
    e.dataTransfer.setData('application/x-element-type', element.type);
    e.dataTransfer.effectAllowed = 'copy';
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedElement(null);
  }, []);

  return (
    <div className="elements-toolbar">
      <div className="elements-toolbar-header">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7"/>
          <rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/>
        </svg>
        <span>Elements</span>
      </div>
      <div className="elements-grid">
        {ELEMENT_TYPES.map(element => (
          <div
            key={element.type}
            className={`element-item ${draggedElement?.type === element.type ? 'dragging' : ''}`}
            draggable
            onDragStart={(e) => handleDragStart(e, element)}
            onDragEnd={handleDragEnd}
            title={`Drag to add ${element.label}`}
          >
            <span className="element-icon">{element.icon}</span>
            <span className="element-label">{element.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ElementsToolbar;
