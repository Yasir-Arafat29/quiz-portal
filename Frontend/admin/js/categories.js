// ===========================================
//   Admin Categories - Full CRUD
// ===========================================

const API_BASE = "http://localhost:8080";


// ----------------
// ১. লগইন চেক
// ----------------
const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
    window.location.href = "../login.html";
} else if (user.role !== "ADMIN") {
    window.location.href = "../user/dashboard.html";
}


// ----------------
// ২. লগআউট
// ----------------
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
        e.preventDefault();
        if (confirm("আপনি কি লগআউট করতে চান?")) {
            localStorage.removeItem("user");
            window.location.href = "../login.html";
        }
    });
}


// ----------------
// ৩. DOM Elements
// ----------------
const formCard = document.getElementById("formCard");
const formTitle = document.getElementById("formTitle");
const categoryForm = document.getElementById("categoryForm");
const editingId = document.getElementById("editingId");
const categoryName = document.getElementById("categoryName");
const categoryDescription = document.getElementById("categoryDescription");
const tableBody = document.getElementById("categoryTableBody");
const loadingBox = document.getElementById("loadingBox");
const emptyBox = document.getElementById("emptyBox");
const countText = document.getElementById("countText");
const messageBox = document.getElementById("messageBox");

const openFormBtn = document.getElementById("openFormBtn");
const cancelBtn = document.getElementById("cancelBtn");
const saveBtn = document.getElementById("saveBtn");


// ----------------
// ৪. ফর্ম খোলা / বন্ধ
// ----------------
openFormBtn.addEventListener("click", function () {
    resetForm();
    formTitle.textContent = "নতুন বিভাগ যোগ করুন";
    formCard.style.display = "block";
    formCard.scrollIntoView({ behavior: "smooth", block: "center" });
    categoryName.focus();
});

cancelBtn.addEventListener("click", function () {
    formCard.style.display = "none";
    resetForm();
});


// ----------------
// ৫. ফর্ম reset
// ----------------
function resetForm() {
    editingId.value = "";
    categoryForm.reset();
    saveBtn.textContent = "সংরক্ষণ করুন";
    saveBtn.disabled = false;
}


// ----------------
// ৬. বার্তা দেখানো
// ----------------
function showMessage(text, type = "success") {
    messageBox.textContent = text;
    messageBox.className = "message-box " + type;
    messageBox.style.display = "block";

    // নির্দিষ্ট সময় পরে লুকাও
    setTimeout(() => {
        messageBox.style.display = "none";
    }, 3500);
}


// ----------------
// ৭. সব বিভাগ লোড করা
// ----------------
async function loadCategories() {

    loadingBox.style.display = "flex";
    emptyBox.style.display = "none";
    tableBody.innerHTML = "";

    try {

        const response = await fetch(`${API_BASE}/api/categories`);
        const categories = await response.json();

        loadingBox.style.display = "none";

        if (categories.length === 0) {
            emptyBox.style.display = "block";
            countText.textContent = "০টি বিভাগ";
            return;
        }

        countText.textContent = toBanglaNumber(categories.length) + "টি বিভাগ";

        // প্রতিটি ক্যাটাগরি দিয়ে row বানাও
        categories.forEach((cat, index) => {
            const row = document.createElement("tr");

            row.innerHTML = `
    <td>${toBanglaNumber(index + 1)}</td>
    <td class="cat-name">${escapeHtml(cat.name)}</td>
    <td class="cat-desc">${escapeHtml(cat.description || "—")}</td>
    <td>
        <button class="edit-btn" onclick="editCategory(${cat.id})">
            Edit
        </button>
        <button class="delete-btn" onclick="deleteCategory(${cat.id}, '${escapeHtml(cat.name)}')">
            Delete
        </button>
    </td>
`;

            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Error:", error);
        loadingBox.style.display = "none";
        showMessage("বিভাগ লোড করা যাচ্ছে না। সার্ভার চালু আছে কিনা দেখুন।", "error");
    }
}


// ----------------
// ৮. ফর্ম submit – তৈরি বা আপডেট
// ----------------
categoryForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = categoryName.value.trim();
    const description = categoryDescription.value.trim();

    if (!name) {
        showMessage("বিভাগের নাম দিতে হবে।", "error");
        return;
    }

    saveBtn.textContent = "অপেক্ষা করুন...";
    saveBtn.disabled = true;

    const isEdit = editingId.value !== "";
    const url = isEdit
        ? `${API_BASE}/api/categories/${editingId.value}`
        : `${API_BASE}/api/categories`;

    const method = isEdit ? "PUT" : "POST";

    try {

        const response = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, description })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage(
                isEdit
                    ? "বিভাগ সফলভাবে হালনাগাদ হয়েছে।"
                    : "নতুন বিভাগ যোগ করা হয়েছে।",
                "success"
            );

            formCard.style.display = "none";
            resetForm();
            loadCategories();

        } else {
            showMessage(data.message || "কিছু একটা ভুল হয়েছে।", "error");
            saveBtn.textContent = "সংরক্ষণ করুন";
            saveBtn.disabled = false;
        }

    } catch (error) {
        console.error("Error:", error);
        showMessage("সার্ভারে সংযোগ করা যাচ্ছে না।", "error");
        saveBtn.textContent = "সংরক্ষণ করুন";
        saveBtn.disabled = false;
    }
});


// ----------------
// ৯. সম্পাদনা
// ----------------
async function editCategory(id) {

    try {

        const response = await fetch(`${API_BASE}/api/categories/${id}`);
        const cat = await response.json();

        editingId.value = cat.id;
        categoryName.value = cat.name;
        categoryDescription.value = cat.description || "";

        formTitle.textContent = "বিভাগ সম্পাদনা করুন";
        saveBtn.textContent = "আপডেট করুন";
        formCard.style.display = "block";
        formCard.scrollIntoView({ behavior: "smooth", block: "center" });
        categoryName.focus();

    } catch (error) {
        console.error("Error:", error);
        showMessage("বিভাগের তথ্য আনা যাচ্ছে না।", "error");
    }
}


// ----------------
// ১০. মুছে ফেলা
// ----------------
async function deleteCategory(id, name) {

    if (!confirm(`"${name}" বিভাগটি মুছে ফেলতে চান?`)) {
        return;
    }

    try {

        const response = await fetch(`${API_BASE}/api/categories/${id}`, {
            method: "DELETE"
        });

        if (response.ok) {
            showMessage("বিভাগ মুছে ফেলা হয়েছে।", "success");
            loadCategories();
        } else {
            showMessage("বিভাগ মোছা যাচ্ছে না। এতে কুইজ থাকতে পারে।", "error");
        }

    } catch (error) {
        console.error("Error:", error);
        showMessage("সার্ভারে সংযোগ করা যাচ্ছে না।", "error");
    }
}


// ----------------
// ১১. হেল্পার – ইংরেজি সংখ্যা → বাংলা সংখ্যা
// ----------------
function toBanglaNumber(n) {
    const map = { 0:'০', 1:'১', 2:'২', 3:'৩', 4:'৪', 5:'৫', 6:'৬', 7:'৭', 8:'৮', 9:'৯' };
    return String(n).split("").map(d => map[d] || d).join("");
}


// ----------------
// ১২. হেল্পার – HTML escape (XSS নিরাপত্তা)
// ----------------
function escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}


// ----------------
// ১৩. শুরু
// ----------------
if (user && user.role === "ADMIN") {
    loadCategories();
}