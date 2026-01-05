import { useState, useRef, useCallback, useEffect } from 'react';

import { ThemeProvider } from './context/ThemeContext';
import ThemeToggle from './components/ThemeToggle'; // Kept for SettingsModal usage if needed, or remove if direct import. 
// Actually I should remove it from App.jsx and import SettingsModal
import SettingsModal from './components/SettingsModal';
import CodeView from './components/CodeView';
import ImportModal from './components/ImportModal';
import ExportModal from './components/ExportModal';
import PropertiesPanel from './components/PropertiesPanel';
import IframePreview from './components/IframePreview';
import DomTree from './components/DomTree';
import ElementsToolbar from './components/ElementsToolbar';
import WorkspaceModal from './components/WorkspaceModal';
import TemplatesModal from './components/TemplatesModal';
import { createDraft, updateDraft, getDrafts } from './api';

import './index.css';

const BLANK_CONTENT = `<div style="padding: 40px; min-height: 200px;"></div>`;

const DEMO_CONTENT = `
<div style="padding: 20px; font-family: Georgia, serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #7c3aed; font-size: 28px;">Welcome to the Email Editor</h1>
  <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">
    Import your HTML email to get started. This editor preserves all your table layouts and inline styles.
  </p>
  <ul style="font-size: 16px; line-height: 1.8; color: #4b5563;">
    <li><strong>Click</strong> any element to select it and edit its styles</li>
    <li><strong>Double-click</strong> text to edit it inline</li>
    <li><strong>Use the Properties Panel</strong> on the right to adjust CSS</li>
  </ul>
</div>
`;

function AppContent() {
  // Workspace state
  const [workspaceName, setWorkspaceName] = useState('Untitled');
  const [currentDraftId, setCurrentDraftId] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // UI state
  const [domTreeOpen, setDomTreeOpen] = useState(true);
  const [codeViewOpen, setCodeViewOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [workspaceModalOpen, setWorkspaceModalOpen] = useState(false);
  const [templatesModalOpen, setTemplatesModalOpen] = useState(false);


  const [propertiesPanelOpen, setPropertiesPanelOpen] = useState(true);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  // Editor state
  const [currentHtml, setCurrentHtml] = useState(DEMO_CONTENT);
  const [selectedElement, setSelectedElement] = useState(null);
  const [domTree, setDomTree] = useState(null);
  
  const iframeRef = useRef(null);
  const autoSaveTimerRef = useRef(null);
  const selectedElementRef = useRef(null); // Keep track of selected element without re-renders

  // Load last saved workspace on startup
  useEffect(() => {
    const loadLastWorkspace = async () => {
      try {
        const drafts = await getDrafts();
        if (drafts && drafts.length > 0) {
          // Load the most recent draft
          const lastDraft = drafts[0];
          setCurrentHtml(lastDraft.html || DEMO_CONTENT);
          setWorkspaceName(lastDraft.name || 'Untitled');
          setCurrentDraftId(lastDraft.id);
        }
      } catch (error) {
        console.error('Failed to load last workspace:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadLastWorkspace();
  }, []);

  // Auto-save: Creates/updates a SEPARATE auto-save draft (NAME-autosave)
  const autoSaveDraftIdRef = useRef(null);
  
  useEffect(() => {
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setInterval(async () => {
      // Don't auto-save if the current workspace IS an auto-save
      if (workspaceName.endsWith('-autosave')) {
        return;
      }
      
      if (currentHtml) {
        try {
          let htmlToSave = currentHtml;
          if (iframeRef.current && iframeRef.current.getHtml) {
            htmlToSave = iframeRef.current.getHtml();
          }
          
          // Use clean name + -autosave suffix
          const baseName = workspaceName.replace(/-autosave$/, '');
          const autoSaveName = `${baseName}-autosave`;
          
          if (autoSaveDraftIdRef.current) {
            await updateDraft(autoSaveDraftIdRef.current, autoSaveName, htmlToSave);
          } else {
            const draft = await createDraft(autoSaveName, htmlToSave);
            autoSaveDraftIdRef.current = draft.id;
          }
          setLastSaved(new Date());
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }
    }, 30000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [currentHtml, workspaceName]);

  // Manual save
  const handleSave = useCallback(async () => {
    if (!currentHtml) return;
    
    try {
      setIsSaving(true);
      
      // Get latest HTML from iframe
      let htmlToSave = currentHtml;
      if (iframeRef.current && iframeRef.current.getHtml) {
        htmlToSave = iframeRef.current.getHtml();
      }
      
      if (currentDraftId) {
        await updateDraft(currentDraftId, workspaceName, htmlToSave);
      } else {
        const draft = await createDraft(workspaceName, htmlToSave);
        setCurrentDraftId(draft.id);
      }
      setCurrentHtml(htmlToSave);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [currentHtml, currentDraftId, workspaceName]);

  // Load workspace
  const handleLoadWorkspace = useCallback((workspace) => {
    setCurrentHtml(workspace.html || BLANK_CONTENT);
    setWorkspaceName(workspace.name || 'Untitled');
    setCurrentDraftId(workspace.id);
    setSelectedElement(null);
    selectedElementRef.current = null;
    setWorkspaceModalOpen(false);
  }, []);

  // New workspace - BLANK page
  const handleNewWorkspace = useCallback(() => {
    setCurrentHtml(BLANK_CONTENT);
    setWorkspaceName('Untitled');
    setCurrentDraftId(null);
    setSelectedElement(null);
    selectedElementRef.current = null;
    setLastSaved(null);
  }, []);

  // Load template
  const handleSelectTemplate = useCallback((html, name) => {
    setCurrentHtml(html);
    setWorkspaceName(name || 'From Template');
    setCurrentDraftId(null);
    setSelectedElement(null);
    selectedElementRef.current = null;
    setLastSaved(null);
  }, []);

  const handleImport = useCallback((html) => {
    setCurrentHtml(html);
    setSelectedElement(null);
    selectedElementRef.current = null;
    setCurrentDraftId(null);
    setWorkspaceName('Imported Email');
  }, []);

  const handleCodeChange = useCallback((html) => {
    setCurrentHtml(html);
  }, []);

  const getHtml = useCallback(() => {
    if (iframeRef.current && iframeRef.current.getHtml) {
      return iframeRef.current.getHtml();
    }
    return currentHtml;
  }, [currentHtml]);

  // Handle element selection from iframe - use ref to avoid re-renders
  const handleElementSelect = useCallback((element) => {
    selectedElementRef.current = element;
    setSelectedElement(element);
  }, []);

  // Handle style change from properties panel - use ref to maintain selection
  const handleStyleChange = useCallback((styleString) => {
    const element = selectedElementRef.current;
    if (element) {
      element.setAttribute('style', styleString);
      // Don't update currentHtml here to avoid re-render and focus loss
    }
  }, []);

  // Handle attribute change from properties panel (e.g., href, target)
  const handleAttributeChange = useCallback((name, value) => {
    const element = selectedElementRef.current;
    if (element) {
      if (value === null || value === undefined) {
        element.removeAttribute(name);
      } else {
        element.setAttribute(name, value);
      }
    }
  }, []);

  // Sync HTML state when user finishes editing (on blur or explicit save)
  const syncHtmlFromIframe = useCallback(() => {
    if (iframeRef.current && iframeRef.current.getHtml) {
      setCurrentHtml(iframeRef.current.getHtml());
    }
  }, []);

  // Handle DOM tree updates from iframe
  const handleDomUpdate = useCallback((tree) => {
    setDomTree(tree);
  }, []);

  // Handle element selection from DOM tree
  const handleDomTreeSelect = useCallback((path, element) => {
    if (element) {
      selectedElementRef.current = element;
      setSelectedElement(element);
      // Tell iframe to highlight this element
      if (iframeRef.current && iframeRef.current.selectElement) {
        iframeRef.current.selectElement(element);
      }
    }
  }, []);

  // Handle element drop from toolbar
  const handleElementDrop = useCallback((html) => {
    if (iframeRef.current && iframeRef.current.insertElement) {
      iframeRef.current.insertElement(html);
      setTimeout(() => {
        if (iframeRef.current && iframeRef.current.getHtml) {
          setCurrentHtml(iframeRef.current.getHtml());
        }
      }, 100);
    }
  }, []);

  // Handle element drop from DOM tree
  const handleDomTreeDrop = useCallback((html, targetElement, position) => {
    if (!targetElement) return;
    
    try {
      const temp = document.createElement('div');
      temp.innerHTML = html;
      const newElement = temp.firstElementChild;
      
      if (newElement) {
        newElement.setAttribute('draggable', 'true');
        
        if (position === 'before') {
          targetElement.parentNode.insertBefore(newElement, targetElement);
        } else if (position === 'after') {
          targetElement.parentNode.insertBefore(newElement, targetElement.nextSibling);
        } else {
          targetElement.appendChild(newElement);
        }
        
        setTimeout(() => {
          if (iframeRef.current && iframeRef.current.getHtml) {
            setCurrentHtml(iframeRef.current.getHtml());
          }
        }, 100);
      }
    } catch (err) {
      console.error('DOM tree drop failed:', err);
    }
  }, []);

  // Handle reordering elements within DOM tree
  const handleDomTreeReorder = useCallback((sourcePath, targetPath, targetElement, position) => {
    if (!targetElement || sourcePath === targetPath) return;
    
    // Find source element by traversing the tree
    const findElementByPath = (tree, path) => {
      if (!tree) return null;
      if (tree.path === path) return tree.element;
      for (const child of tree.children || []) {
        const found = findElementByPath(child, path);
        if (found) return found;
      }
      return null;
    };
    
    const sourceElement = findElementByPath(domTree, sourcePath);
    if (!sourceElement || sourceElement === targetElement) return;
    
    // Don't allow dropping into own descendants
    if (sourceElement.contains(targetElement)) return;
    
    try {
      if (position === 'before') {
        targetElement.parentNode.insertBefore(sourceElement, targetElement);
      } else if (position === 'after') {
        targetElement.parentNode.insertBefore(sourceElement, targetElement.nextSibling);
      } else {
        // inside
        targetElement.appendChild(sourceElement);
      }
      
      setTimeout(() => {
        if (iframeRef.current && iframeRef.current.getHtml) {
          setCurrentHtml(iframeRef.current.getHtml());
        }
      }, 100);
    } catch (err) {
      console.error('DOM tree reorder failed:', err);
    }
  }, [domTree]);

  // Handle delete from DOM tree
  const handleDomTreeDelete = useCallback((element) => {
    if (!element || !element.parentNode) return;
    
    try {
      element.remove();
      selectedElementRef.current = null;
      setSelectedElement(null);
      
      // Sync HTML
      setTimeout(() => {
        if (iframeRef.current && iframeRef.current.getHtml) {
          setCurrentHtml(iframeRef.current.getHtml());
        }
      }, 50);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="app loading-screen">
        <div className="spinner" />
        <p>Loading workspace...</p>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <div className="logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            <span>Email Editor</span>
          </div>
        </div>

        <div className="header-right">
          <button className="btn btn-ghost" onClick={handleNewWorkspace} title="New blank workspace">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            New
          </button>

          <button className="btn btn-ghost" onClick={() => setTemplatesModalOpen(true)} title="Start from template">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            Templates
          </button>

          <button className="btn btn-ghost" onClick={() => setWorkspaceModalOpen(true)} title="Open saved workspace">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
            Open
          </button>
          
          <button className="btn btn-secondary" onClick={() => setImportModalOpen(true)}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Import
          </button>
          
          <button className="btn btn-primary" onClick={() => setExportModalOpen(true)}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export
          </button>
          
          <div className="toolbar-divider" />
          
          <button 
            className={`btn btn-ghost btn-icon ${domTreeOpen ? 'active' : ''}`}
            onClick={() => setDomTreeOpen(!domTreeOpen)}
            title="Toggle DOM Tree"
            style={{ background: domTreeOpen ? 'var(--primary-light)' : 'transparent' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </button>

          <button 
            className={`btn btn-ghost btn-icon ${codeViewOpen ? 'active' : ''}`}
            onClick={() => setCodeViewOpen(!codeViewOpen)}
            title="Toggle Code View"
            style={{ background: codeViewOpen ? 'var(--primary-light)' : 'transparent' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 18 22 12 16 6"/>
              <polyline points="8 6 2 12 8 18"/>
            </svg>
          </button>

          <button 
            className={`btn btn-ghost btn-icon ${propertiesPanelOpen ? 'active' : ''}`}
            onClick={() => setPropertiesPanelOpen(!propertiesPanelOpen)}
            title="Toggle Properties Panel"
            style={{ background: propertiesPanelOpen ? 'var(--primary-light)' : 'transparent' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M9 3v18"/>
              <path d="M14 9h4"/>
              <path d="M14 13h4"/>
              <path d="M14 17h4"/>
            </svg>
          </button>
          
          <button 
            className="btn btn-ghost btn-icon"
            onClick={() => setSettingsModalOpen(true)}
            title="Settings"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
        </div>
      </header>

      {/* Workspace Bar */}
      <div className="workspace-bar">
        <div className="workspace-bar-left">
          <input
            type="text"
            className="workspace-name-input"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            placeholder="Workspace name..."
          />
          <button 
            className="btn btn-primary btn-sm"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <svg className="spin" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="20"/>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                Save
              </>
            )}
          </button>
        </div>
        <div className="workspace-bar-right">
          {lastSaved && (
            <span className="last-saved">
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
          {selectedElement && (
            <span className="selected-tag">
              &lt;{selectedElement.tagName?.toLowerCase() || 'element'}&gt;
            </span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Left Panel: DOM Tree + Elements */}
        {domTreeOpen && (
          <div className="left-panel">
            <ElementsToolbar onElementDrop={handleElementDrop} />
            <DomTree 
              tree={domTree} 
              selectedElement={selectedElement}
              onSelect={handleDomTreeSelect}
              onDrop={handleDomTreeDrop}
              onReorder={handleDomTreeReorder}
              onDelete={handleDomTreeDelete}
            />
          </div>
        )}

        {/* Editor Container */}
        <div className="editor-container">
          {/* Editor/Code View */}
          <div className="editor-wrapper">
            {/* Visual Preview (Iframe) */}
            <div className="editor-panel">
              <div className="editor-panel-header">
                <span>Visual Preview</span>
              </div>
              <IframePreview 
                ref={iframeRef}
                html={currentHtml}
                onElementSelect={handleElementSelect}
                selectedElement={selectedElement}
                onDomUpdate={handleDomUpdate}
                onHtmlChange={handleCodeChange}
              />
            </div>

            {/* Code View (side by side) */}
            {codeViewOpen && (
              <CodeView 
                html={currentHtml} 
                onHtmlChange={handleCodeChange}
                selectedElement={selectedElement}
              />
            )}

            {/* Properties Panel */}
            {propertiesPanelOpen && (
              <div className="editor-sidebar-right">
                <PropertiesPanel 
                  isOpen={propertiesPanelOpen} 
                  selectedElement={selectedElement}
                  onStyleChange={handleStyleChange}
                  onAttributeChange={handleAttributeChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ImportModal 
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={handleImport}
      />
      
      <ExportModal 
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        getHtml={getHtml}
      />

      <WorkspaceModal
        isOpen={workspaceModalOpen}
        onClose={() => setWorkspaceModalOpen(false)}
        onLoad={handleLoadWorkspace}
      />

      <TemplatesModal
        isOpen={templatesModalOpen}
        onClose={() => setTemplatesModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />
    </div>
  );
}

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/editor" element={
            <ProtectedRoute>
              <AppContent />
            </ProtectedRoute>
          } />
        </Routes>
      </ThemeProvider>
    </Router>
  );
}

export default App;
