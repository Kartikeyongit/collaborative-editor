import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Typography,
  IconButton,
  Box,
  Divider,
  Chip
} from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import HistoryIcon from '@mui/icons-material/History';
import axios from 'axios';

function VersionHistory({ roomId, onRestore, socket }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (roomId) {
      fetchVersions();
      
      // Listen for new versions in real-time
      if (socket) {
        const handleNewVersion = (version) => {
          setVersions(prev => {
            const updated = [version, ...prev];
            return updated.slice(0, 50);
          });
        };
        
        socket.on('new-version', handleNewVersion);
        
        return () => {
          socket.off('new-version', handleNewVersion);
        };
      }
    }
  }, [roomId, socket]);

  const fetchVersions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:4000/api/code/versions/${roomId}`);
      if (response.data && response.data.versions) {
        setVersions(response.data.versions);
      }
    } catch (error) {
      console.log('Loading versions...');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const getLanguageColor = (language) => {
    const colors = {
      javascript: '#f7df1e',
      python: '#3776ab',
      java: '#007396',
      cpp: '#00599c',
      typescript: '#3178c6'
    };
    return colors[language] || '#888';
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <HistoryIcon sx={{ mr: 1 }} />
        <Typography variant="subtitle2">
          Version History
        </Typography>
      </Box>
      
      <Divider sx={{ mb: 1 }} />
      
      {loading && versions.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
          Loading versions...
        </Typography>
      ) : versions.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
          No versions yet. Click Save or press Ctrl+S to create a version.
        </Typography>
      ) : (
        <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
          {versions.map((version, index) => (
            <ListItem
              key={version.id || index}
              disablePadding
              secondaryAction={
                <IconButton
                  edge="end"
                  size="small"
                  onClick={() => onRestore(version)}
                  title="Restore this version"
                >
                  <RestoreIcon fontSize="small" />
                </IconButton>
              }
            >
              <ListItemButton onClick={() => onRestore(version)}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" noWrap>
                        Version {versions.length - index}
                      </Typography>
                      <Chip
                        label={version.language}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.7rem',
                          backgroundColor: getLanguageColor(version.language),
                          color: '#000'
                        }}
                      />
                    </Box>
                  }
                  secondary={formatDate(version.timestamp)}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
      
      <Box sx={{ mt: 1, p: 1, backgroundColor: 'rgba(76,175,80,0.1)', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          💡 Use Ctrl+S or click Save to create a version
        </Typography>
      </Box>
    </Box>
  );
}

export default VersionHistory;