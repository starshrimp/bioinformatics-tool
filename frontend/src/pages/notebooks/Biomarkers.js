// src/pages/Eda.js
import React from "react";

const Biomarkers = () => (
  <div style={{ height: "100vh" }}>
    <h1>Supervised Machine Learning for Prediction of Biomarkers</h1>
    <iframe
      src="/notebooks/07_biomarkers.html"
      title="Biomarkers Notebook"
      style={{
        width: "100%",
        height: "100%",
        border: "none",
        background: "black"
      }}
    />
  </div>
  
);

export default Biomarkers;
