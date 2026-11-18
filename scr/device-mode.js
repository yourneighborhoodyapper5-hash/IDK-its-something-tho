function touchAvailable() {
  return navigator.maxTouchPoints > 0 || "ontouchstart" in window;
}

export function detectMode() {
  const width = Math.min(window.innerWidth, window.innerHeight);
  const touch = touchAvailable();
  const coarse = window.matchMedia("(pointer: coarse)").matches;

  if (width <= 600) return "mobile";
  if (width <= 1100 || (touch && coarse && width <= 1280)) return "tablet";
  return "desktop";
}

export function resolveMode(preference) {
  return preference === "auto" ? detectMode() : preference;
}

export function watchDeviceMode(callback) {
  let timer;
  const run = () => {
    clearTimeout(timer);
    timer = setTimeout(() => callback(detectMode()), 100);
  };
  window.addEventListener("resize", run);
  window.addEventListener("orientationchange", run);
  return () => {
    window.removeEventListener("resize", run);
    window.removeEventListener("orientationchange", run);
  };
}

---

src/themes.js

import { getSettings, saveSettings } from "./storage.js";

export const themes = {
  dark: {
    label: "Dark",
    values: {
      bg: "#101827", surface: "#172235", surface2: "#20304a", surface3: "#293b58",
      text: "#f4f7fb", muted: "#aab8cb", accent: "#62a8ff", accentStrong: "#2677d8",
      wallpaper: "linear-gradient(135deg,#101827 0%,#1c3558 100%)"
    }
  },
  light: {
    label: "Light",
    values: {
      bg: "#e7edf5", surface: "#ffffff", surface2: "#edf2f8", surface3: "#dfe8f3",
      text: "#172235", muted: "#5b6b80", accent: "#2677d8", accentStrong: "#185bab",
      wallpaper: "linear-gradient(135deg,#dce9f7 0%,#a9c7e7 100%)"
    }
  },
  blue: {
    label: "Blue",
    values: {
      bg: "#071a32", surface: "#0d2949", surface2: "#123961", surface3: "#185084",
      text: "#edf7ff", muted: "#a5c4dc", accent: "#51c8ff", accentStrong: "#087fae",
      wallpaper: "linear-gradient(135deg,#071a32,#075985 55%,#16a6c7)"
    }
  },
  purple: {
    label: "Purple",
    values: {
      bg: "#211532", surface: "#302047", surface2: "#452b64", surface3: "#5c3a83",
      text: "#fbf4ff", muted: "#c7afd8", accent: "#d49aff", accentStrong: "#8f4fc2",
      wallpaper: "linear-gradient(135deg,#211532,#552c72 55%,#a54f9c)"
    }
  },
  green: {
    label: "Green",
    values: {
      bg: "#0c211d", surface: "#12372e", surface2: "#195143", surface3: "#216956",
      text: "#effff8", muted: "#a9cdc0", accent: "#62e0ae", accentStrong: "#16845f",
      wallpaper: "linear-gradient(135deg,#0c211d,#12634d 55%,#27a56f)"
    }
  }
};

export function applyTheme(themeName, wallpaper = null) {
  const theme = themes[themeName] || themes.dark;
  const root = document.documentElement;
  const map = {
    bg: "--bg", surface: "--surface", surface2: "--surface-2",
    surface3: "--surface-3", text: "--text", muted: "--muted",
    accent: "--accent", accentStrong: "--accent-strong"
  };
  Object.entries(map).forEach(([key, variable]) => root.style.setProperty(variable, theme.values[key]));
  root.style.setProperty("--wallpaper", wallpaper || theme.values.wallpaper);
  document.documentElement.dataset.theme = themeName;
}

export function initializeTheme() {
  const settings = getSettings();
  applyTheme(settings.theme, settings.wallpaper === "custom" ? settings.customWallpaper : null);
  document.body.classList.toggle("no-animations", !settings.animations);
}

export function setTheme(themeName) {
  const settings = getSettings();
  saveSettings({ ...settings, theme: themeName });
  applyTheme(themeName, settings.wallpaper === "custom" ? settings.customWallpaper : null);
}
