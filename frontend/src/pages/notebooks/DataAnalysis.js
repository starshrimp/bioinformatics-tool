// src/pages/Eda.js
import React from "react";

const DataAnalysis = () => (
  <div style={{ height: "100vh" }}>
    <h1>Data Analysis</h1>
    <iframe
      src="/notebooks/03_data_analysis.html"
      title="Data Analysis Notebook"
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
