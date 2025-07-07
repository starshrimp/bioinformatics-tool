import React, { useState, useEffect } from 'react';
import { Typography, FormControl, InputLabel, Select, MenuItem, Button, Box, Paper, CircularProgress, Dialog, DialogTitle, DialogContent } from '@mui/material';

const CORR_TYPES = [
  { value: 'gene_gene', label: 'Top 20 gene-gene' },
  { value: 'gene_clinical', label: 'Top 20 gene-clinical' },
  { value: 'clinical_clinical', label: 'Top 5 clinical-clinical' }
];

const CorrelationExplorer = () => {
  const [corrType, setCorrType] = useState(CORR_TYPES[0].value);
  const [correlations, setCorrelations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exploreLoading, setExploreLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exploreResult, setExploreResult] = useState(null);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [exploreFeatures, setExploreFeatures] = useState({ feature_1: '', feature_2: '' });

  // Fetch correlations on mount or when corrType changes
  useEffect(() => {
    setLoading(true);
    setError(null);
    setCorrelations([]);
    fetch(`/api/top_correlations?type=${corrType}`)
      .then(res => res.json())
      .then(setCorrelations)
      .catch(err => setError('Could not load correlations: ' + err.message))
      .finally(() => setLoading(false));
  }, [corrType]);

  // Explore correlation (calls LLM or summary API)
  const handleExplore = async (feature_1, feature_2) => {
    setExploreLoading(true);
    setExploreResult(null);
    setExploreOpen(true);
    setExploreFeatures({ feature_1, feature_2 });
    try {
      const response = await fetch('/api/explore_correlation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature_1, feature_2 })
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to explore correlation');
      }
      const data = await response.json();
      setExploreResult(data.summary);
    } catch (err) {
      setExploreResult('Could not fetch explanation: ' + err.message);
    } finally {
      setExploreLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Correlation Explorer
      </Typography>
      <Typography variant="body1" gutterBottom>
        Explore the strongest correlations in the dataset. Select a correlation type and click "Explore this correlation" for more info.
      </Typography>

      <Box sx={{ my: 2, display: "flex", alignItems: "center", gap: 2 }}>
        <FormControl sx={{ minWidth: 220 }}>
          <InputLabel>Correlation Type</InputLabel>
          <Select
            value={corrType}
            onChange={e => setCorrType(e.target.value)}
            label="Correlation Type"
          >
            {CORR_TYPES.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Top Correlations</Typography>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1em" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "8px", fontWeight: "bold", borderBottom: "2px solid #ccc" }}>Feature 1</th>
                <th style={{ textAlign: "left", padding: "8px", fontWeight: "bold", borderBottom: "2px solid #ccc" }}>Feature 2</th>
                <th style={{ textAlign: "left", padding: "8px", fontWeight: "bold", borderBottom: "2px solid #ccc" }}>Correlation</th>
                <th style={{ padding: "8px", borderBottom: "2px solid #ccc" }}></th>
              </tr>
            </thead>
            <tbody>
              {correlations.map((row, idx) => (
                <tr key={row.feature_1 + row.feature_2 + idx}>
                  <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>{row.feature_1}</td>
                  <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>{row.feature_2}</td>
                  <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>
                    {row.correlation !== null && !isNaN(row.correlation) ? row.correlation.toFixed(3) : "NA"}
                  </td>
                  <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>
                    <Button size="small" onClick={() => handleExplore(row.feature_1, row.feature_2)}>
                      Explore this correlation
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Paper>
      )}

      {/* LLM/Research modal for correlation exploration */}
      <Dialog open={exploreOpen} onClose={() => setExploreOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Correlation: {exploreFeatures.feature_1} &amp; {exploreFeatures.feature_2}
        </DialogTitle>
        <DialogContent>
          {exploreLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Typography>
              {exploreResult}
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default CorrelationExplorer;
