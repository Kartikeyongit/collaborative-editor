import React from 'react';
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Badge,
  Typography,
  Box
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

const avatarColors = [
  '#f44336', '#e91e63', '#9c27b0', '#673ab7',
  '#3f51b5', '#2196f3', '#009688', '#4caf50',
  '#ff9800', '#795548'
];

function getColorForUser(username) {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function UserList({ users }) {
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Users in Room ({users.length})
      </Typography>
      
      <List dense>
        {users.map((user) => (
          <ListItem key={user.id}>
            <ListItemAvatar>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                variant="dot"
                color="success"
              >
                <Avatar
                  sx={{
                    bgcolor: getColorForUser(user.username),
                    width: 32,
                    height: 32,
                    fontSize: '0.875rem'
                  }}
                >
                  {user.username[0].toUpperCase()}
                </Avatar>
              </Badge>
            </ListItemAvatar>
            <ListItemText
              primary={user.username}
              primaryTypographyProps={{
                variant: 'body2',
                noWrap: true
              }}
            />
          </ListItem>
        ))}
        
        {users.length === 0 && (
          <ListItem>
            <ListItemText
              primary="No users connected"
              primaryTypographyProps={{
                variant: 'body2',
                color: 'text.secondary'
              }}
            />
          </ListItem>
        )}
      </List>
    </Box>
  );
}

export default UserList;