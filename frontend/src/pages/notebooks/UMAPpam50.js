// src/pages/Eda.js
import React from "react";

const DataAnalysis = () => (
  <div style={{ height: "100vh" }}>
    <h1>UMAP for PAM50 Subtypes</h1>
    <iframe
      src="/notebooks/05_UMAP_PAM50.html"
      title="UMAP for PAM50 Subtypes"
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
