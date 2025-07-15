// src/components/Sidebar.js
import React, { useState } from 'react';
import { Box, List, ListItemButton, ListItemText, Typography, Collapse } from '@mui/material';
import { Link } from 'react-router-dom';
import { ExpandLess, ExpandMore } from '@mui/icons-material';

const Sidebar = () => {
  const [openMenus, setOpenMenus] = useState({
    unsupervised: false,
    supervised: false,
    dataAnalysis: false,
  });

  const handleToggle = (menu) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  return (
    <Box
      sx={{
        width: 250,
        flexShrink: 0,
        borderRight: '1px solid #ddd',
        bgcolor: '#f9f9f9',
        p: 2.5,
      }}
    >
      <Typography variant="h6" gutterBottom>
        BioAI Tool
      </Typography>
      <List>
        <ListItemButton component={Link} to="/">
          <ListItemText primary="About" />
        </ListItemButton>
        <ListItemButton component={Link} to="/llmeda">
          <ListItemText primary="Data Copilot 💬" />
        </ListItemButton>
        <ListItemButton component={Link} to="/correlationexplorer">
          <ListItemText primary="Correlation Explorer 🔗" />
        </ListItemButton>
        
        <ListItemButton component={Link} to="/differentialexpression">
          <ListItemText primary="Differential Expression Analysis 🧬" />
        </ListItemButton>
        <ListItemButton component={Link} to="/umap">
          <ListItemText primary="Interactive UMAP 🕹️" />
        </ListItemButton>
        {/* Data Analysis with dropdown */}
        <ListItemButton onClick={() => handleToggle('dataAnalysis')}>
          <ListItemText primary="Jupyter Notebooks 📓" />
          {openMenus.dataAnalysis ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openMenus.dataAnalysis} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton sx={{ pl: 4 }} component={Link} to="/dataprepexpr">
              <ListItemText primary="Data Preprocessing Expression Matrix" />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }} component={Link} to="/dataprepclin">
              <ListItemText primary="Data Preprocessing Clinical Metadata" />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }} component={Link} to="/dataanalysis">
              <ListItemText primary="Data Analysis" />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }} component={Link} to="/pca">
              <ListItemText primary="Principal Components Analysis" />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }} component={Link} to="/umappam50">
              <ListItemText primary="UMAP for PAM50 Subtypes" />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }} component={Link} to="/umapbiomarkers">
              <ListItemText primary="UMAP for Cancer Biomarkers" />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }} component={Link} to="/biomarkers">
              <ListItemText primary="Biomarkers Prediction" />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }} component={Link} to="/subtypes">
              <ListItemText primary="PAM50 Subtype Prediction" />
            </ListItemButton>

          </List>
        </Collapse>
      </List>
    </Box>
  );
};

export default Sidebar;
