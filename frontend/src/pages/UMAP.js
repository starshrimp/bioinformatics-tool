import React, { useState } from 'react';
import { Box, Typography, Select, MenuItem, FormControl, InputLabel, Checkbox, FormControlLabel, Button, CircularProgress, Alert } from '@mui/material';
import Plot from 'react-plotly.js';

const UMAPPage = () => {
  const [matrix, setMatrix] = useState('median_centered');
  const [includeClinical, setIncludeClinical] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const baseUrl = process.env.REACT_APP_API_URL;

  const handleRunUMAP = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch(`${baseUrl}/api/umap`, {
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

  return (
    <Box sx={{ maxWidth: 750, mx: 'auto', p: 3 }}>
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
          <Box sx={{ mb: 2 }}>
            <Plot
              data={[
                {
                  x: result.umap_coords.map(pair => pair[0]),
                  y: result.umap_coords.map(pair => pair[1]),
                  mode: 'markers',
                  type: 'scattergl',
                  marker: {
                    color: result.clusters,
                    colorscale: 'Viridis',
                    size: 8,
                    colorbar: { title: 'Cluster' }
                  },
                  text: result.sample_ids, // shows on hover
                  hoverinfo: 'text',
                }
              ]}
              layout={{
                width: 500,
                height: 350,
                title: 'UMAP Projection',
                xaxis: { title: 'UMAP1' },
                yaxis: { title: 'UMAP2' },
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Number of clusters:</strong> {result.n_clusters}<br />
            <strong>Silhouette score:</strong> {result.silhouette}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default UMAPPage;
