import { useState, useEffect } from 'react';
import { getTemplates, getDrafts, deleteTemplate, deleteDraft } from '../../api';

const Sidebar = ({ isOpen, onLoadItem, onClose }) => {
  const [activeTab, setActiveTab] = useState('templates');
  const [templates, setTemplates] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [templatesData, draftsData] = await Promise.all([
        getTemplates(),
        getDrafts()
      ]);
      setTemplates(templatesData);
      setDrafts(draftsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const handleDelete = async (id, type) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      if (type === 'template') {
        await deleteTemplate(id);
        setTemplates(prev => prev.filter(t => t.id !== id));
      } else {
        await deleteDraft(id);
        setDrafts(prev => prev.filter(d => d.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const items = activeTab === 'templates' ? templates : drafts;

  return (
    <div className={`sidebar ${isOpen ? '' : 'collapsed'}`}>
      <div className="sidebar-header">
        <div className="sidebar-tabs">
          <button
            className={`sidebar-tab ${activeTab === 'templates' ? 'active' : ''}`}
            onClick={() => setActiveTab('templates')}
          >
            Templates
          </button>
          <button
            className={`sidebar-tab ${activeTab === 'drafts' ? 'active' : ''}`}
            onClick={() => setActiveTab('drafts')}
          >
            Drafts
          </button>
        </div>
      </div>
      
      <div className="sidebar-content">
        {loading ? (
          <div className="sidebar-empty">Loading...</div>
        ) : items.length === 0 ? (
          <div className="sidebar-empty">
            No {activeTab} yet.
            <br />
            <small>Save your work to see it here.</small>
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} className="sidebar-item">
              <div 
                className="sidebar-item-name"
                onClick={() => onLoadItem(item)}
              >
                {item.name}
              </div>
              <div className="sidebar-item-date">
                {formatDate(item.updatedAt)}
              </div>
              <div className="sidebar-item-actions">
                <button 
                  className="btn btn-sm btn-primary"
                  onClick={() => onLoadItem(item)}
                >
                  Load
                </button>
                <button 
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(item.id, activeTab === 'templates' ? 'template' : 'draft')}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Sidebar;
