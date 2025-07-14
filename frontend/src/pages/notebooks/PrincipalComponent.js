// src/pages/Eda.js
import React from "react";

const DataAnalysis = () => (
  <div style={{ height: "100vh" }}>
    <h1>Principal Components Analysis</h1>
    <iframe
      src="/notebooks/04_PCA.html"
      title="Principal Components Analysis Notebook"
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
