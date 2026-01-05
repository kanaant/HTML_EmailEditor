import { useState, useEffect, useCallback } from 'react';
import { getStarterTemplates, getTemplates } from '../../api';

const TemplatesModal = ({ isOpen, onClose, onSelectTemplate }) => {
  const [starterTemplates, setStarterTemplates] = useState([]);
  const [userTemplates, setUserTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Load templates from backend
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      Promise.all([
        getStarterTemplates().catch(() => []),
        getTemplates().catch(() => [])
      ])
        .then(([starter, user]) => {
          setStarterTemplates(starter || []);
          setUserTemplates(user || []);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  // Combine starter templates with user templates
  const allTemplates = [
    ...starterTemplates,
    ...userTemplates.map(t => ({
      ...t,
      category: 'My Templates',
      preview: '📝'
    }))
  ];

  // Get unique categories
  const categories = [
    'All',
    ...new Set(starterTemplates.map(t => t.category)),
    ...(userTemplates.length > 0 ? ['My Templates'] : [])
  ];

  // Filter by category
  const filteredTemplates = selectedCategory === 'All' 
    ? allTemplates 
    : allTemplates.filter(t => t.category === selectedCategory);

  const handleSelect = useCallback((template) => {
    onSelectTemplate(template.html, template.name);
    onClose();
  }, [onSelectTemplate, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal templates-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            Choose a Template
          </h2>
          <button className="modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="templates-categories">
          {categories.map(cat => (
            <button
              key={cat}
              className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="modal-content">
          {loading ? (
            <div className="templates-loading">
              <div className="spinner" />
              <p>Loading templates...</p>
            </div>
          ) : (
            <div className="templates-grid">
              {filteredTemplates.map(template => (
                <div 
                  key={template.id} 
                  className="template-card"
                  onClick={() => handleSelect(template)}
                >
                  <div className="template-preview">
                    <span className="template-emoji">{template.preview}</span>
                  </div>
                  <div className="template-info">
                    <h3>{template.name}</h3>
                    <span className="template-category">{template.category}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplatesModal;
