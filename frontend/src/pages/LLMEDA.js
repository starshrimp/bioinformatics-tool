import React, { useState } from 'react';
import { Typography, TextField, Button, Box, CircularProgress, Paper } from '@mui/material';

const LLMEDA = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);         // For the response (text or image)
  const [explanation, setExplanation] = useState(''); // For LLM-generated description
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleQuery = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    setExplanation('');
    try {
      const response = await fetch('/api/llm-eda', { // Adjust this endpoint to your backend
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setResult(data.result);          // image (base64) or text
      setExplanation(data.explanation); // text explanation from LLM
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
        Ask a question about your clinical metadata.<br/>
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
      {(result || explanation) && (
        <Paper elevation={3} sx={{ my: 3, p: 2 }}>
          {result && (
            typeof result === 'string' && result.startsWith('data:image') ? (
              <img src={result} alt="Result Plot" style={{ maxWidth: '100%' }} />
            ) : (
              <Typography>{result}</Typography>
            )
          )}
          {explanation && (
            <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
              <strong>Explanation:</strong> {explanation}
            </Typography>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default LLMEDA;
