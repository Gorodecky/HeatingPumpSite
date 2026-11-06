import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

const root = document.getElementById("root")!;
const app = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if (root.hasChildNodes())
  hydrateRoot(root, app, {
    onRecoverableError(error) {
      console.error("React hydration recovered from an error:", error);
    },
  });
else createRoot(root).render(app);
