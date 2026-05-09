import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Chip,
  IconButton,
  Collapse
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import axios from 'axios';

function AISuggestions({ language, onInsert }) {
  const [snippets, setSnippets] = useState([]);
  const [expanded, setExpanded] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    if (language) {
      fetchSnippets();
    }
  }, [language]);

  const fetchSnippets = async () => {
    try {
      const response = await axios.get(`http://localhost:4000/api/ai/snippets/${language}`);
      setSnippets(response.data.snippets || []);
    } catch (error) {
      console.log('Could not fetch AI suggestions');
    }
  };

  const handleInsertSnippet = (snippet) => {
    onInsert(snippet.insertText);
  };

  const getLanguageColor = (lang) => {
    const colors = {
      javascript: '#f7df1e',
      python: '#3776ab',
      java: '#007396',
      cpp: '#00599c',
      typescript: '#3178c6'
    };
    return colors[lang] || '#888';
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 1,
          cursor: 'pointer'
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <AutoAwesomeIcon sx={{ mr: 1, color: '#ffd700', fontSize: '1.2rem' }} />
        <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
          AI Suggestions
        </Typography>
        <IconButton size="small">
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
          <Chip
            label="All"
            size="small"
            color={activeCategory === 'all' ? 'primary' : 'default'}
            onClick={() => setActiveCategory('all')}
          />
          <Chip
            label="Snippets"
            size="small"
            color={activeCategory === 'snippets' ? 'primary' : 'default'}
            onClick={() => setActiveCategory('snippets')}
          />
        </Box>

        <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
          {snippets.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              Loading suggestions...
            </Typography>
          ) : (
            snippets.map((snippet, index) => (
              <ListItem key={index} disablePadding>
                <ListItemButton 
                  onClick={() => handleInsertSnippet(snippet)}
                  sx={{ borderRadius: 1, mb: 0.5 }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight="medium">
                        {snippet.label}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                        <Chip
                          label={language}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.6rem',
                            backgroundColor: getLanguageColor(language),
                            color: '#000'
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {snippet.detail}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))
          )}
        </List>

        <Box sx={{ mt: 1, p: 1, backgroundColor: 'rgba(255,215,0,0.1)', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            💡 Click a snippet to insert at cursor position
          </Typography>
        </Box>
      </Collapse>
    </Box>
  );
}

export default AISuggestions;