import React, { useState } from 'react';
import { Typography, TextField, Button, Box, CircularProgress, Paper, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';



const LLMEDA = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState({ plot: null, text: '', explanation: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleQuery = async () => {
    setLoading(true);
    setError('');
    setResult({ plot: null, text: '', explanation: '' });

    try {
      const response = await fetch('/api/llm-eda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setResult({
        plot: data.plot,
        text: data.text,
        explanation: data.explanation,
        code: data.code,
      });
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    }
    setLoading(false);
  };

  return (
    <Box maxWidth={600} mx="auto">
      <Typography variant="h5" gutterBottom>
        Chat with your Data
      </Typography>
      <Typography variant="body1" gutterBottom>
        Ask a question about your clinical metadata.<br />
        (e.g. "Display a plot for how many patients with each PAM50 subtype are in the study")
      </Typography>
      <TextField
        label="Your question"
        fullWidth
        multiline
        minRows={2}
        value={query}
        onChange={e => setQuery(e.target.value)}
        sx={{ my: 2 }}
      />
      <Button
        variant="contained"
        onClick={handleQuery}
        disabled={loading || !query.trim()}
      >
        {loading ? <CircularProgress size={24} /> : 'Run'}
      </Button>
      {error && (
        <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>
      )}
      {(result.text || result.plot || result.explanation || result.code) && (
        <Paper elevation={3} sx={{ my: 3, p: 2 }}>
          {result.text && (
            <Typography sx={{ mb: 2 }}>{result.text}</Typography>
          )}
          {result.plot && (
            <img src={result.plot} alt="Result Plot" style={{ maxWidth: '100%', marginBottom: 16 }} />
          )}
          {result.explanation && (
            <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
              <strong>Explanation:</strong> {result.explanation}
            </Typography>
          )}
          {result.code && (
            <Accordion sx={{ mt: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Show generated Python code</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <pre style={{
                  background: "#f7f7f9",
                  borderRadius: "4px",
                  padding: "12px",
                  overflowX: "auto",
                  fontSize: "0.72rem",         // smaller font
                  lineHeight: 1.5,
                  // whiteSpace: "pre-wrap",      // enables wrapping
                  // wordBreak: "break-word"      // ensures long words/lines wrap
                }}>
                  {result.code}
                </pre>
              </AccordionDetails>
            </Accordion>
          )}
        </Paper>
      )}

    </Box>
  );
};

export default LLMEDA;
