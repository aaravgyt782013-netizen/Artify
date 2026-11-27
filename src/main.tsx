import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { LibraryProvider } from "./lib/library";
import { PlayerProvider } from "./lib/player";
import { NavProvider } from "./lib/nav";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <LibraryProvider>
      <PlayerProvider>
        <NavProvider>
          <App />
        </NavProvider>
      </PlayerProvider>
    </LibraryProvider>
  </React.StrictMode>
);

if ("serviceWorker" in navigator && import.meta.env.PROD && !location.hostname.includes("localhost")) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
}
