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
  const [matrix, setMatrix] = useState('filtered');
  const [includeClinical, setIncludeClinical] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [hue, setHue] = useState('pam50_subtype');
  const hueOptions = [
    { value: 'pam50_subtype', label: 'PAM50 Subtype' },
    { value: 'er status', label: 'ER Status' },
    { value: 'pgr status', label: 'PGR Status' },
    { value: 'her2 status', label: 'HER2 Status' },
    { value: 'ki67 status', label: 'Ki67 Status' },
    // Add more options as needed
  ];
  const [includeNans, setIncludeNans] = useState(false);


  const handleRunUMAP = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL; 
      const res = await fetch(`${BACKEND_URL}/api/umap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matrix,
          include_clinical: includeClinical,
          hue,
          include_nans: includeNans,
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
  if (result && result.umap_coords && result.hue_values) {
    const subtypes = result.unique_hues || Array.from(new Set(result.hue_values));
    traces = subtypes.map((subtype, i) => {
      const indices = result.hue_values
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
            <MenuItem value="filtered">Filtered Expression Matrix</MenuItem>
            <MenuItem value="median_centered">Median-Centered Expression Matrix</MenuItem>
            <MenuItem value="zscored">Median-Centered Z-Scored Expression Matrix</MenuItem>
            <MenuItem value="zscored_top8000">Z-Scored Top 8000 Genes</MenuItem>
            <MenuItem value="median_centered_top8000">Median-Centered Top 8000 Genes</MenuItem>
            <MenuItem value="COLLAPSED_top8000">Collapsed Top 8000 Genes</MenuItem>

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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        {/* ...Expression Matrix dropdown... */}
        <FormControl sx={{ minWidth: 250 }}>
          <InputLabel id="hue-select-label">Color by</InputLabel>
          <Select
            labelId="hue-select-label"
            id="hue-select"
            value={hue}
            label="Color by"
            onChange={e => setHue(e.target.value)}
          >
            {hueOptions.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControlLabel
          control={
            <Checkbox
              checked={includeNans}
              onChange={e => setIncludeNans(e.target.checked)}
              name="includeNans"
            />
          }
          label="Include NaNs"
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
              margin: { t: 40, r: 170, b: 40, l: 40 },
              autosize: true
            }}
            config={{
              responsive: true,
              displaylogo: false
            }}
            style={{ width: '100%', height: '550px' }}
            useResizeHandler={true}
          />
        </Box>
      )}
    </Box>
  );
};

export default UMAPPage;

