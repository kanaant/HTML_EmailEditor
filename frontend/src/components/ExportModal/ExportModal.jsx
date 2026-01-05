import { useState } from 'react';

const ExportModal = ({ isOpen, onClose, getHtml }) => {
  const [copied, setCopied] = useState(false);
  const [includeWrapper, setIncludeWrapper] = useState(true);

  if (!isOpen) return null;

  const rawHtml = getHtml();

  const wrapHtml = (content) => {
    if (!includeWrapper) return content;
    
    return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Email Template</title>
  <style type="text/css">
    body { margin: 0; padding: 0; min-width: 100%!important; }
    .content { width: 100%; max-width: 600px; }  
  </style>
</head>
<body style="margin: 0; padding: 0;">
  ${content}
</body>
</html>`;
  };

  const finalHtml = wrapHtml(rawHtml);

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(finalHtml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy to clipboard');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([finalHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-overlay">
      <div 
        className="modal" 
        style={{ 
          maxWidth: '1000px', 
          width: '90%', 
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
        }} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header" style={{ background: 'var(--bg-tertiary)' }}>
          <h2 className="modal-title">Export HTML</h2>
          <button className="modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div className="modal-body">
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
              <input 
                type="checkbox" 
                checked={includeWrapper} 
                onChange={(e) => setIncludeWrapper(e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
              <span style={{ fontWeight: 500 }}>Include Email Wrapper (DOCTYPE, HEAD, META)</span>
            </label>
            <p style={{ margin: '4px 0 0 28px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Recommended for best compatibility with email clients (Outlook, Gmail, etc.)
            </p>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <button 
              className="btn btn-primary" 
              onClick={handleCopyToClipboard}
              style={{ flex: 1, padding: '16px' }}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={handleDownload}
              style={{ flex: 1, padding: '16px' }}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download HTML
            </button>
          </div>

          <div className="form-group">
            <label className="form-label">Preview HTML Code</label>
            <textarea
              className="form-textarea code-textarea"
              value={finalHtml}
              readOnly
              rows={12}
              style={{ fontFamily: "'Fira Code', monospace" }}
            />
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
