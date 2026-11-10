import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
const BlobPreview = React.lazy(() => import("./BlobPreview.jsx").then(module => ({ default: module.BlobPreview })));
import "./makeover.css";
import "./quiet-tension.css";
import "./waveform.css";

const root = import.meta.hot?.data.root ?? createRoot(document.getElementById("root"));
if (import.meta.hot) import.meta.hot.data.root = root;

root.render(
  <React.StrictMode>
    <React.Suspense fallback={<p>Loading the concrete object…</p>}>{location.pathname === '/blob-preview' ? <BlobPreview /> : <App />}</React.Suspense>
  </React.StrictMode>,
);
