import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App bffUrl={import.meta.env.VITE_BFF_URL ?? "http://localhost:3000"} usuarioId="demo" />
  </React.StrictMode>,
);
