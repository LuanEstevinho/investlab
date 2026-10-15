import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Execução isolada do remote (desenvolvimento). Em produção é carregado pelo shell.
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App bffUrl={import.meta.env.VITE_BFF_URL ?? "http://localhost:3000"} />
  </React.StrictMode>,
);
