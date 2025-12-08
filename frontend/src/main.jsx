import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

// Show loading message immediately
rootElement.innerHTML =
  '<div style="padding: 20px; text-align: center; font-family: sans-serif;"><p>Loading TeamBoard...</p></div>';

try {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} catch (error) {
  console.error("Failed to render app:", error);
  rootElement.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif; color: red;">
      <h1>Error Loading Application</h1>
      <p><strong>Error:</strong> ${error.message}</p>
      <p>Check the browser console (F12) for more details.</p>
      <pre style="background: #f0f0f0; padding: 10px; overflow: auto;">${error.stack || error.toString()}</pre>
    </div>
  `;
}
