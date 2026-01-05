import { useState } from 'react';
import { createTemplate, createDraft } from '../../api';

const SaveModal = ({ isOpen, onClose, getHtml, onSaved }) => {
  const [name, setName] = useState('');
  const [saveAs, setSaveAs] = useState('template');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Please enter a name');
      return;
    }

    setSaving(true);
    try {
      const html = getHtml();
      if (saveAs === 'template') {
        await createTemplate(name, html);
      } else {
        await createDraft(name, html);
      }
      onSaved?.();
      setName('');
      onClose();
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <h2 className="modal-title">Save</h2>
          <button className="modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter a name..."
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Save as</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className={`btn ${saveAs === 'template' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSaveAs('template')}
                style={{ flex: 1 }}
              >
                Template
              </button>
              <button
                className={`btn ${saveAs === 'draft' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSaveAs('draft')}
                style={{ flex: 1 }}
              >
                Draft
              </button>
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleSave}
            disabled={saving || !name.trim()}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveModal;
