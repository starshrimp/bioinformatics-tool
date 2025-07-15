// src/pages/Eda.js
import React from "react";

const DataAnalysis = () => (
  <div style={{ height: "100vh" }}>
    <h1>UMAP for Cancer Biomarkers</h1>
    <iframe
      src="/notebooks/05_UMAP_Biomarkers.html"
      title="UMAP for Cancer Biomarkers"
      style={{
        width: "100%",
        height: "100%",
        border: "none",
        background: "black"
      }}
    />
  </div>
  
);

export default DataAnalysis;
