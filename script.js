class Shop {
  constructor() {
    this.shop = [];
    this.deletedStack = [];
  }

  addSuits(suit) {
    this.shop.push(suit);
    saveToStorage();
  }

  removeSuit(srno) {
    const index = this.shop.findIndex(s => s.Srno === srno);
    if (index !== -1) {
      this.deletedStack.push(this.shop[index]);
      this.shop.splice(index, 1);
      saveToStorage();
    }
  }

  undoDelete() {
    if (this.deletedStack.length > 0) {
      const restored = this.deletedStack.pop();
      this.shop.push(restored);
      saveToStorage();
      displaySuits();
    }
  }

  updateSuit(srno, newData) {
    const index = this.shop.findIndex(s => s.Srno === srno);
    if (index !== -1) {
      this.shop[index] = new Suit({ ...this.shop[index], ...newData });
      saveToStorage();
    }
  }

  listAllSuits() {
    return this.shop;
  }
}

class Suit {
  constructor(data) {
    this.name = data.name || "";
    this.Srno = data.Srno || "";
    this.address = data.address || "";
    this.Date = data.Date || new Date().toLocaleString();
    this.लंबाई = data.लंबाई || "";
    this.छाती = data.छाती || "";
    this.कमर = data.कमर || "";
    this.हिप = data.हिप || "";
    this.घेरा = data.घेरा || "";
    this.चाक = data.चाक || "";
    this.तीरा = data.तीरा || "";
    this.भाजु = data.भाजु || "";
    this.गला = data.गला || "";
    this.सलवार = data.सलवार || "";
    this.मोहरी = data.मोहरी || "";
    this.थाई = data.थाई || "";
    this.Price = data.Price || "";
    this.quantity = data.quantity || "";
    this.status = data.status || "in processing";
  }
}

const tailorShop = new Shop();

function saveToStorage() {
  localStorage.setItem("suits", JSON.stringify(tailorShop.shop));
}

function loadFromStorage() {
  const data = JSON.parse(localStorage.getItem("suits") || "[]");
  tailorShop.shop = data.map(d => new Suit(d));
}

function exportToExcel() {
  let csvContent = "data:text/csv;charset=utf-8,";
  const headers = Object.keys(new Suit({})).join(",");
  csvContent += headers + "\n";

  tailorShop.shop.forEach(suit => {
    const row = Object.values(suit).map(val => `"${val}"`).join(",");
    csvContent += row + "\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "suits_data.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function exportToPDF() {
  const win = window.open("", "_blank");
  win.document.write(`<html><head><title>Suits Report</title></head><body>`);
  win.document.write(`<h1>Suits Report</h1>`);
  tailorShop.shop.forEach(suit => {
    win.document.write("<div style='margin-bottom:20px;border-bottom:1px solid #ccc;padding-bottom:10px;'>");
    for (const [key, val] of Object.entries(suit)) {
      win.document.write(`<p><strong>${key}:</strong> ${val}</p>`);
    }
    win.document.write("</div>");
  });
  win.document.write(`</body></html>`);
  win.document.close();
  win.print();
}

window.addEventListener("load", () => {
  loadFromStorage();
  displaySuits();
});

document.getElementById("suitForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const suitData = {};
  formData.forEach((value, key) => {
    suitData[key] = value.trim();
  });

  suitData.status = document.querySelector("input[name='status']:checked")?.value || "in processing";

  const existing = tailorShop.shop.find(s => s.Srno === suitData.Srno);
  if (existing) {
    if (confirm("Suit with this Srno already exists. Do you want to update it?")) {
      tailorShop.updateSuit(suitData.Srno, suitData);
    }
  } else {
    const newSuit = new Suit(suitData);
    tailorShop.addSuits(newSuit);
  }
  e.target.reset();
  displaySuits();
});

function displaySuits(list = tailorShop.listAllSuits()) {
  const listDiv = document.getElementById("suitList");
  listDiv.innerHTML = "";

  list.forEach((suit, index) => {
    const div = document.createElement("div");
    div.className = "suit-item";
    div.innerHTML = `
      ${index + 1}. ${suit.name} (${suit.Srno}) - Status: ${suit.status} - Added: ${suit.Date}
      <button onclick="editSuit('${suit.Srno}')">Edit</button>
      <button onclick="deleteSuit('${suit.Srno}')">Delete</button>
      <button onclick="showDetails(tailorShop.shop.find(s => s.Srno === '${suit.Srno}'))">View</button>
    `;
    listDiv.appendChild(div);
  });
}

document.getElementById("search").addEventListener("input", (e) => {
  const q = e.target.value.trim().toLowerCase();
  const filtered = tailorShop.shop.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.Srno.toLowerCase().includes(q)
  );
  displaySuits(filtered);
});

function deleteSuit(srno) {
  if (confirm("Are you sure you want to delete this suit?")) {
    tailorShop.removeSuit(srno);
    displaySuits();
  }
}

function undoLastDelete() {
  tailorShop.undoDelete();
}

function editSuit(srno) {
  const suit = tailorShop.shop.find(s => s.Srno === srno);
  if (!suit) return;

  for (const key in suit) {
    const input = document.querySelector(`[name='${key}']`);
    if (input) {
      if (input.type === "radio") {
        input.checked = (input.value === suit[key]);
      } else {
        input.value = suit[key];
      }
    }
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showDetails(suit) {
  const modal = document.getElementById("detailModal");
  const content = document.getElementById("modalContent");

  content.innerHTML = `
    <h3>Suit Details</h3>
    ${Object.entries(suit).map(([k,v]) => `<p><strong>${k}:</strong> ${v}</p>`).join('')}
  `;

  modal.classList.add("open");
}

function closeModal() {
  document.getElementById("detailModal").classList.remove("open");
}

