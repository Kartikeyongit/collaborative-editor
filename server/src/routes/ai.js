const express = require('express');
const router = express.Router();
const aiService = require('../services/aiSuggestions');

// Get AI suggestions
router.post('/suggest', (req, res) => {
  const { code, language, cursorPosition } = req.body;
  
  try {
    const suggestions = aiService.getContextSuggestions(code, language, cursorPosition);
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get snippets for a language
router.get('/snippets/:language', (req, res) => {
  const { language } = req.params;
  const snippets = aiService.getSnippets(language);
  res.json({ snippets });
});

// Get completions for a word
router.post('/complete', (req, res) => {
  const { word, language } = req.body;
  const completions = aiService.getCompletions(word, language);
  res.json({ completions });
});

module.exports = router;