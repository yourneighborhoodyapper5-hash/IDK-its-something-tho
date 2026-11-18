import { getNotes, saveNotes } from "../storage.js";

function makeId() {
  return `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export const notepad = {
  id: "notepad",
  title: "Notepad",
  icon: "document",
  render(root, api) {
    let notes = getNotes();
    let selected = notes[0]?.id || null;
    let timer;

    const layout = document.createElement("div");
    layout.className = "notepad-layout";
    layout.innerHTML = `
      <div class="app-heading">
        <h2>Notepad</h2>
        <button class="primary" data-action="new">New note</button>
      </div>
      <div class="form-row">
        <input data-field="title" aria-label="Note title" placeholder="Note title">
        <button class="secondary" data-action="delete">Delete</button>
      </div>
      <textarea data-field="content" aria-label="Note content" placeholder="Start writing..."></textarea>
      <p class="muted" data-status></p>
      <h3>Saved notes</h3>
      <div class="list" data-list></div>
    `;
    root.append(layout);

    const title = layout.querySelector("[data-field=title]");
    const content = layout.querySelector("[data-field=content]");
    const list = layout.querySelector("[data-list]");
    const status = layout.querySelector("[data-status]");

    function current() {
      return notes.find(note => note.id === selected);
    }

    function refreshEditor() {
      const note = current();
      title.value = note?.title || "";
      content.value = note?.content || "";
      status.textContent = note ? `Saved locally Â· ${new Date(note.updated).toLocaleTimeString()}` : "Create a note to begin.";
      layout.querySelector("[data-action=delete]").disabled = !note;
    }

    function refreshList() {
      list.replaceChildren();
      if (!notes.length) {
        list.innerHTML = `<div class="empty">No notes saved.</div>`;
        return;
      }
      notes.slice().sort((a, b) => b.updated - a.updated).forEach(note => {
        const item = document.createElement("div");
        item.className = "list-item";
        item.innerHTML = `<span class="icon" data-icon="document"></span><span>${note.title || "Untitled note"}</span>`;
        item.addEventListener("click", () => {
          selected = note.id;
          refreshEditor();
          refreshList();
        });
        item.setAttribute("role", "button");
        item.tabIndex = 0;
        item.addEventListener("keydown", event => {
          if (event.key === "Enter" || event.key === " ") item.click();
        });
        list.append(item);
      });
      api.refreshIcons(list);
    }

    layout.querySelector("[data-action=new]").addEventListener("click", () => {
      const note = { id: makeId(), title: "Untitled note", content: "", updated: Date.now() };
      notes.push(note);
      selected = note.id;
      saveNotes(notes);
      refreshEditor();
      refreshList();
      title.focus();
    });

    layout.querySelector("[data-action=delete]").addEventListener("click", () => {
      if (!selected || !confirm("Delete this note?")) return;
      notes = notes.filter(note => note.id !== selected);
      selected = notes[0]?.id || null;
      saveNotes(notes);
      refreshEditor();
      refreshList();
    });

    function autosave() {
      const note = current();
      if (!note) return;
      note.title = title.value.trim() || "Untitled note";
      note.content = content.value;
      note.updated = Date.now();
      clearTimeout(timer);
      timer = setTimeout(() => {
        saveNotes(notes);
        status.textContent = `Saved locally Â· ${new Date(note.updated).toLocaleTimeString()}`;
        refreshList();
      }, 300);
    }

    title.addEventListener("input", autosave);
    content.addEventListener("input", autosave);
    refreshEditor();
    refreshList();
  }
};
