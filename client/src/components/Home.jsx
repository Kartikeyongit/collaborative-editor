import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Container
} from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import axios from 'axios';

function Home() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');

  const createRoom = async () => {
    try {
      const response = await axios.post('http://localhost:4000/api/rooms/create');
      navigate(`/room/${response.data.roomId}`);
    } catch (error) {
      // If server not available, generate local ID
      const fallbackId = Math.random().toString(36).substring(7);
      navigate(`/room/${fallbackId}`);
    }
  };

  const joinRoom = () => {
    if (roomId.trim()) {
      navigate(`/room/${roomId.trim()}`);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 3
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            textAlign: 'center'
          }}
        >
          <CodeIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          
          <Typography variant="h4" gutterBottom>
            Collaborative Code Editor
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Code together in real-time with multiple language support
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={createRoom}
            fullWidth
            sx={{ mb: 3 }}
          >
            Create New Room
          </Button>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            - OR -
          </Typography>

          <TextField
            fullWidth
            label="Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            sx={{ mb: 2 }}
            size="small"
          />
          
          <Button
            variant="outlined"
            onClick={joinRoom}
            fullWidth
            disabled={!roomId.trim()}
          >
            Join Room
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}

export default Home;