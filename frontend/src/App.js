import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import Sidebar from './components/Sidebar';
import Landing from './pages/Landing';
import EDA from './pages/EDA';

function App() {
  return (
    <Router>
      <Box sx={{ display: 'flex' }}>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/eda" element={<EDA />} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
}

export default App;
