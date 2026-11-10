import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
const BlobPreview = React.lazy(() => import("./BlobPreview.jsx").then(module => ({ default: module.BlobPreview })));
import "./styles.css";
import "./wordmark.css";
import "./construction-mark.css";
import "./layers.css";
import "./refinements.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <React.Suspense fallback={<p>Loading the concrete object…</p>}>{location.pathname === '/blob-preview' ? <BlobPreview /> : <App />}</React.Suspense>
  </React.StrictMode>,
);
