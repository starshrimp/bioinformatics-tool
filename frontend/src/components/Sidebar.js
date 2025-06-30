import React from 'react';
import { Drawer, List, ListItem, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <Drawer variant="permanent" anchor="left">
      <List>
        <ListItem button component={Link} to="/">
          <ListItemText primary="Home" />
        </ListItem>
        <ListItem button component={Link} to="/eda">
          <ListItemText primary="EDA" />
        </ListItem>
        {/* Add more sections here later */}
      </List>
    </Drawer>
  );
};

export default Sidebar;
