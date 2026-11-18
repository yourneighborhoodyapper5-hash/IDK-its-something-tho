export const about = {
  id: "about",
  title: "About LightDesk",
  icon: "info",
  render(root) {
    root.innerHTML = `
      <div class="about-mark">
        <span class="icon" data-icon="spark"></span>
        <h2>LightDesk</h2>
        <span class="muted">Version 1.0.0</span>
      </div>
      <p>LightDesk is a lightweight browser-based desktop environment built with standard web technologies.</p>
      <p>It runs entirely on the client. Notes, settings, window preferences, and the simulated file system are stored locally using browser localStorage.</p>
      <div class="notice">Making this gave me brain damage.</div>
      <p><a href="https://github.com/" target="_blank" rel="noreferrer">GitHub repository</a></p>
    `;
  }
};
