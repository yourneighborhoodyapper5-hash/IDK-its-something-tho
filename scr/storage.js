const PREFIX = "lightdesk:";

const defaults = {
  settings: {
    theme: "dark",
    wallpaper: "aurora",
    mode: "auto",
    animations: true
  },
  notes: [
    { id: "welcome", title: "Welcome to LightDesk", content: "This note is stored locally in your browser.", updated: Date.now() }
  ],
  files: [
    { id: "root", parent: null, name: "Home", type: "folder", content: "" },
    { id: "readme", parent: "root", name: "Welcome.txt", type: "file", content: "LightDesk uses a virtual file system stored in localStorage." }
  ],
  windows: {}
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return clone(fallback);
    const value = JSON.parse(raw);
    return value ?? clone(fallback);
  } catch {
    return clone(fallback);
  }
}

function write(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function getSettings() {
  const settings = read("settings", defaults.settings);
  return { ...defaults.settings, ...(settings && typeof settings === "object" ? settings : {}) };
}

export function saveSettings(settings) {
  return write("settings", { ...getSettings(), ...settings });
}

export function getNotes() {
  const notes = read("notes", defaults.notes);
  return Array.isArray(notes) ? notes : clone(defaults.notes);
}

export function saveNotes(notes) {
  return write("notes", Array.isArray(notes) ? notes : []);
}

export function getFiles() {
  const files = read("files", defaults.files);
  return Array.isArray(files) && files.some(file => file.id === "root")
    ? files
    : clone(defaults.files);
}

export function saveFiles(files) {
  return write("files", Array.isArray(files) ? files : defaults.files);
}

export function getWindows() {
  const windows = read("windows", defaults.windows);
  return windows && typeof windows === "object" ? windows : {};
}

export function saveWindows(windows) {
  return write("windows", windows || {});
}

export function resetData() {
  try {
    Object.keys(localStorage)
      .filter(key => key.startsWith(PREFIX))
      .forEach(key => localStorage.removeItem(key));
    return true;
  } catch {
    return false;
  }
}
