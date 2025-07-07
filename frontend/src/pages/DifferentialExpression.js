import React, { useState } from 'react';
import { Typography, FormControl, InputLabel, Select, MenuItem, Button, Box, Paper } from '@mui/material';

const dummyClinicalVariables = [
  { name: "PAM50 subtype", groups: ["LumA", "LumB", "Basal", "Her2"] },
  { name: "ER status", groups: ["Positive", "Negative"] }
];

const EDA = () => {
  const [clinicalVar, setClinicalVar] = useState("");
  const [groupA, setGroupA] = useState("");
  const [groupB, setGroupB] = useState("");
  const [availableGroups, setAvailableGroups] = useState([]);
  const [results, setResults] = useState(null);

  // Update groups when clinical variable changes
  const handleClinicalVarChange = (event) => {
    const selected = dummyClinicalVariables.find(v => v.name === event.target.value);
    setClinicalVar(event.target.value);
    setAvailableGroups(selected ? selected.groups : []);
    setGroupA("");
    setGroupB("");
  };

  const handleRunDE = () => {
    // Placeholder: Run DE API call here, setResults with response
    setResults({
      table: "DE gene table here",
      volcano: "Volcano plot here",
      heatmap: "Heatmap here"
    });
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Differential Expression Analysis
      </Typography>
      <Typography variant="body1" gutterBottom>
        Select a clinical variable and two groups to compare. The analysis will display differentially expressed genes and visualizations.
      </Typography>

      <Box sx={{ display: "flex", gap: 2, my: 2 }}>
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Clinical Variable</InputLabel>
          <Select value={clinicalVar} onChange={handleClinicalVarChange} label="Clinical Variable">
            {dummyClinicalVariables.map((v) => (
              <MenuItem key={v.name} value={v.name}>{v.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }} disabled={!clinicalVar}>
          <InputLabel>Group A</InputLabel>
          <Select value={groupA} onChange={e => setGroupA(e.target.value)} label="Group A">
            {availableGroups
              .filter(g => g !== groupB)
              .map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }} disabled={!clinicalVar}>
          <InputLabel>Group B</InputLabel>
          <Select value={groupB} onChange={e => setGroupB(e.target.value)} label="Group B">
            {availableGroups
              .filter(g => g !== groupA)
              .map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          sx={{ alignSelf: "center" }}
          disabled={!clinicalVar || !groupA || !groupB || groupA === groupB}
          onClick={handleRunDE}
        >
          Run DE Analysis
        </Button>
      </Box>

      <Box sx={{ mt: 4 }}>
        {results ? (
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Results</Typography>
            <Typography>Table: {results.table}</Typography>
            <Typography>Volcano plot: {results.volcano}</Typography>
            <Typography>Heatmap: {results.heatmap}</Typography>
            {/* Replace above lines with actual components (DataGrid, Plot, etc.) once backend is ready */}
          </Paper>
        ) : (
          <Typography variant="body2" color="textSecondary">
            Results will appear here after running the analysis.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default EDA;
