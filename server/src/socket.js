const { v4: uuidv4 } = require('uuid');
const { redisClient } = require('./services/redis');
const { execute } = require('./services/codeExecution');

const versionHistory = new Map();
const pendingVersions = new Map();
const versionTimers = new Map();
const rooms = new Map();
const documentContents = new Map();

function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join room
    socket.on('join-room', async ({ roomId, username }) => {
      socket.join(roomId);
      
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Map());
      }
      rooms.get(roomId).set(socket.id, { username, id: socket.id });
      
      const users = Array.from(rooms.get(roomId).values());
      io.to(roomId).emit('room-users', users);
      
      if (documentContents.has(roomId)) {
        socket.emit('init-document', documentContents.get(roomId));
      }
      
      socket.to(roomId).emit('user-joined', { userId: socket.id, username });
      
      if (redisClient) {
        try {
          await redisClient.sAdd(`room:${roomId}:users`, JSON.stringify({ username, id: socket.id }));
        } catch (err) {
          console.warn('Redis save failed:', err.message);
        }
      }
    });

    // Document changes
    socket.on('document-change', async ({ roomId, content, language }) => {
    socket.to(roomId).emit('document-update', { 
        content,
        userId: socket.id
    });
    
    documentContents.set(roomId, { content, language });
    });

    // Save version explicitly
    socket.on('save-version', ({ roomId }) => {
    const doc = documentContents.get(roomId);
    if (!doc) return;
    
    const version = {
        id: uuidv4(),
        content: doc.content,
        language: doc.language,
        userId: socket.id,
        timestamp: new Date().toISOString()
    };
    
    if (!versionHistory.has(roomId)) {
        versionHistory.set(roomId, []);
    }
    const versions = versionHistory.get(roomId);
    
    // Only save if different from last version
    const lastVersion = versions[0];
    if (!lastVersion || lastVersion.content !== version.content) {
        versions.unshift(version);
        if (versions.length > 50) versions.pop();
        
        // Notify room of new version
        io.to(roomId).emit('new-version', version);
    }
    });

    // Execute code - UPDATED with real execution
    socket.on('execute-code', async ({ roomId, code, language }) => {
      console.log(`Executing ${language} code in room ${roomId}`);
      
      // Notify room that execution started
      io.to(roomId).emit('execution-result', { 
        output: 'Running...', 
        status: 'running' 
      });
      
      try {
        const result = await execute(code, language);
        
        io.to(roomId).emit('execution-result', {
          output: result.output,
          status: result.success ? 'success' : 'error',
          executionTime: result.executionTime
        });
      } catch (error) {
        io.to(roomId).emit('execution-result', {
          output: `Execution error: ${error.message}`,
          status: 'error'
        });
      }
      saveVersionNow(roomId, code, language, socket.id);
    });

    socket.on('save-version', ({ roomId }) => {
      const doc = documentContents.get(roomId);
      if (doc) {
        saveVersionNow(roomId, doc.content, doc.language, socket.id);
      }
    });

    // Disconnect
    socket.on('disconnect', async () => {
    for (const [roomId, users] of rooms.entries()) {
        if (users.has(socket.id)) {
        const doc = documentContents.get(roomId);
        if (doc) {
            const version = {
            id: uuidv4(),
            content: doc.content,
            language: doc.language,
            userId: socket.id,
            timestamp: new Date().toISOString()
            };
            
            if (!versionHistory.has(roomId)) {
            versionHistory.set(roomId, []);
            }
            versionHistory.get(roomId).unshift(version);
        }
        
        users.delete(socket.id);
        io.to(roomId).emit('user-left', socket.id);
        io.to(roomId).emit('room-users', Array.from(users.values()));
        
        if (users.size === 0) {
            rooms.delete(roomId);
            documentContents.delete(roomId);
        }
        }
    }
    });

    function saveVersionNow(roomId, content, language, userId) {
    const version = {
        id: uuidv4(),
        content,
        language,
        userId,
        timestamp: new Date().toISOString()
    };
    
    if (!versionHistory.has(roomId)) {
        versionHistory.set(roomId, []);
    }
    const versions = versionHistory.get(roomId);
    versions.unshift(version);
    if (versions.length > 50) versions.pop();
    }
  });
}

module.exports = { setupSocketHandlers, versionHistory };