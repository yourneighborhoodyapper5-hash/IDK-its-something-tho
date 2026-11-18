import { getWindows, saveWindows } from "./storage.js";

export function createWindowManager({ root, windowsRoot, taskRoot, getMode, onClose }) {
  const windows = new Map();
  let zIndex = 10;
  const positions = getWindows();

  function focusWindow(windowId) {
    const record = windows.get(windowId);
    if (!record) return;
    zIndex += 1;
    record.element.style.zIndex = zIndex;
    record.element.classList.add("focused");
    windows.forEach(item => {
      if (item !== record) item.element.classList.remove("focused");
    });
    taskRoot.querySelectorAll("[data-window-id]").forEach(item => {
      item.classList.toggle("active", item.dataset.windowId === windowId);
    });
  }

  function savePosition(record) {
    const rect = record.element.getBoundingClientRect();
    positions[record.id] = {
      left: Math.max(8, rect.left),
      top: Math.max(8, rect.top),
      width: rect.width,
      height: rect.height
    };
    saveWindows(positions);
  }

  function makeWindowDraggable(element, record) {
    const header = element.querySelector(".window-header");
    let drag = null;

    header.addEventListener("pointerdown", event => {
      if (getMode() === "mobile" || event.target.closest("button")) return;
      if (element.classList.contains("maximized")) return;
      header.setPointerCapture(event.pointerId);
      const rect = element.getBoundingClientRect();
      drag = { x: event.clientX, y: event.clientY, left: rect.left, top: rect.top };
      event.preventDefault();
    });

    header.addEventListener("pointermove", event => {
      if (!drag) return;
      element.style.left = `${Math.max(0, drag.left + event.clientX - drag.x)}px`;
      element.style.top = `${Math.max(0, drag.top + event.clientY - drag.y)}px`;
    });

    header.addEventListener("pointerup", () => {
      if (drag) savePosition(record);
      drag = null;
    });
  }

  function makeWindowResizable(element, record) {
    element.addEventListener("pointerup", () => {
      if (!element.classList.contains("maximized")) savePosition(record);
    });
  }

  function updateTaskbar() {
    taskRoot.replaceChildren();
    windows.forEach(record => {
      const button = document.createElement("button");
      button.className = "task-app";
      button.dataset.windowId = record.id;
      button.type = "button";
      button.textContent = record.title;
      button.addEventListener("click", () => {
        if (record.element.classList.contains("minimized")) {
          restoreWindow(record.id);
        } else {
          focusWindow(record.id);
        }
      });
      taskRoot.append(button);
    });
  }

  function openApp({ id, title, icon, render }) {
    const existing = windows.get(id);
    if (existing) {
      restoreWindow(id);
      focusWindow(id);
      return existing;
    }

    const element = document.createElement("article");
    element.className = "window";
    element.dataset.windowId = id;
    element.setAttribute("role", "dialog");
    element.setAttribute("aria-label", title);

    const header = document.createElement("header");
    header.className = "window-header";
    header.innerHTML = `
      <span class="icon">${icon || ""}</span>
      <span class="window-title">${title}</span>
      <div class="window-controls">
        <button class="minimize" type="button" title="Minimize" aria-label="Minimize ${title}"><span class="icon" data-icon="minimize"></span></button>
        <button class="maximize" type="button" title="Maximize" aria-label="Maximize ${title}"><span class="icon" data-icon="maximize"></span></button>
        <button class="close" type="button" title="Close" aria-label="Close ${title}"><span class="icon" data-icon="close"></span></button>
      </div>
    `;
    const body = document.createElement("div");
    body.className = "window-body";
    element.append(header, body);
    windowsRoot.append(element);

    const record = { id, title, element, body };
    windows.set(id, record);
    const saved = positions[id];
    if (saved && getMode() !== "mobile") {
      element.style.left = `${saved.left}px`;
      element.style.top = `${saved.top}px`;
      element.style.width = `${saved.width}px`;
      element.style.height = `${saved.height}px`;
    } else {
      const count = windows.size - 1;
      element.style.left = `${Math.min(80 + count * 25, window.innerWidth - 350)}px`;
      element.style.top = `${Math.min(45 + count * 25, window.innerHeight - 280)}px`;
    }

    header.querySelector(".minimize").addEventListener("click", () => minimizeWindow(id));
    header.querySelector(".maximize").addEventListener("click", () => maximizeWindow(id));
    header.querySelector(".close").addEventListener("click", () => closeWindow(id));
    element.addEventListener("pointerdown", () => focusWindow(id));
    makeWindowDraggable(element, record);
    makeWindowResizable(element, record);
    render(body);
    updateTaskbar();
    focusWindow(id);
    return record;
  }

  function closeWindow(windowId) {
    const record = windows.get(windowId);
    if (!record) return;
    record.element.remove();
    windows.delete(windowId);
    updateTaskbar();
    onClose?.(windowId);
  }

  function minimizeWindow(windowId) {
    const record = windows.get(windowId);
    if (!record) return;
    record.element.classList.add("minimized");
    updateTaskbar();
  }

  function maximizeWindow(windowId) {
    const record = windows.get(windowId);
    if (!record) return;
    record.element.classList.toggle("maximized");
    focusWindow(windowId);
  }

  function restoreWindow(windowId) {
    const record = windows.get(windowId);
    if (!record) return;
    record.element.classList.remove("minimized");
    focusWindow(windowId);
  }

  function closeAll() {
    [...windows.keys()].forEach(closeWindow);
  }

  return {
    openApp, closeWindow, minimizeWindow, maximizeWindow, restoreWindow,
    focusWindow, makeWindowDraggable, makeWindowResizable, closeAll
  };
}
