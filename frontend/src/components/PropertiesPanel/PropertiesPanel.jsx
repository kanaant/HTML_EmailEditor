import { useState, useEffect, useRef, useCallback } from 'react';

const STYLE_GROUPS = [
  {
    name: 'Layout',
    properties: [
      { key: 'display', label: 'Display', type: 'select', options: ['block', 'inline', 'inline-block', 'flex', 'grid', 'none'] },
      { key: 'position', label: 'Position', type: 'select', options: ['static', 'relative', 'absolute', 'fixed'] },
      { key: 'flexDirection', label: 'Flex Dir', type: 'select', options: ['row', 'row-reverse', 'column', 'column-reverse'] },
      { key: 'justifyContent', label: 'Justify', type: 'select', options: ['flex-start', 'flex-end', 'center', 'space-between', 'space-around'] },
      { key: 'alignItems', label: 'Align', type: 'select', options: ['stretch', 'flex-start', 'flex-end', 'center', 'baseline'] },
      { key: 'gap', label: 'Gap', type: 'text', placeholder: '10px' },
    ]
  },
  {
    name: 'Position',
    properties: [
      { key: 'top', label: 'Top', type: 'text', placeholder: '0' },
      { key: 'right', label: 'Right', type: 'text', placeholder: '0' },
      { key: 'bottom', label: 'Bottom', type: 'text', placeholder: '0' },
      { key: 'left', label: 'Left', type: 'text', placeholder: '0' },
      { key: 'zIndex', label: 'Z-Index', type: 'text', placeholder: 'auto' },
    ]
  },
  {
    name: 'Size',
    properties: [
      { key: 'width', label: 'Width', type: 'text', placeholder: 'auto' },
      { key: 'height', label: 'Height', type: 'text', placeholder: 'auto' },
      { key: 'maxWidth', label: 'Max W', type: 'text', placeholder: 'none' },
      { key: 'minHeight', label: 'Min H', type: 'text', placeholder: '0' },
    ]
  },
  {
    name: 'Spacing',
    properties: [
      { key: 'padding', label: 'Padding', type: 'text', placeholder: '0' },
      { key: 'paddingTop', label: 'Pad Top', type: 'text', placeholder: '0' },
      { key: 'paddingRight', label: 'Pad Right', type: 'text', placeholder: '0' },
      { key: 'paddingBottom', label: 'Pad Bot', type: 'text', placeholder: '0' },
      { key: 'paddingLeft', label: 'Pad Left', type: 'text', placeholder: '0' },
      { key: 'margin', label: 'Margin', type: 'text', placeholder: '0' },
    ]
  },
  {
    name: 'Typography',
    properties: [
      { key: 'fontSize', label: 'Size', type: 'text', placeholder: '16px' },
      { key: 'fontWeight', label: 'Weight', type: 'select', options: ['normal', 'bold', '300', '400', '500', '600', '700'] },
      { key: 'textAlign', label: 'Align', type: 'select', options: ['left', 'center', 'right', 'justify'] },
      { key: 'lineHeight', label: 'Line H', type: 'text', placeholder: '1.5' },
      { key: 'color', label: 'Color', type: 'color' },
    ]
  },
  {
    name: 'Background',
    properties: [
      { key: 'backgroundColor', label: 'Color', type: 'color' },
      { key: 'backgroundImage', label: 'Image', type: 'text', placeholder: 'url(...)' },
    ]
  },
  {
    name: 'Border',
    properties: [
      { key: 'borderWidth', label: 'Width', type: 'text', placeholder: '1px' },
      { key: 'borderStyle', label: 'Style', type: 'select', options: ['none', 'solid', 'dashed', 'dotted', 'double'] },
      { key: 'borderColor', label: 'Color', type: 'color' },
      { key: 'borderRadius', label: 'Radius', type: 'text', placeholder: '0' },
    ]
  },
];

const toKebabCase = (str) => str.replace(/([A-Z])/g, '-$1').toLowerCase();

const parseStyleString = (styleStr) => {
  if (!styleStr) return {};
  const styles = {};
  styleStr.split(';').forEach(rule => {
    const colonIndex = rule.indexOf(':');
    if (colonIndex > 0) {
      const prop = rule.slice(0, colonIndex).trim();
      const value = rule.slice(colonIndex + 1).trim();
      if (prop && value) {
        const camelProp = prop.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        styles[camelProp] = value;
      }
    }
  });
  return styles;
};

const styleObjectToString = (styleObj) => {
  return Object.entries(styleObj)
    .filter(([_, value]) => value)
    .map(([key, value]) => `${toKebabCase(key)}: ${value}`)
    .join('; ');
};

const rgbToHex = (rgb) => {
  if (!rgb) return '#000000';
  if (rgb.startsWith('#')) return rgb;
  const match = rgb.match(/\d+/g);
  if (match && match.length >= 3) {
    return '#' + match.slice(0, 3).map(x => {
      const h = parseInt(x).toString(16);
      return h.length === 1 ? '0' + h : h;
    }).join('');
  }
  return '#000000';
};

const PropertiesPanel = ({ isOpen, selectedElement, onStyleChange, onAttributeChange }) => {
  const [styles, setStyles] = useState({});
  const [expandedGroups, setExpandedGroups] = useState({ 
    Layout: true, Spacing: true, Background: true, Border: true, 
    Link: true, Image: true, Table: true, Cell: true, Button: true, Video: true 
  });
  const [elementTag, setElementTag] = useState('');
  const [linkAttributes, setLinkAttributes] = useState({ href: '', target: '' });
  const [imageAttributes, setImageAttributes] = useState({ src: '', alt: '' });
  const [tableAttributes, setTableAttributes] = useState({ cellpadding: '', cellspacing: '', border: '', width: '', align: '' });
  const [cellAttributes, setCellAttributes] = useState({ colspan: '', rowspan: '', valign: '', align: '', bgcolor: '' });
  const [buttonAttributes, setButtonAttributes] = useState({ type: '' });
  const [videoAttributes, setVideoAttributes] = useState({ src: '', poster: '' });
  
  const elementRef = useRef(null);

  // Update styles when element changes
  useEffect(() => {
    if (selectedElement) {
      elementRef.current = selectedElement;
      const tag = selectedElement.tagName?.toLowerCase() || '';
      setElementTag(tag);

      // Handle Link Attributes
      if (tag === 'a') {
        setLinkAttributes({
          href: selectedElement.getAttribute('href') || '',
          target: selectedElement.getAttribute('target') || ''
        });
      }

      // Handle Image Attributes
      if (tag === 'img') {
        setImageAttributes({
          src: selectedElement.getAttribute('src') || '',
          alt: selectedElement.getAttribute('alt') || ''
        });
      }

      // Handle Table Attributes
      if (tag === 'table') {
        setTableAttributes({
          cellpadding: selectedElement.getAttribute('cellpadding') || '',
          cellspacing: selectedElement.getAttribute('cellspacing') || '',
          border: selectedElement.getAttribute('border') || '',
          width: selectedElement.getAttribute('width') || '',
          align: selectedElement.getAttribute('align') || ''
        });
      }

      // Handle Cell Attributes (td/th)
      if (tag === 'td' || tag === 'th') {
        setCellAttributes({
          colspan: selectedElement.getAttribute('colspan') || '',
          rowspan: selectedElement.getAttribute('rowspan') || '',
          valign: selectedElement.getAttribute('valign') || '',
          align: selectedElement.getAttribute('align') || '',
          bgcolor: selectedElement.getAttribute('bgcolor') || ''
        });
      }

      // Handle Button Attributes
      if (tag === 'button') {
        setButtonAttributes({
          type: selectedElement.getAttribute('type') || ''
        });
      }

      // Handle Video Attributes
      if (tag === 'video') {
        setVideoAttributes({
          src: selectedElement.getAttribute('src') || '',
          poster: selectedElement.getAttribute('poster') || ''
        });
      }

      const styleAttr = selectedElement.getAttribute('style') || '';
      const parsedStyles = parseStyleString(styleAttr);
      
      // Get computed styles for colors that might be set via CSS
      try {
        const win = selectedElement.ownerDocument?.defaultView;
        if (win) {
          const computed = win.getComputedStyle(selectedElement);
          
          // Background color
          if (!parsedStyles.backgroundColor || parsedStyles.backgroundColor === 'transparent') {
            const bg = computed.backgroundColor;
            if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
              parsedStyles.backgroundColor = bg;
            }
          }
          
          // Text color
          if (!parsedStyles.color) {
            parsedStyles.color = computed.color;
          }
          
          // Border
          if (!parsedStyles.borderWidth && computed.borderWidth && computed.borderWidth !== '0px') {
            parsedStyles.borderWidth = computed.borderWidth;
          }
          if (!parsedStyles.borderStyle && computed.borderStyle && computed.borderStyle !== 'none') {
            parsedStyles.borderStyle = computed.borderStyle;
          }
          if (!parsedStyles.borderColor) {
            parsedStyles.borderColor = computed.borderColor;
          }
        }
      } catch (e) {
        // Ignore cross-origin errors
      }
      
      setStyles(parsedStyles);
    } else {
      elementRef.current = null;
      setStyles({});
      setElementTag('');
      setLinkAttributes({ href: '', target: '' });
      setImageAttributes({ src: '', alt: '' });
      setTableAttributes({ cellpadding: '', cellspacing: '', border: '', width: '', align: '' });
      setCellAttributes({ colspan: '', rowspan: '', valign: '', align: '', bgcolor: '' });
      setButtonAttributes({ type: '' });
      setVideoAttributes({ src: '', poster: '' });
    }
  }, [selectedElement]);

  const handleStyleChange = useCallback((property, value) => {
    setStyles(prev => {
      const newStyles = { ...prev };
      if (value) {
        newStyles[property] = value;
      } else {
        delete newStyles[property];
      }
      
      if (elementRef.current && onStyleChange) {
        const styleString = styleObjectToString(newStyles);
        onStyleChange(styleString);
      }
      
      return newStyles;
    });
  }, [onStyleChange]);

  const handleLinkChange = useCallback((property, value) => {
    setLinkAttributes(prev => {
      const newAttrs = { ...prev, [property]: value };
      
      if (elementRef.current && onAttributeChange) {
        onAttributeChange(property, value);
      }
      
      return newAttrs;
    });
  }, [onAttributeChange]);

  const handleImageChange = useCallback((property, value) => {
    setImageAttributes(prev => {
      const newAttrs = { ...prev, [property]: value };
      
      if (elementRef.current && onAttributeChange) {
        onAttributeChange(property, value);
      }
      
      return newAttrs;
    });
  }, [onAttributeChange]);

  const handleTableChange = useCallback((property, value) => {
    setTableAttributes(prev => {
      const newAttrs = { ...prev, [property]: value };
      
      if (elementRef.current && onAttributeChange) {
        onAttributeChange(property, value);
      }
      
      return newAttrs;
    });
  }, [onAttributeChange]);

  const handleCellChange = useCallback((property, value) => {
    setCellAttributes(prev => {
      const newAttrs = { ...prev, [property]: value };
      
      if (elementRef.current && onAttributeChange) {
        onAttributeChange(property, value);
      }
      
      return newAttrs;
    });
  }, [onAttributeChange]);

  const handleButtonChange = useCallback((property, value) => {
    setButtonAttributes(prev => {
      const newAttrs = { ...prev, [property]: value };
      
      if (elementRef.current && onAttributeChange) {
        onAttributeChange(property, value);
      }
      
      return newAttrs;
    });
  }, [onAttributeChange]);

  const handleVideoChange = useCallback((property, value) => {
    setVideoAttributes(prev => {
      const newAttrs = { ...prev, [property]: value };
      
      if (elementRef.current && onAttributeChange) {
        onAttributeChange(property, value);
      }
      
      return newAttrs;
    });
  }, [onAttributeChange]);

  const toggleGroup = useCallback((groupName) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  }, []);

  const handlePanelClick = useCallback((e) => {
    e.stopPropagation();
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="properties-panel" onClick={handlePanelClick} onMouseDown={handlePanelClick}>
      <div className="properties-panel-header">
        <span>Properties</span>
        {elementTag && (
          <span className="element-tag">&lt;{elementTag}&gt;</span>
        )}
      </div>
      
      <div className="properties-panel-content">
        {!selectedElement ? (
          <div className="properties-empty">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M15 15l6 6m-11-4a7 7 0 110-14 7 7 0 010 14z"/>
            </svg>
            <p>Select an element</p>
          </div>
        ) : (
          <>
            {/* Link Settings Group */}
            {elementTag === 'a' && (
              <div className="properties-group">
                <button 
                  className="properties-group-header"
                  onClick={() => toggleGroup('Link')}
                  type="button"
                >
                  <span>Link Settings</span>
                  <svg 
                    viewBox="0 0 24 24" 
                    width="14" 
                    height="14" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    style={{ transform: expandedGroups['Link'] ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                
                {expandedGroups['Link'] && (
                  <div className="properties-group-content">
                    <div className="property-row">
                      <label className="property-label">URL</label>
                      <input
                        type="text"
                        className="property-input"
                        value={linkAttributes.href}
                        onChange={(e) => handleLinkChange('href', e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="https://example.com"
                      />
                    </div>
                    <div className="property-row" style={{ alignItems: 'center' }}>
                      <label className="property-label">New Tab</label>
                      <input
                        type="checkbox"
                        checked={linkAttributes.target === '_blank'}
                        onChange={(e) => handleLinkChange('target', e.target.checked ? '_blank' : '')}
                        style={{ width: '16px', height: '16px' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Image Settings Group */}
            {elementTag === 'img' && (
              <div className="properties-group">
                <button 
                  className="properties-group-header"
                  onClick={() => toggleGroup('Image')}
                  type="button"
                >
                  <span>Image Settings</span>
                  <svg 
                    viewBox="0 0 24 24" 
                    width="14" 
                    height="14" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    style={{ transform: expandedGroups['Image'] ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                
                {expandedGroups['Image'] && (
                  <div className="properties-group-content">
                    <div className="property-row">
                      <label className="property-label">Image URL</label>
                      <input
                        type="text"
                        className="property-input"
                        value={imageAttributes.src}
                        onChange={(e) => handleImageChange('src', e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div className="property-row">
                      <label className="property-label">Alt Text</label>
                      <input
                        type="text"
                        className="property-input"
                        value={imageAttributes.alt}
                        onChange={(e) => handleImageChange('alt', e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Image description"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Table Settings Group */}
            {elementTag === 'table' && (
              <div className="properties-group">
                <button 
                  className="properties-group-header"
                  onClick={() => toggleGroup('Table')}
                  type="button"
                >
                  <span>Table Settings</span>
                  <svg 
                    viewBox="0 0 24 24" 
                    width="14" 
                    height="14" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    style={{ transform: expandedGroups['Table'] ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                
                {expandedGroups['Table'] && (
                  <div className="properties-group-content">
                    <div className="property-row">
                      <label className="property-label">Cell Padding</label>
                      <input
                        type="text"
                        className="property-input"
                        value={tableAttributes.cellpadding}
                        onChange={(e) => handleTableChange('cellpadding', e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="0"
                      />
                    </div>
                    <div className="property-row">
                      <label className="property-label">Cell Spacing</label>
                      <input
                        type="text"
                        className="property-input"
                        value={tableAttributes.cellspacing}
                        onChange={(e) => handleTableChange('cellspacing', e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="0"
                      />
                    </div>
                    <div className="property-row">
                      <label className="property-label">Border</label>
                      <input
                        type="text"
                        className="property-input"
                        value={tableAttributes.border}
                        onChange={(e) => handleTableChange('border', e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="0"
                      />
                    </div>
                    <div className="property-row">
                      <label className="property-label">Width</label>
                      <input
                        type="text"
                        className="property-input"
                        value={tableAttributes.width}
                        onChange={(e) => handleTableChange('width', e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="100%"
                      />
                    </div>
                    <div className="property-row">
                      <label className="property-label">Align</label>
                      <select
                        className="property-select"
                        value={tableAttributes.align}
                        onChange={(e) => handleTableChange('align', e.target.value)}
                      >
                        <option value="">—</option>
                        <option value="left">left</option>
                        <option value="center">center</option>
                        <option value="right">right</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cell Settings Group (td/th) */}
            {(elementTag === 'td' || elementTag === 'th') && (
              <div className="properties-group">
                <button 
                  className="properties-group-header"
                  onClick={() => toggleGroup('Cell')}
                  type="button"
                >
                  <span>Cell Settings</span>
                  <svg 
                    viewBox="0 0 24 24" 
                    width="14" 
                    height="14" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    style={{ transform: expandedGroups['Cell'] ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                
                {expandedGroups['Cell'] && (
                  <div className="properties-group-content">
                    <div className="property-row">
                      <label className="property-label">Colspan</label>
                      <input
                        type="text"
                        className="property-input"
                        value={cellAttributes.colspan}
                        onChange={(e) => handleCellChange('colspan', e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="1"
                      />
                    </div>
                    <div className="property-row">
                      <label className="property-label">Rowspan</label>
                      <input
                        type="text"
                        className="property-input"
                        value={cellAttributes.rowspan}
                        onChange={(e) => handleCellChange('rowspan', e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="1"
                      />
                    </div>
                    <div className="property-row">
                      <label className="property-label">V Align</label>
                      <select
                        className="property-select"
                        value={cellAttributes.valign}
                        onChange={(e) => handleCellChange('valign', e.target.value)}
                      >
                        <option value="">—</option>
                        <option value="top">top</option>
                        <option value="middle">middle</option>
                        <option value="bottom">bottom</option>
                      </select>
                    </div>
                    <div className="property-row">
                      <label className="property-label">Align</label>
                      <select
                        className="property-select"
                        value={cellAttributes.align}
                        onChange={(e) => handleCellChange('align', e.target.value)}
                      >
                        <option value="">—</option>
                        <option value="left">left</option>
                        <option value="center">center</option>
                        <option value="right">right</option>
                      </select>
                    </div>
                    <div className="property-row">
                      <label className="property-label">BG Color</label>
                      <input
                        type="text"
                        className="property-input"
                        value={cellAttributes.bgcolor}
                        onChange={(e) => handleCellChange('bgcolor', e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Button Settings Group */}
            {elementTag === 'button' && (
              <div className="properties-group">
                <button 
                  className="properties-group-header"
                  onClick={() => toggleGroup('Button')}
                  type="button"
                >
                  <span>Button Settings</span>
                  <svg 
                    viewBox="0 0 24 24" 
                    width="14" 
                    height="14" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    style={{ transform: expandedGroups['Button'] ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                
                {expandedGroups['Button'] && (
                  <div className="properties-group-content">
                    <div className="property-row">
                      <label className="property-label">Type</label>
                      <select
                        className="property-select"
                        value={buttonAttributes.type}
                        onChange={(e) => handleButtonChange('type', e.target.value)}
                      >
                        <option value="">—</option>
                        <option value="button">button</option>
                        <option value="submit">submit</option>
                        <option value="reset">reset</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Video Settings Group */}
            {elementTag === 'video' && (
              <div className="properties-group">
                <button 
                  className="properties-group-header"
                  onClick={() => toggleGroup('Video')}
                  type="button"
                >
                  <span>Video Settings</span>
                  <svg 
                    viewBox="0 0 24 24" 
                    width="14" 
                    height="14" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    style={{ transform: expandedGroups['Video'] ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                
                {expandedGroups['Video'] && (
                  <div className="properties-group-content">
                    <div className="property-row">
                      <label className="property-label">Video URL</label>
                      <input
                        type="text"
                        className="property-input"
                        value={videoAttributes.src}
                        onChange={(e) => handleVideoChange('src', e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="https://example.com/video.mp4"
                      />
                    </div>
                    <div className="property-row">
                      <label className="property-label">Poster</label>
                      <input
                        type="text"
                        className="property-input"
                        value={videoAttributes.poster}
                        onChange={(e) => handleVideoChange('poster', e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="https://example.com/poster.jpg"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Standard Style Groups */}
            {STYLE_GROUPS.map(group => (
              <div key={group.name} className="properties-group">
                <button 
                  className="properties-group-header"
                  onClick={() => toggleGroup(group.name)}
                  type="button"
                >
                  <span>{group.name}</span>
                  <svg 
                    viewBox="0 0 24 24" 
                    width="14" 
                    height="14" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    style={{ transform: expandedGroups[group.name] ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                
                {expandedGroups[group.name] && (
                  <div className="properties-group-content">
                    {group.properties.map(prop => (
                      <div key={prop.key} className="property-row">
                        <label className="property-label">{prop.label}</label>
                        <div className="property-input-wrapper">
                          {prop.type === 'color' ? (
                            <div className="property-color-wrapper">
                              <input
                                type="color"
                                className="property-color"
                                value={rgbToHex(styles[prop.key]) || '#000000'}
                                onChange={(e) => handleStyleChange(prop.key, e.target.value)}
                              />
                              <input
                                type="text"
                                className="property-input property-color-text"
                                value={styles[prop.key] || ''}
                                onChange={(e) => handleStyleChange(prop.key, e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="#000000"
                              />
                            </div>
                          ) : prop.type === 'select' ? (
                            <select
                              className="property-select"
                              value={styles[prop.key] || ''}
                              onChange={(e) => handleStyleChange(prop.key, e.target.value)}
                            >
                              <option value="">—</option>
                              {prop.options.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              className="property-input"
                              value={styles[prop.key] || ''}
                              onChange={(e) => handleStyleChange(prop.key, e.target.value)}
                              onKeyDown={handleKeyDown}
                              placeholder={prop.placeholder}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default PropertiesPanel;
