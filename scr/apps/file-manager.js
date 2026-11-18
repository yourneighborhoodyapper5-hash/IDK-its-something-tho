import { getFiles, saveFiles } from "../storage.js";

function id() {
  return `file-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const fileManager = {
  id: "file-manager",
  title: "File Manager",
  icon: "folder",
  render(root, api) {
    let files = getFiles();
    let current = "root";

    root.innerHTML = `
      <div class="app-heading">
        <div><h2>File Manager</h2><p class="muted">Virtual files stored in this browser</p></div>
        <div class="form-row">
          <button class="secondary" data-action="folder">New folder</button>
          <button class="primary" data-action="file">New text file</button>
        </div>
      </div>
      <div class="form-row"><button class="secondary" data-action="up">Up</button><strong data-path>Home</strong></div>
      <div class="list" data-list></div>
    `;

    const list = root.querySelector("[data-list]");
    const path = root.querySelector("[data-path]");

    function children() {
      return files.filter(item => item.parent === current);
    }

    function renderList() {
      const folder = files.find(item => item.id === current);
      path.textContent = folder?.name || "Home";
      list.replaceChildren();
      const items = children();
      if (!items.length) list.innerHTML = `<div class="empty">This folder is empty.</div>`;

      items.forEach(item => {
        const row = document.createElement("div");
        row.className = "list-item";
        row.innerHTML = `
          <span class="icon" data-icon="${item.type === "folder" ? "folder" : "document"}"></span>
          <span>${item.name}</span>
          <button type="button" data-action="open" title="Open">Open</button>
          <button type="button" data-action="rename" title="Rename">Rename</button>
          <button type="button" data-action="delete" title="Delete">Delete</button>
        `;
        row.querySelector("[data-action=open]").addEventListener("click", () => {
          if (item.type === "folder") {
            current = item.id;
            renderList();
          } else {
            alert(`${item.name}\n\n${item.content || "(empty file)"}`);
          }
        });
        row.querySelector("[data-action=rename]").addEventListener("click", () => {
          const name = prompt("Enter a new name:", item.name);
          if (name?.trim()) {
            item.name = name.trim();
            saveFiles(files);
            renderList();
          }
        });
        row.querySelector("[data-action=delete]").addEventListener("click", () => {
          if (!confirm(`Delete ${item.name}?`)) return;
          const ids = new Set([item.id]);
          let changed = true;
          while (changed) {
            changed = false;
            files.forEach(candidate => {
              if (ids.has(candidate.parent) && !ids.has(candidate.id)) {
                ids.add(candidate.id);
                changed = true;
              }
            });
          }
          files = files.filter(candidate => !ids.has(candidate.id));
          saveFiles(files);
          renderList();
        });
        list.append(row);
      });
      api.refreshIcons(root);
    }

    root.querySelector("[data-action=up]").addEventListener("click", () => {
      const folder = files.find(item => item.id === current);
      if (folder?.parent) {
        current = folder.parent;
        renderList();
      }
    });

    root.querySelector("[data-action=folder]").addEventListener("click", () => {
      const name = prompt("Folder name:");
      if (!name?.trim()) return;
      files.push({ id: id(), parent: current, name: name.trim(), type: "folder", content: "" });
      saveFiles(files);
      renderList();
    });

    root.querySelector("[data-action=file]").addEventListener("click", () => {
      const name = prompt("Text file name:", "New file.txt");
      if (!name?.trim()) return;
      files.push({ id: id(), parent: current, name: name.trim(), type: "file", content: "" });
      saveFiles(files);
      renderList();
    });

    renderList();
  }
};
