const API_URL = "https://commissionsreportapi.intruckscorp.com/generate-report";
const API_URL_TEST = "http://127.0.0.1:8000/generate-report";

let selectedAgentValue = "";

const dropdown = document.getElementById("customAgentDropdown");
const dropdownHeader = document.getElementById("dropdownHeader");
const dropdownContent = document.getElementById("dropdownContent");
const agentSearch = document.getElementById("agentSearch");
const agentList = document.getElementById("agentList");
const headerText = dropdownHeader.querySelector("span");

// Toggle Dropdown
dropdownHeader.addEventListener("click", (e) => {
  e.stopPropagation();
  dropdown.classList.toggle("active");
  if (dropdown.classList.contains("active")) {
    agentSearch.focus();
  }
});

// Close dropdown when clicking outside
window.addEventListener("click", () => {
  dropdown.classList.remove("active");
});

dropdownContent.addEventListener("click", (e) => {
  e.stopPropagation();
});

// Selection Logic
agentList.addEventListener("click", (e) => {
  const target = e.target;
  if (target.classList.contains("option")) {
    selectedAgentValue = target.getAttribute("data-value");
    headerText.innerText = target.innerText;

    // Remove selected class from others and add to current
    agentList.querySelectorAll(".option").forEach((opt) => {
      opt.classList.remove("selected");
    });
    target.classList.add("selected");

    dropdown.classList.remove("active");
    agentSearch.value = "";
    filterAgents(""); // Reset filter
  }
});

// Search Logic
agentSearch.addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase().trim();
  filterAgents(searchTerm);
});

function filterAgents(searchTerm) {
  const options = agentList.querySelectorAll(".option");
  const categories = agentList.querySelectorAll(".category");

  options.forEach((opt) => {
    const text = opt.innerText.toLowerCase();
    if (text.includes(searchTerm) || opt.getAttribute("data-value") === "") {
      opt.style.display = "block";
    } else {
      opt.style.display = "none";
    }
  });

  // Hide/Show categories
  categories.forEach((cat) => {
    let next = cat.nextElementSibling;
    let hasVisible = false;
    while (next && next.classList.contains("option")) {
      if (next.style.display !== "none") {
        hasVisible = true;
        break;
      }
      next = next.nextElementSibling;
    }
    cat.style.display = hasVisible ? "block" : "none";
  });
}

// Generate Report logic
document.getElementById("generateBtn").addEventListener("click", async () => {
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;
  const status = document.getElementById("status");
  const loaderOverlay = document.getElementById("loaderOverlay");

  if (!startDate) {
    status.innerText = "⚠️ Debes seleccionar una fecha inicial";
    status.style.color = "#e11d48";
    return;
  }

  status.innerText = "";
  loaderOverlay.classList.add("active");

  try {
    let url = `${API_URL}?date_from=${startDate}`;
    if (endDate) url += `&date_to=${endDate}`;
    if (selectedAgentValue)
      url += `&agent=${encodeURIComponent(selectedAgentValue)}`;

    const response = await fetch(url);

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text);
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `reporte_comisiones_${startDate}${endDate ? "_" + endDate : ""}${selectedAgentValue ? "_" + selectedAgentValue : ""}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(downloadUrl);

    status.innerText = "✅ Reporte descargado correctamente";
    status.style.color = "#059669";
  } catch (error) {
    console.error(error);
    status.innerText = "❌ Error generando el reporte";
    status.style.color = "#e11d48";
  } finally {
    loaderOverlay.classList.remove("active");
  }
});

// Dynamic Agent Management Logic
const agentModal = document.getElementById("agentModal");
const newAgentNameInput = document.getElementById("newAgentName");
const saveAgentBtn = document.getElementById("saveAgentBtn");
const cancelAddBtn = document.getElementById("cancelAddBtn");

document.getElementById("addAgentBtn").addEventListener("click", () => {
  agentModal.classList.add("active");
  newAgentNameInput.value = "";
  newAgentNameInput.focus();
});

cancelAddBtn.addEventListener("click", () => {
  agentModal.classList.remove("active");
});

saveAgentBtn.addEventListener("click", () => {
  const name = newAgentNameInput.value.trim().toUpperCase();
  const selectedTeam = document.querySelector(
    'input[name="agentTeam"]:checked',
  ).value;

  if (!name) {
    alert("Por favor, ingrese el nombre del agente.");
    return;
  }

  // Create new option element
  const li = document.createElement("li");
  li.className = "option";
  li.setAttribute("data-value", name);
  li.innerText = name;

  // Find the category header
  const categories = Array.from(agentList.querySelectorAll(".category"));
  const targetCategory = categories.find(
    (cat) => cat.innerText === selectedTeam,
  );

  if (targetCategory) {
    // Find the last item in this category to insert after it
    let insertAfter = targetCategory;
    let next = targetCategory.nextElementSibling;
    while (next && next.classList.contains("option")) {
      insertAfter = next;
      next = next.nextElementSibling;
    }
    insertAfter.after(li);
  } else {
    // Fallback: just append if category not found (shouldn't happen)
    agentList.appendChild(li);
  }

  // Auto-select the new agent
  li.click();
  agentModal.classList.remove("active");
  alert(`Agente "${name}" agregado a ${selectedTeam}.`);
});

document.getElementById("removeAgentBtn").addEventListener("click", () => {
  if (!selectedAgentValue) {
    alert("No se puede eliminar la opción predeterminada.");
    return;
  }

  if (
    confirm(
      `¿Está seguro de que desea eliminar al agente "${selectedAgentValue}"?`,
    )
  ) {
    const selectedLi = agentList.querySelector(
      `.option[data-value="${selectedAgentValue}"]`,
    );
    if (selectedLi) {
      selectedLi.remove();
      // Reset selection
      const defaultValue = agentList.querySelector('.option[data-value=""]');
      if (defaultValue) defaultValue.click();
    }
  }
});

// Close modal when clicking outside content
agentModal.addEventListener("click", (e) => {
  if (e.target === agentModal) {
    agentModal.classList.remove("active");
  }
});
