import { sound } from "../sound.js";

/**
 * Bind modal, explorer, info panel, data import/export, audio, and theme window handlers.
 */
export function registerUiHandlers(db, ui, gm) {
  window.otevriStatsModal = () => {
    if (gm.currentPlayer) {
      ui.openStatsModal(gm.currentPlayer);
    }
  };
  window.zavriStatsModal = () => {
    ui.closeStatsModal();
  };

  window.otevriExplorer = () => {
    ui.openExplorer();
  };
  window.zavriExplorer = () => {
    ui.closeExplorer();
  };
  window.prepniExplorerTab = (tabName) => {
    ui.prepniExplorerTab(tabName);
  };
  window.filtrujLeaderboard = () => {
    ui.filtrujLeaderboard();
  };
  window.seradHistorii = (columnName) => {
    ui.seradHistorii(columnName);
  };

  window.toggleInfoPanel = () => {
    ui.toggleInfoPanel(gm.activeGameId);
  };
  window.zavriInfoPanel = () => {
    ui.zavriInfoPanel();
  };

  window.exportovatData = () => {
    const data = db.exportData();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", "gamblehub_data.json");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  window.importovatData = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        const success = db.importData(data);
        if (success) {
          ui.showAlert("success", "Import úspěšný", "Herní data byla úspěšně nahrána.");
          window.otevriPrihlaseni();
        } else {
          ui.showAlert("error", "Chyba importu", "Záložní soubor nemá správný formát.");
        }
      } catch {
        ui.showAlert("error", "Chyba", "Soubor se nepodařilo přečíst.");
      }
    };
    reader.readAsText(file);
  };

  window.checkEnter = (event, callback) => {
    if (event.key === "Enter") {
      event.preventDefault();
      callback();
    }
  };

  window.toggleMuteState = () => {
    const isMuted = sound.toggleMute();
    [
      document.getElementById("global-sound-toggle"),
      document.getElementById("hub-sound-toggle"),
      document.getElementById("login-sound-toggle"),
    ].forEach((btn) => {
      if (btn) {
        btn.classList.toggle("muted", isMuted);
      }
    });
  };

  window.toggleTheme = () => {
    const html = document.documentElement;
    const current = html.getAttribute("data-theme");
    const next = current === "cyan" ? "purple" : "cyan";
    html.setAttribute("data-theme", next === "cyan" ? "cyan" : "");
    localStorage.setItem("c_theme", next);
  };

  const savedTheme = localStorage.getItem("c_theme");
  if (savedTheme === "cyan") {
    document.documentElement.setAttribute("data-theme", "cyan");
  }
}
