export const appLauncher = {
  id: "app-launcher",
  title: "App Launcher",
  icon: "apps",
  render(root, api) {
    root.innerHTML = `
      <div class="app-heading">
        <div><h2>Applications</h2><p class="muted">Choose an application to open.</p></div>
      </div>
      <div class="app-grid" data-grid></div>
    `;

    const grid = root.querySelector("[data-grid]");
    api.apps.forEach(app => {
      const button = document.createElement("button");
      button.className = "app-card";
      button.type = "button";
      button.innerHTML = `
        <span class="icon">${app.icon || ""}</span>
        <strong>${app.title}</strong>
        <small>Open application</small>
      `;
      button.addEventListener("click", () => api.openApp(app.id));
      grid.append(button);
    });
  }
};
