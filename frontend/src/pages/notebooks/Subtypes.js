// src/pages/Eda.js
import React from "react";

const Subtypes = () => (
  <div style={{ height: "100vh" }}>
    <h1>Supervised Machine Learning for Prediction of PAM50 Subtype</h1>
    <iframe
      src="/notebooks/06_subtypes.html"
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

export default Subtypes;
