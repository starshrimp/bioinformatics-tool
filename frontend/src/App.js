import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, CssBaseline, Paper } from '@mui/material';
import Sidebar from './components/Sidebar';
import Landing from './pages/Landing';
import EDA from './pages/EDA';
import UMAP from './pages/UMAP';
import LLMEDA from './pages/LLMEDA';
import DifferentialExpression from './pages/DifferentialExpression';
import CorrelationExplorer from './pages/CorrelationExplorer';
import DataPrepExpr from './pages/notebooks/DataPreprocessingExpr';
import DataPrepClin from './pages/notebooks/DataPreprocessingClin';
import DataAnalysis from './pages/notebooks/DataAnalysis';
import PrincipalComponent from './pages/notebooks/PrincipalComponent';
import UMAPPAM50 from './pages/notebooks/UMAPpam50';
import UMAPBiomarkers from './pages/notebooks/UMAPBiomarkers';
import Biomarkers from './pages/notebooks/Biomarkers';
import Subtypes from './pages/notebooks/Subtypes';

function App() {
  return (
    <Router>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mt: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            display: 'flex',
            width: '90%',
            maxWidth: 1200,
            borderRadius: 4,
            overflow: 'hidden',
            minHeight: '80vh',
          }}
        >
          <Sidebar />
          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/eda" element={<EDA />} />
              <Route path="/differentialexpression" element={<DifferentialExpression />} />
              <Route path="/correlationexplorer" element={<CorrelationExplorer />} />
              <Route path="/llmeda" element={<LLMEDA />} />
              <Route path="/umap" element={<UMAP />} />
              <Route path="dataprepexpr" element={<DataPrepExpr />} />
              <Route path="dataprepclin" element={<DataPrepClin />} />
              <Route path="dataanalysis" element={<DataAnalysis />} />
              <Route path="pca" element={<PrincipalComponent />} />
              <Route path="umappam50" element={<UMAPPAM50 />} />
              <Route path="umapbiomarkers" element={<UMAPBiomarkers />} />
              <Route path="biomarkers" element={<Biomarkers />} />
              <Route path="subtypes" element={<Subtypes />} />
            </Routes>
          </Box>
        </Paper>
      </Box>
    </Router>
  );
}

export default App;
