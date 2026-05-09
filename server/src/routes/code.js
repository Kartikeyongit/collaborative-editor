const express = require('express');
const router = express.Router();
const { versionHistory } = require('../socket');

// Get version history for a room
router.get('/versions/:roomId', (req, res) => {
  try {
    const versions = versionHistory.get(req.params.roomId) || [];
    res.json({ versions });
  } catch (error) {
    res.json({ versions: [], error: error.message });
  }
});

module.exports = router;