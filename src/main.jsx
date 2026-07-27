import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import { BlobPreview } from "./BlobPreview.jsx";
import "./styles.css";
import "./wordmark.css";
import "./construction-mark.css";
import "./layers.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {location.pathname === '/blob-preview' ? <BlobPreview /> : <App />}
  </React.StrictMode>,
);
