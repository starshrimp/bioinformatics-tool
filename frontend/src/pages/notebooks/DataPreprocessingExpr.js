// src/pages/Eda.js
import React from "react";

const DataPrepExpr = () => (
  <div style={{ height: "100vh" }}>
    <h1>Data Preprocessing Expression Matrix</h1>
    <iframe
      src="/notebooks/01_data_preprocessing_expr.html"
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

export default DataPrepExpr;
