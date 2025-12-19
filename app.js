const app = document.getElementById("app");
if (!app) {
  console.error("No #app element found.");
  // Stop executing — avoids uncaught errors later
  throw new Error("No #app element found.");
}

let data = {};
let state = {};
try {
  state = JSON.parse(localStorage.getItem("nestApprovedState")) || {};
} catch (err) {
  console.warn("Failed to parse saved state, resetting.", err);
  state = {};
}

function saveState() {
  try {
    localStorage.setItem("nestApprovedState", JSON.stringify(state));
  } catch (err) {
    console.warn("Failed to save state to localStorage", err);
  }
}

fetch("./data.json")
  .then(res => {
    if (!res.ok) throw new Error("HTTP " + res.status);
    return res.json();
  })
  .then(json => {
    data = json || {};
    renderMenu();
  })
  .catch(err => {
    app.innerHTML = "<p style='color:red'>Error loading data.json</p>";
    console.error(err);
  });

function renderMenu() {
  app.innerHTML = ""; // clear
  const h1 = document.createElement("h1");
  h1.textContent = "Nest Approved";
  app.appendChild(h1);

  const menu = Array.isArray(data.menu) ? data.menu : [];
  if (menu.length === 0) {
    const p = document.createElement("p");
    p.textContent = "No menu items found.";
    app.appendChild(p);
    return;
  }

  menu.forEach(item => {
    const div = document.createElement("div");
    div.className = "menu-item";
    div.textContent = item.title || "Untitled";
    div.tabIndex = 0; // make keyboard-focusable
    div.addEventListener("click", () => showChecklist(item.id, item.title));
    div.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        showChecklist(item.id, item.title);
      }
    });
    app.appendChild(div);
  });
}

function createTextRow(labelText, value) {
  const row = document.createElement("div");
  const strong = document.createElement("strong");
  strong.textContent = labelText;
  row.appendChild(strong);
  const span = document.createElement("span");
  span.textContent = " " + (value || "");
  row.appendChild(span);
  return row;
}

function showChecklist(id, title) {
  app.innerHTML = ""; // clear

  const h2 = document.createElement("h2");
  h2.textContent = title || "";
  app.appendChild(h2);

  const back = document.createElement("button");
  back.textContent = "← Back";
  back.addEventListener("click", renderMenu);
  app.appendChild(back);

  const list = (data.checklists && data.checklists[id]) || [];
  if (!Array.isArray(list) || list.length === 0) {
    const p = document.createElement("p");
    p.textContent = "No checklist items.";
    app.appendChild(p);
    return;
  }

  list.forEach(item => {
    const key = `${id}-${item.id}`;

    const box = document.createElement("div");
    box.className = "checklist-item";
    // Prefer CSS classes, but keep minimal inline for fallback
    box.style.border = "1px solid #ccc";
    box.style.padding = "10px";
    box.style.margin = "10px 0";
    box.style.borderRadius = "8px";

    const label = document.createElement("label");
    label.style.display = "flex";
    label.style.alignItems = "center";
    label.style.gap = "10px";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = "chk-" + key;
    checkbox.checked = !!state[key];

    const text = document.createElement("strong");
    text.textContent = item.text || "Untitled item";
    // Associate label with checkbox
    label.appendChild(checkbox);
    label.appendChild(text);
    box.appendChild(label);

    const details = document.createElement("div");
    details.style.marginTop = "10px";
    details.style.display = checkbox.checked ? "none" : "block";
    details.setAttribute("aria-hidden", checkbox.checked ? "true" : "false");

    // Add rows safely using textContent
    details.appendChild(createTextRow("Why it matters:", item.why));
    details.appendChild(createTextRow("What to look for:", item.look));
    details.appendChild(createTextRow("Common homeowner mistake:", item.mistake));
    details.appendChild(createTextRow("When to call a professional:", item.pro));
    details.appendChild(createTextRow("Inspector note:", item.note));

    // Images: create elements (avoid innerHTML)
    function addImageSection(labelText, url, borderColor, altSuffix) {
      if (!url) return;
      const s = document.createElement("div");
      s.style.marginTop = "10px";
      const t = document.createElement("div");
      t.textContent = labelText;
      s.appendChild(t);
      const img = document.createElement("img");
      img.src = url;
      img.alt = (item.text ? item.text + " " : "") + (altSuffix || "");
      img.loading = "lazy";
      img.style.maxWidth = "100%";
      img.style.border = `3px solid ${borderColor}`;
      img.style.borderRadius = "6px";
      s.appendChild(img);
      details.appendChild(s);
    }

    addImageSection("❌ Example of an issue", item.badImage, "red", "bad");
    addImageSection("✅ Acceptable condition", item.goodImage, "green", "good");

    checkbox.addEventListener("change", () => {
      state[key] = checkbox.checked;
      saveState();
      details.style.display = checkbox.checked ? "none" : "block";
      details.setAttribute("aria-hidden", checkbox.checked ? "true" : "false");
    });

    box.appendChild(details);
    app.appendChild(box);
  });
}