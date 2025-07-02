import React, { useState } from 'react';
import { Box, Typography, Select, MenuItem, FormControl, InputLabel, Checkbox, FormControlLabel, Button, CircularProgress, Alert } from '@mui/material';

const UMAPPage = () => {
  // State for form controls
  const [matrix, setMatrix] = useState('median_centered');
  const [includeClinical, setIncludeClinical] = useState(false);
  const [loading, setLoading] = useState(false);
  // These could be set after backend integration
  const [result, setResult] = useState(null);

  // Placeholder handler for "Run UMAP"
  const handleRunUMAP = async () => {
    setLoading(true);
    setResult(null);

    // Simulate async backend call (replace with your actual fetch later)
    setTimeout(() => {
      setLoading(false);
      setResult({
        plotUrl: null, // will be set by backend, e.g. /api/umap_result.png
        stats: {
          silhouette: 0.41,
          clusters: 5,
        },
      });
    }, 2500);
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

      {/* --- Parameter Controls --- */}
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

      {/* --- Run Button & Info --- */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button 
          variant="contained" 
          onClick={handleRunUMAP}
          disabled={loading}
        >
          Run UMAP
        </Button>
        <Typography variant="body2" color="text.secondary">
          {loading
            ? "Running UMAP, please wait a few seconds..."
            : "This computation may take a few seconds."}
        </Typography>
        {loading && <CircularProgress size={22} />}
      </Box>

      {/* --- Placeholder for Result --- */}
      {result && (
        <Box sx={{ mt: 4 }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            UMAP completed! (Example data below.)
          </Alert>
          {/* Here you'll render the returned plot from backend */}
          <Box sx={{ mb: 2 }}>
            {/* Placeholder: later show an actual <img src={result.plotUrl}/> */}
            <Box sx={{ bgcolor: "#eee", width: 400, height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', borderRadius: 2 }}>
              UMAP plot will appear here
            </Box>
          </Box>
          {/* Example stats: */}
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Number of clusters:</strong> {result.stats.clusters}<br />
            <strong>Silhouette score:</strong> {result.stats.silhouette}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default UMAPPage;
