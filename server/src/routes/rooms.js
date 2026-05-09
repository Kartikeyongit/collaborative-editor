const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Create a new room
router.post('/create', (req, res) => {
  const roomId = uuidv4();
  res.json({ roomId });
});

// Get room info
router.get('/:roomId', (req, res) => {
  res.json({ 
    roomId: req.params.roomId,
    createdAt: new Date().toISOString()
  });
});

module.exports = router;