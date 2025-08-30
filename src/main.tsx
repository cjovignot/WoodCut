import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import favicon from "/logo_512x512.svg";
import "./index.css";
import App from "./App.tsx";

// on injecte dynamiquement dans le head
const link = document.createElement("link");
link.rel = "icon";
link.type = "image/png";
link.href = favicon; // => Vite génère /assets/logo_192x192.[hash].png
document.head.appendChild(link);
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
