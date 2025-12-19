const app = document.getElementById("app");
let data = {};
let state = JSON.parse(localStorage.getItem("nestApprovedState")) || {};

fetch("./data.json")
  .then(res => res.json())
  .then(json => {
    data = json;
    renderMenu();
  });

function saveState() {
  localStorage.setItem("nestApprovedState", JSON.stringify(state));
}

function renderMenu() {
  app.innerHTML = "";
  data.menu.forEach(item => {
    const div = document.createElement("div");
    div.className = "menu-item";
    div.textContent = item.title;
    div.onclick = () => showChecklist(item.id, item.title);
    app.appendChild(div);
  });
}

function showChecklist(id, title) {
  app.innerHTML = "";

  const back = document.createElement("div");
  back.className = "back";
  back.textContent = "← Back";
  back.onclick = renderMenu;
  app.appendChild(back);

  const h2 = document.createElement("h2");
  h2.textContent = title;
  app.appendChild(h2);

  data[id].forEach((item, index) => {
    const key = `${id}-${index}`;

    const box = document.createElement("div");
    box.className = "checklist-item";

    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = state[key] || false;

    label.appendChild(checkbox);
    label.append(" " + item.title);
    box.appendChild(label);

    const details = document.createElement("div");
    details.className = "details";
    details.innerHTML = `
      <div><strong>Why it matters:</strong> ${item.why}</div>
      <div><strong>What to look for:</strong> ${item.look}</div>
      ${item.note ? `<div><strong>Inspector Note:</strong> ${item.note}</div>` : ""}
      <div class="bad">BAD EXAMPLE</div>
      <div class="good">GOOD EXAMPLE</div>
    `;

    if (!checkbox.checked) {
      box.appendChild(details);
    }

    checkbox.onchange = () => {
      state[key] = checkbox.checked;
      saveState();
      showChecklist(id, title);
    };

    app.appendChild(box);
  });
}
