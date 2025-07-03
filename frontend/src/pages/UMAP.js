import React, { useState } from 'react';
import { Box, Typography, Select, MenuItem, FormControl, InputLabel, Checkbox, FormControlLabel, Button, CircularProgress, Alert } from '@mui/material';
import Plot from 'react-plotly.js';

const COLORS = [
  '#66c2a5', // teal
  '#fc8d62', // orange
  '#8da0cb', // purple-blue
  '#e78ac3', // pink
  '#a6d854', // green
  '#ffd92f', // yellow
  '#e5c494', // beige
  '#b3b3b3', // gray
];


const UMAPPage = () => {
  const [matrix, setMatrix] = useState('median_centered');
  const [includeClinical, setIncludeClinical] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleRunUMAP = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch('/api/umap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matrix,
          include_clinical: includeClinical,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  // Prepare traces for Plotly if result exists
  let traces = [];
  if (result && result.umap_coords && result.pam50_subtypes) {
    // Use unique_subtypes from backend, or compute from data
    const subtypes = result.unique_subtypes || Array.from(new Set(result.pam50_subtypes));
    traces = subtypes.map((subtype, i) => {
      const indices = result.pam50_subtypes
        .map((v, idx) => (v === subtype ? idx : -1))
        .filter(idx => idx !== -1);
      return {
        x: indices.map(idx => result.umap_coords[idx][0]),
        y: indices.map(idx => result.umap_coords[idx][1]),
        mode: 'markers',
        type: 'scattergl',
        name: subtype,
        marker: { color: COLORS[i % COLORS.length], size: 7, line: { width: 0.5, color: '#333' } },
        text: indices.map(idx => result.sample_ids[idx]),
        hovertemplate: '%{text}<br>UMAP1=%{x:.2f}<br>UMAP2=%{y:.2f}<extra></extra>',
        // Show sample_id on hover
      };
    });
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h5" gutterBottom>
        UMAP Visualization
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Uniform Manifold Approximation and Projection (UMAP) is a popular method for visualizing high-dimensional data such as gene expression.
        Here you can generate a 2D UMAP projection of your RNA-seq data. Optionally, you can include clinical metadata to enrich the visualization.
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <FormControl sx={{ minWidth: 250 }}>
          <InputLabel id="matrix-select-label">Expression Matrix</InputLabel>
          <Select
            labelId="matrix-select-label"
            id="matrix-select"
            value={matrix}
            label="Expression Matrix"
            onChange={e => setMatrix(e.target.value)}
          >
            <MenuItem value="median_centered">Median-Centered Expression Matrix</MenuItem>
            <MenuItem value="zscored">Median-Centered Z-Scored Expression Matrix</MenuItem>
          </Select>
        </FormControl>
        <FormControlLabel
          control={
            <Checkbox
              checked={includeClinical}
              onChange={e => setIncludeClinical(e.target.checked)}
              name="includeClinical"
            />
          }
          label="Include clinical metadata"
          sx={{ ml: 2 }}
        />
      </Box>

      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button variant="contained" onClick={handleRunUMAP} disabled={loading}>
          Run UMAP
        </Button>
        <Typography variant="body2" color="text.secondary">
          {loading ? "Running UMAP, please wait a few seconds..." : "This computation may take a few seconds."}
        </Typography>
        {loading && <CircularProgress size={22} />}
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {result && (
        <Box sx={{ mt: 4 }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            UMAP completed!
          </Alert>
          <Plot
            data={traces}
            layout={{
              width: 800,
              height: 550,
              title: 'UMAP: Gene Expression + Clinical Features',
              xaxis: { title: 'UMAP1', showgrid: true, zeroline: false },
              yaxis: { title: 'UMAP2', showgrid: true, zeroline: false },
              legend: {
                title: { text: 'PAM50 Subtype' },
                font: { size: 11 },
                itemsizing: "constant",
                bordercolor: "#ccc",
                borderwidth: 1,
                orientation: "v",
                x: 1.05,
                y: 0.5,
                yanchor: "middle",
                 itemwidth: 50,  
              },
              margin: { t: 40, r: 170, b: 40, l: 40 }
            }}
            config={{
              responsive: true,
              displaylogo: false
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default UMAPPage;

