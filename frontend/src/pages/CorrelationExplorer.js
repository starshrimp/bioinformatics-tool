import React, { useState, useEffect } from 'react';
import { Typography, FormControl, InputLabel, Select, MenuItem, Button, Box, Paper, CircularProgress, Dialog, DialogTitle, DialogContent } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import InfoIcon from '@mui/icons-material/Info';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';


const CORR_TYPES = [
  { value: 'gene_gene', label: 'Top 20 gene-gene' },
  { value: 'gene_clinical', label: 'Top 20 gene-clinical' },
  { value: 'clinical_clinical', label: 'Top 5 clinical-clinical' }
];

const CorrelationExplorer = () => {
  const [corrType, setCorrType] = useState(CORR_TYPES[1].value);
  const [correlations, setCorrelations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [presetGene, setPresetGene] = useState('');
  const [presetClinical, setPresetClinical] = useState('');
  const [geneOptions, setGeneOptions] = useState([]);
  const [clinicalOptions, setClinicalOptions] = useState([]);
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";
  const [exploreLoading, setExploreLoading] = useState(false);

  const [exploreResult, setExploreResult] = useState(null);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [exploreFeatures, setExploreFeatures] = useState({ feature_1: '', feature_2: '' });
  const [citations, setCitations] = useState([]);

  // Fetch correlations on mount or when corrType changes
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/list-genes`)
      .then(res => res.json())
      .then(setGeneOptions)
      .catch(() => setGeneOptions([]));

    fetch(`${BACKEND_URL}/api/list-clinical`)
      .then(res => res.json())
      .then(setClinicalOptions)
      .catch(() => setClinicalOptions([]));
  }, [BACKEND_URL]);

  const handleApplyFilter = () => {
    setLoading(true);
    setError(null);
    setCorrelations([]);
    let url = `${BACKEND_URL}/api/top-correlations?type=${corrType}`;
    const filterValue = presetGene || presetClinical;
    if (filterValue) {
      url += `&feature=${encodeURIComponent(filterValue)}`;
    }
    fetch(url)
      .then(res => res.json())
      .then(setCorrelations)
      .catch(err => setError('Could not load correlations: ' + err.message))
      .finally(() => setLoading(false));
  };

  // Explore correlation (calls LLM or summary API)
  const handleExplore = async (feature_1, feature_2) => {
    setExploreLoading(true);
    setExploreResult(null);
    setExploreOpen(true);
    setExploreFeatures({ feature_1, feature_2 });
    try {
      const response = await fetch(`${BACKEND_URL}/api/explore-correlation`, {
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
      setCitations(data.citations || []);
    } catch (err) {
      setExploreResult('Could not fetch explanation: ' + err.message);
      setCitations([]);
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
        <br /> Upon clicking, The backend searches PubMed for articles mentioning both features, retrieves relevant abstracts, and sends them to the OpenAI API for summarization. The LLM returns a readable summary of what’s known about their relationship, including up to five PubMed citation links.
      </Typography>
      <Box sx={{ my: 2, display: "flex", alignItems: "center", gap: 2 }}>
        <FormControl sx={{ minWidth: 220 }}>
          <InputLabel>Correlation Type</InputLabel>
          <Select
            value={corrType}
            onChange={e => {
              setCorrType(e.target.value);
              setPresetGene('');
              setPresetClinical('');
            }}
            label="Correlation Type"
          >
            {CORR_TYPES.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>

        </FormControl>
        {corrType === 'gene_clinical' && (
          <>
            <Autocomplete
              freeSolo
              options={geneOptions}
              inputValue={presetGene}
              onInputChange={(_, value) => {
                setPresetGene(value);
                setPresetClinical(''); // Clear the clinical filter when gene is changed
              }}
              renderInput={params => <TextField {...params} label="Gene (optional)" variant="outlined" />}
              sx={{ width: 200 }}
            />

            <Autocomplete
              options={clinicalOptions}
              value={presetClinical}
              onChange={(_, value) => {
                setPresetClinical(value || '');
                setPresetGene(''); // Clear the gene filter when clinical is changed
              }}
              renderInput={params => <TextField {...params} label="Clinical variable (optional)" />}
              sx={{ width: 200 }}
            />

          </>
        )}
        <Button
          variant="outlined"
          onClick={handleApplyFilter}

        >
          EXPLORE<br />CORRELATIONS
        </Button>

      </Box>

      {loading ? (
        <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Running correlation analysis for the full dataset may take up to a minute, please wait...
          </Typography>
          <CircularProgress size={20} />
        </Box>
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
                      <InfoIcon color="primary" /> Explore
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Paper>
      )}


      {/* LLM/Research modal for correlation exploration */}

      <Dialog open={exploreOpen} onClose={() => setExploreOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <InfoIcon color="primary" />
          Correlation: {exploreFeatures.feature_1} &amp; {exploreFeatures.feature_2}
        </DialogTitle>
        <DialogContent>
          {exploreLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <ReactMarkdown>{exploreResult}</ReactMarkdown>
              {citations.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Citations</Typography>
                  <ul>
                    {citations.map(link => (
                      <li key={link}>
                        <a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
                      </li>
                    ))}
                  </ul>
                </Box>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

    </Box>
  );
};

export default CorrelationExplorer;
