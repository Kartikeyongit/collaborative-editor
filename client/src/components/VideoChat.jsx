import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Collapse,
  Badge
} from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useSocket } from '../context/SocketContext';

function VideoChat({ roomId }) {
  const { socket } = useSocket();
  const [isActive, setIsActive] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(false);

  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionsRef = useRef(new Map());

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      setHasPermission(true);
      setIsActive(true);
      setError('');
      
      // Notify others that video is available
      socket.emit('video-status', { roomId, active: true });
      
    } catch (err) {
      setError('Camera/Microphone access denied');
      console.error('Media error:', err);
    }
  };

  const stopVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
    }
    
    setIsActive(false);
    setHasPermission(false);
    setExpanded(false);
    
    socket.emit('video-status', { roomId, active: false });
  };

  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <Box sx={{ mt: 2 }}>
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 1 
        }}
      >
        <IconButton 
          onClick={isActive ? stopVideo : startVideo}
          color={isActive ? 'error' : 'default'}
          size="small"
        >
          {isActive ? <VideocamOffIcon /> : <VideocamIcon />}
        </IconButton>
        
        <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
          Video Chat
        </Typography>
        
        {isActive && (
          <IconButton 
            size="small"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        )}
      </Box>

      {error && (
        <Typography variant="caption" color="error" display="block" sx={{ mb: 1 }}>
          {error}
        </Typography>
      )}

      <Collapse in={expanded && isActive}>
        {isActive && (
          <Box>
            {/* Local Video */}
            <Box sx={{ 
              position: 'relative',
              backgroundColor: '#000',
              borderRadius: 1,
              overflow: 'hidden',
              mb: 1
            }}>
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                style={{ width: '100%', display: 'block' }}
              />
              
              {/* Controls overlay */}
              <Box sx={{
                position: 'absolute',
                bottom: 8,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 0.5,
                backgroundColor: 'rgba(0,0,0,0.6)',
                borderRadius: 2,
                padding: '4px 8px'
              }}>
                <IconButton 
                  onClick={toggleMic} 
                  size="small"
                  sx={{ color: 'white' }}
                >
                  {isMicOn ? <MicIcon fontSize="small" /> : <MicOffIcon fontSize="small" />}
                </IconButton>
                
                <IconButton 
                  onClick={toggleVideo} 
                  size="small"
                  sx={{ color: 'white' }}
                >
                  {isVideoOn ? <VideocamIcon fontSize="small" /> : <VideocamOffIcon fontSize="small" />}
                </IconButton>
                
                <IconButton 
                  onClick={stopVideo} 
                  size="small"
                  sx={{ color: '#ff4444' }}
                >
                  <CallEndIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
              {isMicOn ? '🎤 Mic on' : '🔇 Mic off'} • {isVideoOn ? '📹 Video on' : '📷 Video off'}
            </Typography>
          </Box>
        )}
      </Collapse>
    </Box>
  );
}

export default VideoChat;