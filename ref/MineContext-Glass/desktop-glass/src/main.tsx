import React from "react";
import ReactDOM from "react-dom/client";

import ChromaticBackground from "./components/ChromaticBackground";
import App from "./App";

/* CSS imports are now handled by App.tsx */

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ChromaticBackground />
    <App />
  </React.StrictMode>,
);
