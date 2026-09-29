// ===========================================
//   Admin Users - View List
// ===========================================

const API_BASE = "http://localhost:8080";


// ----------------
// ১. লগইন চেক
// ----------------
const currentUser = JSON.parse(localStorage.getItem("user"));

if (!currentUser) {
    window.location.href = "../login.html";
} else if (currentUser.role !== "ADMIN") {
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
// ৩. DOM
// ----------------
const tableBody = document.getElementById("userTableBody");
const loadingBox = document.getElementById("loadingBox");
const emptyBox = document.getElementById("emptyBox");
const countText = document.getElementById("countText");
const messageBox = document.getElementById("messageBox");
const filterRole = document.getElementById("filterRole");
const searchBox = document.getElementById("searchBox");

let allUsers = [];  // সব ইউজার সেভ থাকবে


// ----------------
// ৪. বার্তা
// ----------------
function showMessage(text, type = "success") {
    messageBox.textContent = text;
    messageBox.className = "message-box " + type;
    messageBox.style.display = "block";
    setTimeout(() => {
        messageBox.style.display = "none";
    }, 3500);
}


// ----------------
// ৫. সব ইউজার লোড
// ----------------
async function loadUsers() {

    loadingBox.style.display = "flex";
    emptyBox.style.display = "none";
    tableBody.innerHTML = "";

    try {

        const response = await fetch(`${API_BASE}/api/users`);
        allUsers = await response.json();

        loadingBox.style.display = "none";

        renderUsers(allUsers);

    } catch (error) {
        console.error("Error:", error);
        loadingBox.style.display = "none";
        showMessage("ব্যবহারকারীর তালিকা লোড করা যাচ্ছে না।", "error");
    }
}


// ----------------
// ৬. ইউজার রেন্ডার
// ----------------
function renderUsers(users) {

    tableBody.innerHTML = "";

    if (users.length === 0) {
        emptyBox.style.display = "block";
        countText.textContent = "০ জন ব্যবহারকারী";
        return;
    }

    countText.textContent = toBanglaNumber(users.length) + " জন ব্যবহারকারী";

    users.forEach((u, index) => {
        const roleClass = u.role === "ADMIN" ? "admin" : "user";
        const roleText = u.role === "ADMIN" ? "Admin" : "User";
        const dateStr = formatDate(u.createdAt);

        // নিজের অ্যাকাউন্ট ডিলিট করা যাবে না
        const isSelf = u.id === currentUser.id;

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${toBanglaNumber(index + 1)}</td>
            <td class="user-name">${escapeHtml(u.name)}</td>
            <td class="user-email">${escapeHtml(u.email)}</td>
            <td>
                <span class="role-badge ${roleClass}">${roleText}</span>
            </td>
            <td>${dateStr}</td>
            <td>
                <button class="delete-btn"
                        onclick="deleteUser(${u.id}, '${escapeHtml(u.name)}')"
                        ${isSelf ? 'disabled title="নিজের অ্যাকাউন্ট মোছা যাবে না"' : ''}>
                    Delete
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}


// ----------------
// ৭. ফিল্টার ও সার্চ
// ----------------
function applyFilters() {

    const role = filterRole.value;
    const search = searchBox.value.trim().toLowerCase();

    let filtered = allUsers;

    // রোল ফিল্টার
    if (role) {
        filtered = filtered.filter(u => u.role === role);
    }

    // সার্চ
    if (search) {
        filtered = filtered.filter(u =>
            u.name.toLowerCase().includes(search) ||
            u.email.toLowerCase().includes(search)
        );
    }

    renderUsers(filtered);
}

filterRole.addEventListener("change", applyFilters);
searchBox.addEventListener("input", applyFilters);


// ----------------
// ৮. ইউজার মুছে ফেলা
// ----------------
async function deleteUser(id, name) {

    if (!confirm(`"${name}"-কে মুছে ফেলতে চান?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/users/${id}`, {
            method: "DELETE"
        });

        if (response.ok) {
            showMessage("ব্যবহারকারী মুছে ফেলা হয়েছে।", "success");
            loadUsers();
        } else {
            showMessage("ব্যবহারকারী মোছা যাচ্ছে না।", "error");
        }

    } catch (error) {
        console.error("Error:", error);
        showMessage("সার্ভারে সংযোগ করা যাচ্ছে না।", "error");
    }
}


// ----------------
// ৯. হেল্পার
// ----------------
function toBanglaNumber(n) {
    const map = { 0:'০', 1:'১', 2:'২', 3:'৩', 4:'৪', 5:'৫', 6:'৬', 7:'৭', 8:'৮', 9:'৯' };
    return String(n).split("").map(d => map[d] || d).join("");
}

function escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateStr) {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    const months = ["জানু", "ফেব", "মার্চ", "এপ্রিল", "মে", "জুন",
                    "জুলাই", "আগস্ট", "সেপ্ট", "অক্টো", "নভে", "ডিসে"];
    const day = toBanglaNumber(date.getDate());
    const month = months[date.getMonth()];
    const year = toBanglaNumber(date.getFullYear());
    return `${day} ${month} ${year}`;
}


// ----------------
// ১০. শুরু
// ----------------
if (currentUser && currentUser.role === "ADMIN") {
    loadUsers();
}