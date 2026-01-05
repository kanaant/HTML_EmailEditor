import { useState, useEffect, useCallback } from 'react';
import { getDrafts, deleteDraft } from '../../api';

const WorkspaceModal = ({ isOpen, onClose, onLoad }) => {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const fetchWorkspaces = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const drafts = await getDrafts();
      setWorkspaces(drafts || []);
    } catch (err) {
      setError('Failed to load workspaces');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchWorkspaces();
    }
  }, [isOpen, fetchWorkspaces]);

  const handleDelete = useCallback(async (e, id) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!window.confirm('Delete this workspace? This cannot be undone.')) {
      return;
    }
    
    try {
      setDeleting(id);
      await deleteDraft(id);
      setWorkspaces(prev => prev.filter(w => w.id !== id));
    } catch (err) {
      console.error('Failed to delete:', err);
      alert('Failed to delete workspace');
    } finally {
      setDeleting(null);
    }
  }, []);

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Unknown date';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal workspace-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
            Saved Workspaces
          </h2>
          <button className="modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="modal-content">
          {loading ? (
            <div className="workspace-loading">
              <div className="spinner" />
              <p>Loading workspaces...</p>
            </div>
          ) : error ? (
            <div className="workspace-error">
              <p>{error}</p>
              <button className="btn btn-secondary" onClick={fetchWorkspaces}>Retry</button>
            </div>
          ) : workspaces.length === 0 ? (
            <div className="workspace-empty">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
              <p>No saved workspaces yet</p>
              <p className="muted">Click Save to store your work</p>
            </div>
          ) : (
            <div className="workspace-list">
              {workspaces.map(workspace => (
                <div 
                  key={workspace.id}
                  className="workspace-item"
                  onClick={() => onLoad(workspace)}
                >
                  <div className="workspace-item-icon">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                  </div>
                  <div className="workspace-item-info">
                    <span className="workspace-item-name">{workspace.name || 'Untitled'}</span>
                    <span className="workspace-item-date">{formatDate(workspace.updatedAt)}</span>
                  </div>
                  <button 
                    className="workspace-item-delete"
                    onClick={(e) => handleDelete(e, workspace.id)}
                    disabled={deleting === workspace.id}
                    title="Delete workspace"
                  >
                    {deleting === workspace.id ? (
                      <div className="spinner-small" />
                    ) : (
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkspaceModal;
