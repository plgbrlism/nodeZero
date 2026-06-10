// Data
let categories = [
  { id: "category1", name: "Social" },
  { id: "category2", name: "Study" },
  { id: "category3", name: "Development" },
];

let links = [
  {
    id: "1",
    name: "Reddit",
    url: "https://reddit.com",
    categoryId: "category1",
  },
  {
    id: "2",
    name: "Facebook",
    url: "https://facebook.com",
    categoryId: "category1",
  },
  {
    id: "3",
    name: "Tiktok",
    url: "https://tiktok.com",
    categoryId: "category1",
  },
  {
    id: "4",
    name: "Youtube",
    url: "https://youtube.com",
    categoryId: "category1",
  },
  {
    id: "5",
    name: "Pinterest",
    url: "https://ph.pinterest.com",
    categoryId: "category1",
  },
  {
    id: "6",
    name: "NotebookLM",
    url: "https://notebooklm.google.com",
    categoryId: "category2",
  },
  {
    id: "7",
    name: "eLms",
    url: "https://elms.sti.edu",
    categoryId: "category2",
  },
  {
    id: "8",
    name: "gDrive - cloud storage",
    url: "https://drive.google.com",
    categoryId: "category2",
  },
  {
    id: "9",
    name: "Github",
    url: "https://github.com",
    categoryId: "category3",
  },
  {
    id: "10",
    name: "Codeberg",
    url: "https://codeberg.org",
    categoryId: "category3",
  },
];

let currentCategoryId = "category1";
let isEditMode = false;
let pendingDelete = { type: null, id: null, element: null }; // Stores the link ID waiting to be deleted

// Helper
function generateId() {
  return Date.now().toString();
}

function saveData() {
  localStorage.setItem("categories", JSON.stringify(categories));
  localStorage.setItem("links", JSON.stringify(links));
}

function loadData() {
  const savedCategory = localStorage.getItem("categories");
  const savedLinks = localStorage.getItem("links");
  if (savedCategory) categories = JSON.parse(savedCategory);
  if (savedLinks) links = JSON.parse(savedLinks);
  if (
    categories.length > 0 &&
    !categories.find((c) => c.id === currentCategoryId)
  ) {
    currentCategoryId = categories[0].id;
  }
}

// Render
function render() {
  // Render category tabs (wrapped in relative divs for the delete button)
  const tabsContainer = document.getElementById("category-tabs");
  let tabsHtml = categories
    .map(
      (cat) => `
      <div class="relative shrink-0 snap-start">
          <button class="category-tab w-full whitespace-nowrap px-6 py-2 rounded-xl text-sm uppercase font-bold tracking-widest transition ${currentCategoryId === cat.id ? "bg-[#BD93F9] text-[#282A36]" : "bg-[#44475A]/50 hover:bg-[#44475A] text-[#F8F8F2]"}"
                  data-id="${cat.id}">
              ${cat.name}
          </button>
          ${
            isEditMode
              ? `
              <button class="cat-delete-btn absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#FF5555] text-white text-[10px] font-bold hover:scale-110 transition z-10"
                      data-id="${cat.id}">✕</button>
          `
              : ""
          }
      </div>
    `,
    )
    .join("");

  // Append Add Category button if in edit mode
  if (isEditMode) {
    tabsHtml += `<button id="add-cat-btn" class="flex items-center gap-2 shrink-0 whitespace-nowrap px-6 py-2 rounded-xl text-[#9ECE6A] text-sm uppercase font-bold tracking-widest hover:bg-[#9ECE6A]/20 transition">
        <span class="material-symbols-outlined text-[20px]!">add_circle</span>
        <span>Category</span>
    </button>`;
  }

  tabsContainer.innerHTML = tabsHtml;

  document.querySelectorAll(".category-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentCategoryId = btn.dataset.id;
      render();
    });
  });

  if (isEditMode) {
    document
      .getElementById("add-cat-btn")
      ?.addEventListener("click", openCatModal);
  }

  // Render links grid
  const grid = document.getElementById("app-grid");
  const filteredLinks = links.filter(
    (link) => link.categoryId === currentCategoryId,
  );

  let gridHtml = "";
  if (filteredLinks.length === 0 && !isEditMode) {
    gridHtml = `<div class="col-span-2 text-center text-[#a6adc3] py-8 text-sm">No links</div>`;
  } else {
    gridHtml = filteredLinks
      .map(
        (link) => `
      <div class="relative h-16 w-full">
        <a href="${link.url}" target="_blank" rel="noopener noreferrer"
          class="flex items-center justify-center w-full h-full bg-[#BD93F9]/10 backdrop-blur rounded-tl-2xl rounded-br-2xl rounded-tr rounded-bl px-2 text-center hover:bg-[#7AA2F7]/70 transition text-[#F8F8F2] overflow-hidden">
            <span class="text-sm font-semibold truncate">${link.name}</span>
        </a>
        ${
          isEditMode
            ? `
          <button class="delete-btn absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#FF5555] text-white text-xs font-bold hover:scale-110 transition"
                  data-id="${link.id}">✕</button>
        `
            : ""
        }
      </div>
    `,
      )
      .join("");
  }

  // Add Link button in edit mode
  if (isEditMode) {
    gridHtml += `
        <button id="add-link-btn" class="h-16 w-full flex items-center justify-center gap-2 text-[#9ECE6A] rounded-tl-2xl rounded-br-2xl rounded-tr rounded-bl text-center hover:bg-[#9ECE6A]/20 transition text-sm font-bold uppercase tracking-widest">
          <span class="material-symbols-outlined text-[20px]!">add_circle</span>
          <span>Link</span>
        </button>
    `;
  }

  grid.innerHTML = gridHtml;

  if (isEditMode) {
    document
      .getElementById("add-link-btn")
      ?.addEventListener("click", openModal);
  }

  // 1. Link Delete Buttons
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      pendingDelete = { type: "link", id: btn.dataset.id };
      document.getElementById("delete-modal").classList.remove("hidden");
    });
  });

  // 2. Category Delete Buttons
  document.querySelectorAll(".cat-delete-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation(); // Stops the click from accidentally switching the tab!
      pendingDelete = { type: "cat", id: btn.dataset.id };
      document.getElementById("delete-modal").classList.remove("hidden");
    });
  });

  // 3. Status Delete Buttons (For future plugins, currently hides the HTML element)
  document.querySelectorAll(".status-delete-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      pendingDelete = {
        type: "status",
        element: btn.closest(".status-widget"),
      };
      document.getElementById("delete-modal").classList.remove("hidden");
    });
  });
}

// === ADD LINK MODAL ===
function openModal() {
  const modal = document.getElementById("add-modal");
  document.getElementById("link-name").value = "";
  document.getElementById("link-url").value = "";
  modal.classList.remove("hidden");
  document.getElementById("link-name").focus();
}

function closeModal() {
  document.getElementById("add-modal").classList.add("hidden");
}

function savedLink() {
  const name = document.getElementById("link-name").value.trim();
  let url = document.getElementById("link-url").value.trim();

  if (!name || !url) return alert("Fill both fields");
  if (!url.startsWith("http://") && !url.startsWith("https://"))
    url = "https://" + url;

  links.push({ id: generateId(), name, url, categoryId: currentCategoryId });
  saveData();
  render();
  closeModal();
}

// === ADD CATEGORY MODAL ===
function openCatModal() {
  document.getElementById("add-cat-modal").classList.remove("hidden");
  document.getElementById("category-name").value = "";
  document.getElementById("category-name").focus();
}

function closeCatModal() {
  document.getElementById("add-cat-modal").classList.add("hidden");
}

function saveCategory() {
  const name = document.getElementById("category-name").value.trim();
  if (!name) return alert("Enter category name");

  const newId = generateId();
  categories.push({ id: newId, name });
  currentCategoryId = newId; // Auto-switch to the new tab
  saveData();
  render();
  closeCatModal();
}

// === DELETE CONFIRMATION MODAL ===
document.getElementById("confirm-delete-btn")?.addEventListener("click", () => {
  if (pendingDelete.type === "link") {
    // Delete Link
    links = links.filter((l) => l.id !== pendingDelete.id);
    saveData();
    render();
  } else if (pendingDelete.type === "cat") {
    // Delete Category AND all links inside it
    categories = categories.filter((c) => c.id !== pendingDelete.id);
    links = links.filter((l) => l.categoryId !== pendingDelete.id);
    // If you deleted the tab you were currently looking at, switch to the first available tab
    if (currentCategoryId === pendingDelete.id) {
      currentCategoryId = categories[0]?.id || null;
    }
    saveData();
    render();
  } else if (pendingDelete.type === "status") {
    // Remove the hardcoded status widget from the screen
    if (pendingDelete.element) {
      pendingDelete.element.remove();
    }
  }

  // Reset and hide
  pendingDelete = { type: null, id: null, element: null };
  document.getElementById("delete-modal").classList.add("hidden");
});

document.getElementById("cancel-delete-btn")?.addEventListener("click", () => {
  pendingDelete = { type: null, id: null, element: null };
  document.getElementById("delete-modal").classList.add("hidden");
});

// === EDIT MODE ===
function toggleEditMode() {
  isEditMode = !isEditMode;
  render();

  const track = document.getElementById("edit-btn");
  const thumb = document.getElementById("edit-thumb");

  // Grab all the static status delete buttons
  const statusDeleteBtns = document.querySelectorAll(".status-delete-btn");
  const addWidgetBtn = document.getElementById("add-widget-btn");

  if (track && thumb) {
    if (isEditMode) {
      track.classList.replace("bg-[#24283B]", "bg-[#BD93F9]");
      thumb.classList.replace("translate-x-0", "translate-x-8");
      track.classList.add("opacity-100");
      // Show status delete and add buttons for widgets
      statusDeleteBtns.forEach((btn) => btn.classList.remove("hidden"));
      if (addWidgetBtn) {
        addWidgetBtn.classList.remove("hidden");
        addWidgetBtn.classList.add("flex");
      }
    } else {
      track.classList.replace("bg-[#BD93F9]", "bg-[#24283B]");
      thumb.classList.replace("translate-x-8", "translate-x-0");
      track.classList.remove("opacity-100");
      // Hide status delete and add buttons for widgets
      statusDeleteBtns.forEach((btn) => btn.classList.add("hidden"));
      if (addWidgetBtn) {
        addWidgetBtn.classList.add("hidden");
        addWidgetBtn.classList.remove("flex");
      }
    }
  }
}

// === WIDGET PLUGIN SYSTEM (PLACEHOLDER) ===
function openWidgetSelector() {
  console.log("Widget selector triggered. Ready for plugin integration.");
  // You can replace this alert with modal logic later!
  alert("Widget plugin system coming soon!");
}

// Add the listener for the new button
document
  .getElementById("add-widget-btn")
  ?.addEventListener("click", openWidgetSelector);

// === TIME BASED GREETINGS (Manila) ===
function updateTime() {
  const now = new Date();
  const manila = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Manila" }),
  );

  let hours = manila.getHours();
  const minutes = manila.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  document.getElementById("time").textContent = `${hours}:${minutes} ${ampm}`;

  const dateOptions = { month: "short", day: "numeric", year: "numeric" };
  document.getElementById("date").textContent = manila.toLocaleDateString(
    "en-US",
    dateOptions,
  );

  const dayOptions = { weekday: "long" };
  document.getElementById("day").textContent = manila.toLocaleDateString(
    "en-US",
    dayOptions,
  );

  const hour = manila.getHours();
  let greeting = "";
  if (hour < 12) greeting = "Good morning, Paul.";
  else if (hour < 18) greeting = "Good afternoon, Paul.";
  else greeting = "Good evening, Paul.";
  document.getElementById("greeting").textContent = greeting;
}

// === SEARCH ENGINE LOGIC ===
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const searchEngineValue = document.getElementById("search-engine-value");

// Custom Dropdown Elements
const dropdownBtn = document.getElementById("dropdown-btn");
const dropdownMenu = document.getElementById("dropdown-menu");
const selectedEngineText = document.getElementById("selected-engine-text");
const engineOptions = document.querySelectorAll(".engine-option");

if (dropdownBtn && dropdownMenu) {
  // Toggle the menu open/closed when clicking the button
  dropdownBtn.addEventListener("click", (e) => {
    e.stopPropagation(); // Stops the click from immediately hiding the menu
    dropdownMenu.classList.toggle("hidden");
    dropdownMenu.classList.toggle("flex");
  });

  // Handle clicking an option inside the menu
  engineOptions.forEach((option) => {
    option.addEventListener("click", () => {
      // Update the visible text and the hidden URL value
      selectedEngineText.textContent = option.dataset.name;
      searchEngineValue.value = option.dataset.value;

      // Hide the menu
      dropdownMenu.classList.add("hidden");
      dropdownMenu.classList.remove("flex");

      // Put the typing cursor back into the search box automatically
      searchInput.focus();
    });
  });

  // Hide the menu if the user clicks anywhere else on the screen
  document.addEventListener("click", (e) => {
    if (!dropdownBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
      dropdownMenu.classList.add("hidden");
      dropdownMenu.classList.remove("flex");
    }
  });
}

// Handle the actual search
if (searchForm) {
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();

    if (query) {
      // Grab the URL from the hidden input instead of the old select tag
      const engineUrl = searchEngineValue.value;
      const finalUrl = engineUrl + encodeURIComponent(query);
      window.open(finalUrl, "_blank");
    }
  });
}

// === INIT / Starter ===
loadData();
render();
updateTime();
setInterval(updateTime, 1000);

// Listeners
document.getElementById("edit-btn")?.addEventListener("click", toggleEditMode);
document.getElementById("save-modal")?.addEventListener("click", savedLink);
document.getElementById("cancel-modal")?.addEventListener("click", closeModal);
document
  .getElementById("save-cat-modal")
  ?.addEventListener("click", saveCategory);
document
  .getElementById("cancel-cat-modal")
  ?.addEventListener("click", closeCatModal);
