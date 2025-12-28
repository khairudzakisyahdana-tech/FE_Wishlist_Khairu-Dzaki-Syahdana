// ====== GLOBAL VARIABLES ======
let items = [];
const STORAGE_KEY = "MY_WISHLIST_APP";

// ====== EVENT LISTENERS ======
document.addEventListener("DOMContentLoaded", () => {
  const submitForm = document.getElementById("inputItem");
  const searchForm = document.getElementById("searchItem");
  const searchInput = document.getElementById("searchItemName");

  if (submitForm) {
    submitForm.addEventListener("submit", (event) => {
      event.preventDefault();
      addItem();
    });
  }

  if (searchForm) {
    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      searchItem();
    });
  }

  if (searchInput) {
    searchInput.addEventListener("keyup", () => {
      if (searchInput.value.trim() === "") {
        render(items);
      }
    });
  }

  loadData();
  render();
});

// ====== CRUD FUNCTIONS ======

function addItem() {
  const nameInput = document.getElementById("inputItemName");
  const priceInput = document.getElementById("inputItemPrice");
  const noteInput = document.getElementById("inputItemNote");
  const isBoughtInput = document.getElementById("inputItemIsBought");

  const name = nameInput.value.trim();
  const price = priceInput.value.trim();
  const note = noteInput.value.trim();
  const isBought = isBoughtInput.checked;

  if (!name || !price || !note) {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Semua kolom harus diisi ya!',
    });
    return;
  }

  if (isNaN(price) || parseInt(price) <= 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Harga tidak valid',
      text: 'Masukkan nominal harga yang benar.',
    });
    return;
  }

  const id = +new Date();
  const newItem = { 
    id, 
    name, 
    price: parseInt(price), 
    note, 
    isBought 
  };
  
  items.push(newItem);

  saveData();
  render();

  Swal.fire({
    icon: 'success',
    title: 'Berhasil!',
    text: `Barang "${name}" ditambahkan ke wishlist.`,
    timer: 2000,
    showConfirmButton: false
  });

  nameInput.value = "";
  priceInput.value = "";
  noteInput.value = "";
  isBoughtInput.checked = false;
}

function deleteItem(id) {
  const index = items.findIndex(s => s.id === id);
  if (index !== -1) {
    items.splice(index, 1);
    saveData();
    render();
  }
}

function toggleItem(id) {
  const item = items.find(s => s.id === id);
  if (item) {
    item.isBought = !item.isBought;
    saveData();
    render();
  }
}

function searchItem() {
  const keyword = document.getElementById("searchItemName").value.toLowerCase().trim();
  if (keyword === "") {
    render(items);
    return;
  }
  const result = items.filter(item =>
    item.name.toLowerCase().includes(keyword) ||
    item.note.toLowerCase().includes(keyword)
  );
  render(result);
}

// ====== RENDER & STORAGE ======

function render(list = items) {
  const unpurchasedList = document.getElementById("incompleteItemList");
  const purchasedList = document.getElementById("completeItemList");
  
  unpurchasedList.innerHTML = "";
  purchasedList.innerHTML = "";

  list.forEach(item => {
    const element = makeItemElement(item);
    if (item.isBought) {
      purchasedList.appendChild(element);
    } else {
      unpurchasedList.appendChild(element);
    }
  });

  if (list.length === 0 && list !== items) {
    unpurchasedList.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-magnifying-glass"></i>
        <p>Barang tidak ditemukan...</p>
      </div>`;
  } else {
    if (!unpurchasedList.hasChildNodes()) {
      unpurchasedList.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-cart-plus"></i>
          <p>Belum ada keinginan belanja</p>
        </div>`;
    }
    if (!purchasedList.hasChildNodes()) {
      purchasedList.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-bag-shopping"></i>
          <p>Belum ada barang yang dibeli</p>
        </div>`;
    }
  }

  VanillaTilt.init(document.querySelectorAll(".song_item"), {
    max: 15,
    speed: 400,
    glare: true,
    "max-glare": 0.2,
    scale: 1.02
  });
}

const formatRupiah = (number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR"
  }).format(number);
}

function makeItemElement(item) {
  const container = document.createElement("article");
  container.classList.add("song_item");

  const title = document.createElement("h3");
  title.innerText = item.name;

  const price = document.createElement("p");
  price.innerHTML = `<i class="fa-solid fa-tag"></i> ${formatRupiah(item.price)}`;
  price.style.fontWeight = "bold";
  price.style.color = "#6c5ce7";

  const note = document.createElement("p");
  note.innerHTML = `<i class="fa-solid fa-store"></i> ${item.note}`;

  const action = document.createElement("div");
  action.classList.add("action");

  const toggleBtn = document.createElement("button");
  toggleBtn.classList.add("green");
  
  if (item.isBought) {
    toggleBtn.innerHTML = '<i class="fa-solid fa-rotate-left"></i>';
    toggleBtn.setAttribute("title", "Batal Beli");
  } else {
    toggleBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
    toggleBtn.setAttribute("title", "Tandai Sudah Dibeli");
  }
  toggleBtn.addEventListener("click", () => toggleItem(item.id));

  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("red");
  deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
  deleteBtn.setAttribute("title", "Hapus Barang");
  
  deleteBtn.addEventListener("click", () => {
    Swal.fire({
      title: 'Hapus Barang?',
      text: "Yakin nggak jadi beli barang ini?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff7675',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteItem(item.id);
        Swal.fire('Terhapus!', 'Barang dihapus dari wishlist.', 'success');
      }
    });
  });

  action.append(toggleBtn, deleteBtn);
  container.append(title, price, note, action);

  return container;
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function loadData() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) items = JSON.parse(data);
}
