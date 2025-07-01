// src/components/Sidebar.js
import React from 'react';
import { Box, List, ListItemButton, ListItemText, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <Box
      sx={{
        width: 200,
        borderRight: '1px solid #ddd',
        bgcolor: '#f9f9f9',
        p: 2,
      }}
    >
      <Typography variant="h6" gutterBottom>
        BioAI Tool
      </Typography>
      <List>
        <ListItemButton component={Link} to="/">
          <ListItemText primary="Home" />
        </ListItemButton>
        <ListItemButton component={Link} to="/eda">
          <ListItemText primary="EDA" />
        </ListItemButton>
      </List>
    </Box>
  );
};

export default Sidebar;
