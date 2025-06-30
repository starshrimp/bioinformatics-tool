import React from 'react';
import { Typography, Container, Box, Link } from '@mui/material';

const Landing = () => (
  <Container maxWidth="md">
    <Box sx={{ mt: 8 }}>
      <Typography variant="h4" gutterBottom>
        Bioinformatics Insights Tool
      </Typography>
      <Typography variant="body1" gutterBottom>
        This interactive tool provides exploratory and AI-assisted insights based on the GSE96058 breast cancer RNA-seq dataset from the SCAN-B initiative.
      </Typography>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          About the Original Study<sup style={{ fontSize: '0.6em', verticalAlign: 'super' }}>1</sup>
        </Typography>
        <Typography variant="body2" component="p">
          The SCAN-B cohort includes 3,273 breast cancer (BC) patients, where gene expression profiling by Illumina RNA-sequencing was performed. The aim was to develop mRNA-based classifiers for five key biomarkers: estrogen receptor (ER), progesterone receptor (PgR), HER2, Ki67, and histologic grade (NHG).
        </Typography>
        <Typography variant="body2" component="p">
          These RNA-seq–based classifiers were validated against histopathology and showed similar classification accuracy. Interestingly, discordant classifications (e.g., hormone receptor positive by histology but negative by RNA-seq) were associated with significantly poorer outcomes — highlighting the clinical potential of transcriptomic profiling.
        </Typography>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Dataset Summary
        </Typography>
        <Typography variant="body2" component="p">
          • <strong>Organism:</strong> Homo sapiens<br />
          • <strong>Type:</strong> Gene expression matrix <br />
          • <strong>Sample size:</strong> 3409 x 30’922 (samples x genes)<br />
          • <strong>Technology:</strong> Paired-end RNA-seq (Illumina HiSeq 2000)<br />
          • <strong>Labels:</strong> Various Labels from clinical metadata, including histopathology for 5 biomarkers and PAM50 subtypes<br />
          • <strong>Structure:</strong> Includes 136 technical validation replicates 
        </Typography>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          About This Tool
        </Typography>
        <Typography variant="body2" component="p">
          This tool was developed by Sarah Rebecca Meyer and enables the exploration of this dataset using interactive visualizations, unsupervised learning, and supervised models. The goal is to demonstrate the power of AI-driven approaches in uncovering clinically relevant patterns in cancer transcriptomics.
        </Typography>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="body2" component="p">
          📂 View the original dataset on&nbsp;
          <Link href="https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE96058" target="_blank" rel="noopener">
            NCBI GEO: GSE96058
          </Link>
        </Typography>
      </Box>

      <Box sx={{ mt: 6 }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
          <sup>1</sup> Brueffer, C., Vallon-Christersson, J., Grabau, D., Ehinger, A., Häkkinen, J., Hegardt, C., Malina, J., Chen, Y., Bendahl, P. O., Manjer, J., Malmberg, M., Larsson, C., Loman, N., Rydén, L., Borg, Å., & Saal, L. H. (2018). Clinical Value of RNA Sequencing-Based Classifiers for Prediction of the Five Conventional Breast Cancer Biomarkers: A Report From the Population-Based Multicenter Sweden Cancerome Analysis Network–Breast Initiative. <em>JCO Precision Oncology, 2</em>, PO.17.00135.{' '}
          <Link href="https://doi.org/10.1200/PO.17.00135" target="_blank" rel="noopener">
            https://doi.org/10.1200/PO.17.00135
          </Link>
        </Typography>
      </Box>
    </Box>
  </Container>
);

export default Landing;
