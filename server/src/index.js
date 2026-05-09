const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { setupSocketHandlers } = require('./socket');
const roomRoutes = require('./routes/rooms');
const codeRoutes = require('./routes/code');
const { initializeRedis } = require('./services/redis');
const aiRoutes = require('./routes/ai');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api', limiter);

// Routes
app.use('/api/rooms', roomRoutes);
app.use('/api/code', codeRoutes);
app.use('/api/ai', aiRoutes);

// Socket.IO
setupSocketHandlers(io);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 4000;

async function start() {
  await initializeRedis();
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();