// src/pages/Eda.js
import React from "react";

const DataPrepClin = () => (
  <div style={{ height: "100vh" }}>
    <h1>Data Preprocessing Clinical Metadata</h1>
    <iframe
      src="/notebooks/02_data_preprocessing_clinical.html"
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

export default DataPrepClin;
