import { getSettings, saveSettings } from "./src/storage.js";
import { detectMode, resolveMode, watchDeviceMode } from "./src/device-mode.js";
import { initializeTheme } from "./src/themes.js";
import { createWindowManager } from "./src/window-manager.js";
import { notepad } from "./src/apps/notepad.js";
import { calculator } from "./src/apps/calculator.js";
import { fileManager } from "./src/apps/file-manager.js";
import { settings } from "./src/apps/settings.js";
import { about } from "./src/apps/about.js";
import { appLauncher } from "./src/apps/app-launcher.js";

const icons = {
  grid: `<svg viewBox="0 0 24 24"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg>`,
  apps: `<svg viewBox="0 0 24 24"><circle cx="6" cy="6" r="1.5"/><circle cx="12" cy="6" r="1.5"/><circle cx="18" cy="6" r="1.5"/><circle cx="6" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="18" cy="12" r="1.5"/><circle cx="6" cy="18" r="1.5"/><circle cx="12" cy="18" r="1.5"/><circle cx="18" cy="18" r="1.5"/></svg>`,
  home: `<svg viewBox="0 0 24 24"><path d="m3 11 9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></svg>`,
  back: `<svg viewBox="0 0 24 24"><path d="m15 5-7 7 7 7"/><path d="M8 12h13"/></svg>`,
  settings: `<svg viewBox="0 0 24 24"><path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/><path d="M4 13v-2l3-1 1-3-1-2 2-1 2 2h2l2-2 2 1-1 3 1 3 3 1v2l-3 1-1 3-2 1-2-2h-2l-2 2-2-1 1-3-1-3-3-1Z"/></svg>`,
  folder: `<svg viewBox="0 0 24 24"><path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/></svg>`,
  document: `<svg viewBox="0 0 24 24"><path d="M6 3h8l4 4v14H6Z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></svg>`,
  calculator: `<svg viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h2M14 11h2M8 15h2M14 15h2M8 18h8"/></svg>`,
  info: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>`,
  spark: `<svg viewBox="0 0 24 24"><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8Z"/><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7Z"/></svg>`,
  minimize: `<svg viewBox="0 0 24 24"><path d="M5 12h14"/></svg>`,
  maximize: `<svg viewBox="0 0 24 24"><rect x="5" y="5" width="14" height="14" rx="1"/></svg>`,
  close: `<svg viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg>`
};

const apps = [notepad, calculator, fileManager, settings, about, appLauncher];
const app = document.querySelector("#app");
const desktopIcons = document.querySelector("#desktop-icons");
const startApps = document.querySelector("#start-apps");
const startMenu = document.querySelector("#start-menu");
const taskApps = document.querySelector("#task-apps");
let settingsState = getSettings();
let mode = resolveMode(settingsState.mode);
let previousMobileApp = null;

function refreshIcons(scope = document) {
  scope.querySelectorAll("[data-icon]").forEach(node => {
    const name = node.dataset.icon;
    if (icons[name]) node.innerHTML = icons[name];
  });
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.querySelector("#toast-region").append(toast);
  setTimeout(() => toast.remove(), 3000);
}

function setMode(preferenceOrMode) {
  settingsState = getSettings();
  const selected = preferenceOrMode || settingsState.mode;
  mode = resolveMode(selected);
  app.dataset.mode = mode;
  document.querySelector("#start-mode").textContent = `${mode[0].toUpperCase()}${mode.slice(1)} mode`;
  if (mode === "mobile") {
    appManager.closeAll();
  }
  renderDesktopIcons();
}

const api = {
  apps,
  icon: name => icons[name] || "",
  refreshIcons,
  openApp,
  setMode,
  showToast
};

const appManager = createWindowManager({
  root: app,
  windowsRoot: document.querySelector("#windows"),
  taskRoot: taskApps,
  getMode: () => mode,
  onClose: id => {
    if (previousMobileApp === id) previousMobileApp = null;
  }
});

function openApp(id) {
  const definition = typeof id === "string" ? apps.find(item => item.id === id) : id;
  if (!definition) return;
  startMenu.hidden = true;

  if (mode === "mobile") {
    appManager.closeAll();
    previousMobileApp = definition.id;
  }

  appManager.openApp({
    id: definition.id,
    title: definition.title,
    icon: icons[definition.icon],
    render: body => definition.render(body, api)
  });
}

function renderDesktopIcons() {
  desktopIcons.replaceChildren();
  apps.filter(item => item.id !== "app-launcher").forEach(item => {
    const button = document.createElement("button");
    button.className = "desktop-icon";
    button.type = "button";
    button.innerHTML = `<span class="icon">${icons[item.icon]}</span><span>${item.title}</span>`;
    button.addEventListener("dblclick", () => openApp(item.id));
    button.addEventListener("click", () => {
      if (mode !== "desktop") openApp(item.id);
    });
    button.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") openApp(item.id);
    });
    desktopIcons.append(button);
  });
}

function renderStartMenu() {
  startApps.replaceChildren();
  apps.forEach(item => {
    const button = document.createElement("button");
    button.className = "start-app";
    button.type = "button";
    button.innerHTML = `<span class="icon">${icons[item.icon]}</span><span>${item.title}</span>`;
    button.addEventListener("click", () => openApp(item.id));
    startApps.append(button);
  });
}

function updateClock() {
  const value = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  document.querySelector("#clock").textContent = value;
  document.querySelector("#mobile-time").textContent = value;
}

document.querySelector("#start-button").addEventListener("click", () => {
  startMenu.hidden = !startMenu.hidden;
  document.querySelector("#start-button").setAttribute("aria-expanded", String(!startMenu.hidden));
});

document.querySelector("#launcher-button").addEventListener("click", () => openApp("app-launcher"));
document.querySelector("[data-open-app=settings]").addEventListener("click", () => openApp("settings"));

document.querySelectorAll("[data-mobile-nav]").forEach(button => {
  button.addEventListener("click", () => {
    const action = button.dataset.mobileNav;
    if (action === "home") {
      appManager.closeAll();
      previousMobileApp = null;
    }
    if (action === "apps") openApp("app-launcher");
    if (action === "back" && previousMobileApp) {
      appManager.closeWindow(previousMobileApp);
      previousMobileApp = null;
    }
  });
});

window.addEventListener("keydown", event => {
  if (event.key === "Escape") startMenu.hidden = true;
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "l") {
    event.preventDefault();
    openApp("app-launcher");
  }
});

initializeTheme();
refreshIcons();
renderStartMenu();
renderDesktopIcons();
setMode();
updateClock();
setInterval(updateClock, 1000);
watchDeviceMode(() => {
  if (getSettings().mode === "auto") setMode("auto");
});

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("./service-worker.js").catch(() => {});
}
