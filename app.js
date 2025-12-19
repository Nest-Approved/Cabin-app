const app = document.getElementById("app");
let data = {};
let state = JSON.parse(localStorage.getItem("nestApprovedState")) || {};

fetch("data.json")
  .then(res => res.json())
  .then(json => {
    data = json;
    renderMenu();
  })
  .catch(err => {
    app.innerHTML = "<p>Error loading data.json</p>";
    console.error(err);
  });

function saveState() {
  localStorage.setItem("nestApprovedState", JSON.stringify(state));
}

function renderMenu() {
  app.innerHTML = "<h1>Nest Approved</h1>";

  data.menu.forEach(item => {
    const div = document.createElement("div");
    div.className = "menu-item";
    div.textContent = item.title;
    div.onclick = () => showChecklist(item.id, item.title);
    app.appendChild(div);
  });
}

function showChecklist(id, title) {
  app.innerHTML = `<h2>${title}</h2>`;

  const back = document.createElement("button");
  back.textContent = "← Back";
  back.onclick = renderMenu;
  app.appendChild(back);

  const list = data.checklists[id] || [];

  list.forEach(item => {
    const key = `${id}-${item.id}`;

    const box = document.createElement("div");
    box.className = "checklist-item";
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
    checkbox.checked = state[key] || false;

    const text = document.createElement("strong");
    text.textContent = item.text;

    label.appendChild(checkbox);
    label.appendChild(text);
    box.appendChild(label);

    const details = document.createElement("div");
    details.style.marginTop = "10px";
    details.style.display = checkbox.checked ? "none" : "block";

    details.innerHTML = `
      <div><strong>Why it matters:</strong> ${item.why || ""}</div>
      <div><strong>What to look for:</strong> ${item.look || ""}</div>
      <div><strong>Common homeowner mistake:</strong> ${item.mistake || ""}</div>
      <div><strong>When to call a professional:</strong> ${item.pro || ""}</div>
      <div><strong>Inspector note:</strong> ${item.note || ""}</div>
    `;

    if (item.badImage) {
      const badWrap = document.createElement("div");
      badWrap.innerHTML = `
        <div style="margin-top:10px;">❌ Example of an issue</div>
        <img src="${item.badImage}" style="width:100%;border:3px solid red;border-radius:6px;">
      `;
      details.appendChild(badWrap);
    }

    if (item.goodImage) {
      const goodWrap = document.createElement("div");
      goodWrap.innerHTML = `
        <div style="margin-top:10px;">✅ Acceptable condition</div>
        <img src="${item.goodImage}" style="width:100%;border:3px solid green;border-radius:6px;">
      `;
      details.appendChild(goodWrap);
    }

    checkbox.onchange = () => {
      state[key] = checkbox.checked;
      saveState();
      details.style.display = checkbox.checked ? "none" : "block";
    };

    box.appendChild(details);
    app.appendChild(box);
  });
                                              }
