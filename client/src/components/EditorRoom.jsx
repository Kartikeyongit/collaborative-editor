import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { 
  Box, Button, Typography, Select, MenuItem, Paper, 
  IconButton, Chip, Avatar, LinearProgress
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import { useSocket } from '../context/SocketContext';
import useEditorStore from '../store/editorStore';
import UserList from './UserList';
import VersionHistory from './VersionHistory';
import AISuggestions from './AISuggestions';
import VideoChat from './VideoChat';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SaveIcon from '@mui/icons-material/Save';

const LANGUAGES = [
  { id: 'javascript', name: 'JavaScript' },
  { id: 'python', name: 'Python' },
  { id: 'java', name: 'Java' },
  { id: 'cpp', name: 'C++' },
  { id: 'typescript', name: 'TypeScript' },
];

function EditorRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const { socket, connected } = useSocket();
  const [users, setUsers] = useState([]);
  const [username] = useState(() => `User-${Math.floor(Math.random() * 1000)}`);
  const [isRunning, setIsRunning] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedCode, setLastSavedCode] = useState('');
  
  const {
    code,
    language,
    output,
    setCode,
    setLanguage,
    setOutput,
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory
  } = useEditorStore();

  useEffect(() => {
    if (!socket || !connected) return;

    socket.emit('join-room', { roomId, username });
    clearHistory();

    socket.on('document-update', ({ content, userId }) => {
      if (userId !== socket.id) {
        setCode(content);
      }
    });

    socket.on('init-document', ({ content, language }) => {
      if (content) setCode(content);
      if (language) setLanguage(language);
    });

    socket.on('room-users', (userList) => {
      setUsers(userList);
    });

    socket.on('execution-result', (result) => {
      setIsRunning(false);
      setOutput(result.output || 'No output');
    });

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveVersion();
      }
    };
  
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      socket.off('document-update');
      socket.off('init-document');
      socket.off('room-users');
      socket.off('execution-result');
    };
  }, [socket, connected, roomId]);

  const handleEditorChange = useCallback((value) => {
    setCode(value);
    if (value !== lastSavedCode) {
      setIsDirty(true);
    }
    if (socket) {
      socket.emit('document-change', {
        roomId,
        content: value,
        language,
      });
    }
  }, [socket, roomId, language, setCode]);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    if (socket) {
      socket.emit('document-change', {
        roomId,
        content: code,
        language: newLanguage,
      });
    }
  };

  const handleRunCode = () => {
    if (socket) {
      setIsRunning(true);
      setOutput('Running...');
      socket.emit('execute-code', {
        roomId,
        code,
        language,
      });
    }
  };

  const handleUndo = () => {
    const previousCode = undo();
    if (previousCode !== undefined && socket) {
      socket.emit('document-change', {
        roomId,
        content: previousCode,
        language,
      });
    }
  };

  const handleRedo = () => {
    const nextCode = redo();
    if (nextCode !== undefined && socket) {
      socket.emit('document-change', {
        roomId,
        content: nextCode,
        language,
      });
    }
  };

  const handleRestoreVersion = (version) => {
    setCode(version.content);
    if (version.language) setLanguage(version.language);
    if (socket) {
      socket.emit('document-change', {
        roomId,
        content: version.content,
        language: version.language,
      });
    }
  };

  const handleInsertSnippet = (snippetText) => {
    if (editorRef.current) {
      const editor = editorRef.current;
      const position = editor.getPosition();
      
      // Insert the snippet at cursor position
      editor.executeEdits('ai-suggestion', [{
        range: {
          startLineNumber: position.lineNumber,
          startColumn: position.column,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        },
        text: snippetText
      }]);
      
      // Update code state
      const newCode = editor.getValue();
      setCode(newCode);
      
      if (socket) {
        socket.emit('document-change', {
          roomId,
          content: newCode,
          language,
        });
      }
      
      editor.focus();
    }
  };

  const handleSaveVersion = () => {
    if (socket && code) {
      socket.emit('save-version', { roomId });
      setLastSavedCode(code);
      setIsDirty(false);
      setSaveMessage('✓ Version saved!');
      setTimeout(() => setSaveMessage(''), 2000);
    }
  };

return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
        <Paper sx={{ 
        width: 280, 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden',
        flexShrink: 0
        }}>
        {/* Room Info */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6" noWrap sx={{ mb: 1 }}>
            Room: {roomId}
            </Typography>
            <Button 
            variant="outlined" 
            size="small" 
            onClick={() => navigate('/')}
            fullWidth
            sx={{ mb: 1 }}
            >
            Leave Room
            </Button>
            <Typography variant="caption" color="text.secondary">
            {users.length} user{users.length !== 1 ? 's' : ''} connected
            </Typography>
        </Box>
        
        {/* Scrollable Content */}
        <Box sx={{ flex: 1, overflow: 'auto', px: 2 }}>
            {/* Video Chat */}
            <VideoChat roomId={roomId} />
            
            {/* User List */}
            <Box sx={{ mt: 2 }}>
            <UserList users={users} />
            </Box>
            
            {/* AI Suggestions */}
            <AISuggestions 
            language={language} 
            onInsert={handleInsertSnippet}
            />
        </Box>
        
        {/* Version History - Fixed at bottom */}
        <Box sx={{ 
            p: 2, 
            borderTop: 1, 
            borderColor: 'divider', 
            overflow: 'auto', 
            maxHeight: '250px',
            flexShrink: 0
        }}>
            <VersionHistory roomId={roomId} onRestore={handleRestoreVersion} socket={socket} />
        </Box>
        </Paper>

      {/* Main Editor Area */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        minWidth: 0 // Prevents overflow
      }}>
        {/* Toolbar */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          p: 1, 
          backgroundColor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          gap: 1,
          flexWrap: 'wrap',
          flexShrink: 0
        }}>
          <Select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            size="small"
            sx={{ minWidth: 130 }}
          >
            {LANGUAGES.map(lang => (
              <MenuItem key={lang.id} value={lang.id}>
                {lang.name}
              </MenuItem>
            ))}
          </Select>
          
          <IconButton onClick={handleUndo} disabled={!canUndo()} title="Undo (Ctrl+Z)">
            <UndoIcon />
          </IconButton>
          
          <IconButton onClick={handleRedo} disabled={!canRedo()} title="Redo (Ctrl+Shift+Z)">
            <RedoIcon />
          </IconButton>
          
          <Button
            variant="contained"
            startIcon={<PlayArrowIcon />}
            onClick={handleRunCode}
            disabled={isRunning}
            size="small"
          >
            {isRunning ? 'Running...' : 'Run'}
          </Button>

          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={handleSaveVersion}
            size="small"
            color="success"
          >
            Save
          </Button>

          {isDirty && (
            <Typography variant="caption" color="warning.main" sx={{ ml: 0.5 }}>
              ●
            </Typography>
          )}

          {saveMessage && (
            <Typography variant="caption" color="success.main" sx={{ ml: 1 }}>
              {saveMessage}
            </Typography>
          )}
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Typography variant="body2" color="text.secondary">
            {users.length} user{users.length !== 1 ? 's' : ''} connected
          </Typography>
        </Box>

        {/* Loading indicator for execution */}
        {isRunning && <LinearProgress />}

        {/* Editor - takes remaining space */}
        <Box sx={{ 
          flex: 1, 
          minHeight: 0, // Important for flex child
          overflow: 'hidden'
        }}>
          <Editor
            height="100%"
            language={language}
            value={code}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on',
              automaticLayout: true,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              renderWhitespace: 'selection',
            }}
          />
        </Box>

        {/* Output Panel - same height as sidebar bottom */}
        {output && (
          <Paper sx={{ 
            height: '300px',  // Match sidebar's maxHeight
            flexShrink: 0,
            borderTop: 2,
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Box sx={{ 
              p: 1, 
              backgroundColor: 'background.paper',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: 1,
              borderColor: 'divider',
              flexShrink: 0
            }}>
              <Typography variant="caption" fontWeight="bold">
                OUTPUT
              </Typography>
              <IconButton 
                size="small" 
                onClick={() => setOutput('')}
              >
                ✕
              </IconButton>
            </Box>
            <Box sx={{ 
              flex: 1,
              p: 2, 
              overflow: 'auto',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              backgroundColor: '#1e1e1e',
              color: '#d4d4d4',
              whiteSpace: 'pre-wrap',
              minHeight: 0
            }}>
              {output}
            </Box>
          </Paper>
        )}
      </Box>
    </Box>
  );
}

export default EditorRoom;