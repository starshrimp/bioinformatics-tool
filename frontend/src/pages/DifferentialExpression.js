import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { Typography, FormControl, InputLabel, Select, MenuItem, Button, Box, Paper } from '@mui/material';


const DifferentialExpression = () => {
  const [clinicalVar, setClinicalVar] = useState("");
  const [groupA, setGroupA] = useState("");
  const [groupB, setGroupB] = useState("");
  const [availableGroups, setAvailableGroups] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clinicalVariables, setClinicalVariables] = useState([]);
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";
  
  useEffect(() => {
    // Fetch clinical variables on mount
    fetch(`${BACKEND_URL}/api/clinical-variables`)
      .then(res => res.json())
      .then(setClinicalVariables)
      .catch(err => setError("Could not load clinical variables: " + err.message));
  }, [BACKEND_URL]);

  const handleClinicalVarChange = (event) => {
    const selected = clinicalVariables.find(v => v.name === event.target.value);
    setClinicalVar(event.target.value);
    setAvailableGroups(selected ? selected.groups : []);
    setGroupA("");
    setGroupB("");
  };

  const handleRunDE = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const response = await fetch(`${BACKEND_URL}/api/dea`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinical_variable: clinicalVar,
          group_a: groupA,
          group_b: groupB,
        }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "An error occurred during the DE analysis.");
      }
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
            {clinicalVariables.map((v) => (
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
        {loading ? (
          <Typography variant="body2">Running analysis…</Typography>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : results ? (
          <Paper sx={{ p: 2 }}>
            <Typography variant="h5">Results</Typography>
            {/* Table */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">Top Differentially Expressed Genes</Typography>
              {results.table.length === 0 ? (
                <Typography>No differentially expressed genes found.</Typography>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1em" }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", padding: "8px", fontWeight: "bold", borderBottom: "2px solid #ccc" }}>Gene</th>
                      <th style={{ textAlign: "left", padding: "8px", fontWeight: "bold", borderBottom: "2px solid #ccc" }}>log2FC</th>
                      <th style={{ textAlign: "left", padding: "8px", fontWeight: "bold", borderBottom: "2px solid #ccc" }}>p-value</th>
                      <th style={{ textAlign: "left", padding: "8px", fontWeight: "bold", borderBottom: "2px solid #ccc" }}>adj p-value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.table.map((row) => (
                      <tr key={row.gene}>
                        <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>{row.gene}</td>
                        <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>
                          {row.log2FC !== null && !isNaN(row.log2FC) ? row.log2FC.toFixed(2) : "NA"}
                        </td>
                        <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>
                          {row.p_value !== null && !isNaN(row.p_value) ? row.p_value.toExponential(2) : "NA"}
                        </td>
                        <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>
                          {row.p_adj !== null && !isNaN(row.p_adj) ? row.p_adj.toExponential(2) : "NA"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

              )}
            </Box>
            {/* Volcano Plot */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ mt: 4 }}>
                <Typography variant="h5">Volcano Plot</Typography>
              </Box>
              {results.volcano_data ? (
                <Plot
                  data={[
                    {
                      x: results.volcano_data.log2fc,
                      y: results.volcano_data.neglog10p,
                      mode: "markers",
                      type: "scatter",
                      text: results.volcano_data.gene,
                      marker: {
                        color: results.volcano_data.p_adj.map((p) =>
                          p !== null && p < 0.05 ? "red" : "grey"
                        ),
                        size: 8,
                        opacity: 0.7,
                      },
                    },
                  ]}
                  layout={{
                    title: "Volcano Plot",
                    xaxis: { title: "log2 Fold Change" },
                    yaxis: { title: "-log10(p-value)" },
                    shapes: [
                      {
                        type: "line",
                        x0: Math.min(...results.volcano_data.log2fc),
                        x1: Math.max(...results.volcano_data.log2fc),
                        y0: -Math.log10(0.05),
                        y1: -Math.log10(0.05),
                        line: { color: "grey", dash: "dash" },
                      },
                    ],
                  }}
                  style={{ width: "100%", height: "400px" }}
                />
              ) : (
                <Typography>No volcano plot generated.</Typography>
              )}
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1"><strong>How to read this plot:</strong></Typography>
              <Typography variant="body2" color="textSecondary">
                
                Each dot represents a gene. The x-axis shows the log<sub>2</sub> fold change between groups (how much a gene is up- or downregulated), and the y-axis shows the statistical significance (−log<sub>10</sub>(p-value)).
                <br /><br />
                The <span style={{ color: "#888", fontWeight: "bold" }}>grey dashed horizontal line</span> marks the threshold for statistical significance at p = 0.05 (−log<sub>10</sub>(0.05) ≈ 1.3).<br />
                <span style={{ color: "grey", fontWeight: "bold" }}>Red dots above this line</span> indicate genes with p-values less than 0.05 (statistically significant differences before correction for multiple testing).<br />
                <span style={{ color: "grey", fontWeight: "bold" }}>Grey dots</span> are not statistically significant (p ≥ 0.05).
                <br /><br />
                Note: Statistical significance should be interpreted in the context of multiple testing (e.g., adjusted p-values/FDR), not just raw p-values.
              </Typography>
            </Box>

            {/* Heatmap */}
            <Box>
              <Box sx={{ mt: 4 }}>
                <Typography variant="h5">Heatmap</Typography>
              </Box>
              {results.heatmap_data ? (
                <Plot
                  data={[
                    {
                      z: results.heatmap_data.values,
                      x: results.heatmap_data.samples,
                      y: results.heatmap_data.genes,
                      type: "heatmap",
                      colorscale: "Viridis",
                    },
                  ]}
                  layout={{
                    title: "Heatmap: Top DE genes",
                    xaxis: { title: "Sample" },
                    yaxis: { title: "Gene" },
                  }}
                  style={{ width: "100%", height: "400px" }}
                />
              ) : (
                <Typography>No heatmap generated.</Typography>
              )}
            </Box>
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

export default DifferentialExpression;
