import React from 'react';
import { Drawer, List, ListItemButton, ListItemText, Toolbar, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const drawerWidth = 200;

const Sidebar = () => {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          <ListItemButton component={Link} to="/">
            <ListItemText primary="Home" />
          </ListItemButton>
          <ListItemButton component={Link} to="/eda">
            <ListItemText primary="EDA" />
          </ListItemButton>
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
