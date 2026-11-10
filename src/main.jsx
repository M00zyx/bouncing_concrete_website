import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
const BlobPreview = React.lazy(() => import("./BlobPreview.jsx").then(module => ({ default: module.BlobPreview })));
import "./makeover.css";
import "./waveform.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <React.Suspense fallback={<p>Loading the concrete object…</p>}>{location.pathname === '/blob-preview' ? <BlobPreview /> : <App />}</React.Suspense>
  </React.StrictMode>,
);
