import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { SitePopupProvider } from "./SitePopup";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <SitePopupProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </SitePopupProvider>
  </React.StrictMode>
);
