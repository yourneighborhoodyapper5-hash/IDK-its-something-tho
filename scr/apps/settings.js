import { getSettings, saveSettings, resetData } from "../storage.js";
import { themes, setTheme, applyTheme } from "../themes.js";

export const settings = {
  id: "settings",
  title: "Settings",
  icon: "settings",
  render(root, api) {
    const current = getSettings();
    root.innerHTML = `
      <div class="app-heading"><h2>Settings</h2></div>
      <div class="form-stack">
        <label>Theme
          <select data-setting="theme">${Object.entries(themes).map(([id, theme]) => `<option value="${id}">${theme.label}</option>`).join("")}</select>
        </label>
        <label>Wallpaper
          <select data-setting="wallpaper">
            <option value="aurora">Aurora</option>
            <option value="midnight">Midnight</option>
            <option value="sunrise">Sunrise</option>
            <option value="custom">Custom CSS gradient</option>
          </select>
        </label>
        <label>Custom wallpaper CSS
          <input data-setting="customWallpaper" placeholder="linear-gradient(135deg,#123,#456)">
        </label>
        <label>Interface mode
          <select data-setting="mode">
            <option value="auto">Automatic</option>
            <option value="desktop">Desktop</option>
            <option value="tablet">Tablet</option>
            <option value="mobile">Mobile</option>
          </select>
        </label>
        <label>Animations
          <select data-setting="animations">
            <option value="true">Enabled</option>
            <option value="false">Disabled</option>
          </select>
        </label>
        <div class="notice">Preferences, notes, and virtual files are saved only in this browser.</div>
        <button class="danger" data-action="reset">Reset all saved data</button>
      </div>
    `;

    const wallpaperValues = {
      aurora: null,
      midnight: "linear-gradient(135deg,#080d19,#182b48)",
      sunrise: "linear-gradient(135deg,#4b2430,#c6764b 55%,#f3c969)"
    };

    Object.entries(current).forEach(([key, value]) => {
      const field = root.querySelector(`[data-setting="${key}"]`);
      if (field) field.value = String(value);
    });

    root.querySelectorAll("[data-setting]").forEach(field => {
      field.addEventListener("change", () => {
        const patch = {};
        patch[field.dataset.setting] = field.dataset.setting === "animations"
          ? field.value === "true"
          : field.value;
        const updated = { ...getSettings(), ...patch };
        saveSettings(updated);

        if (field.dataset.setting === "theme") setTheme(field.value);
        if (field.dataset.setting === "wallpaper") {
          const value = wallpaperValues[field.value] || (field.value === "custom" ? updated.customWallpaper : null);
          applyTheme(updated.theme, value);
        }
        if (field.dataset.setting === "customWallpaper" && updated.wallpaper === "custom") {
          applyTheme(updated.theme, field.value);
        }
        if (field.dataset.setting === "animations") document.body.classList.toggle("no-animations", !updated.animations);
        if (field.dataset.setting === "mode") api.setMode(updated.mode);
      });
    });

    root.querySelector("[data-action=reset]").addEventListener("click", () => {
      if (!confirm("Reset notes, files, preferences, and windows?")) return;
      resetData();
      location.reload();
    });
  }
};
