import React from "react";
import ReactDOM from "react-dom/client";
import ImportAccount from "./pages/import/ImportAccount";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ImportAccount />
  </React.StrictMode>,
);
