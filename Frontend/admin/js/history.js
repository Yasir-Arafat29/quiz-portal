// ===========================================
//   Admin History - All Quiz Attempts
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
// ৩. DOM
// ----------------
const tableBody = document.getElementById("historyTableBody");
const loadingBox = document.getElementById("loadingBox");
const emptyBox = document.getElementById("emptyBox");
const countText = document.getElementById("countText");
const messageBox = document.getElementById("messageBox");
const filterStatus = document.getElementById("filterStatus");
const searchBox = document.getElementById("searchBox");

let allAttempts = [];


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
// ৫. সব attempt লোড
// ----------------
async function loadHistory() {

    loadingBox.style.display = "flex";
    emptyBox.style.display = "none";
    tableBody.innerHTML = "";

    try {

        const response = await fetch(`${API_BASE}/api/quiz-attempts`);
        allAttempts = await response.json();

        loadingBox.style.display = "none";

        renderHistory(allAttempts);

    } catch (error) {
        console.error("Error:", error);
        loadingBox.style.display = "none";
        showMessage("ইতিহাস লোড করা যাচ্ছে না। সার্ভার চালু আছে কিনা দেখুন।", "error");
    }
}


// ----------------
// ৬. attempt রেন্ডার
// ----------------
function renderHistory(attempts) {

    tableBody.innerHTML = "";

    if (attempts.length === 0) {
        emptyBox.style.display = "block";
        countText.textContent = "০টি ফলাফল";
        return;
    }

    countText.textContent = toBanglaNumber(attempts.length) + "টি ফলাফল";

    // নতুন থেকে পুরোনো – attemptedAt দিয়ে sort
    attempts.sort((a, b) => new Date(b.attemptedAt) - new Date(a.attemptedAt));

    attempts.forEach((a, index) => {

        const userName = a.user ? a.user.name : "—";
        const quizTitle = a.quiz ? a.quiz.title : "—";
        const statusClass = a.status === "PASSED" ? "passed" : "failed";
        const statusText = a.status === "PASSED" ? "উত্তীর্ণ" : "অনুত্তীর্ণ";

        const percentage = a.percentage !== null
            ? toBanglaNumber(Math.round(a.percentage)) + "%"
            : "—";

        const scoreText = toBanglaNumber(a.correct) + "/" + toBanglaNumber(a.totalQuestions);

        const dateStr = formatDate(a.attemptedAt);

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${toBanglaNumber(index + 1)}</td>
            <td class="user-name">${escapeHtml(userName)}</td>
            <td>${escapeHtml(quizTitle)}</td>
            <td class="score-text">${scoreText}</td>
            <td class="percentage-text">${percentage}</td>
            <td>
                <span class="status-badge ${statusClass}">${statusText}</span>
            </td>
            <td class="date-text">${dateStr}</td>
        `;

        tableBody.appendChild(row);
    });
}


// ----------------
// ৭. ফিল্টার ও সার্চ
// ----------------
function applyFilters() {

    const status = filterStatus.value;
    const search = searchBox.value.trim().toLowerCase();

    let filtered = allAttempts;

    if (status) {
        filtered = filtered.filter(a => a.status === status);
    }

    if (search) {
        filtered = filtered.filter(a => {
            const userName = a.user ? a.user.name.toLowerCase() : "";
            const quizTitle = a.quiz ? a.quiz.title.toLowerCase() : "";
            return userName.includes(search) || quizTitle.includes(search);
        });
    }

    renderHistory(filtered);
}

filterStatus.addEventListener("change", applyFilters);
searchBox.addEventListener("input", applyFilters);


// ----------------
// ৮. হেল্পার
// ----------------
function toBanglaNumber(n) {
    const map = { 0:'০', 1:'১', 2:'২', 3:'৩', 4:'৪', 5:'৫', 6:'৬', 7:'৭', 8:'৮', 9:'৯' };
    // Zero-width joiner ব্যবহার করে সংখ্যাগুলোকে একসাথে রাখা
    return String(n).split("").map(d => map[d] || d).join("\u200D");
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
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day} ${month} ${year}, ${toBanglaNumber(hours)}:${toBanglaNumber(minutes)}`;
}


// ----------------
// ৯. শুরু
// ----------------
if (user && user.role === "ADMIN") {
    loadHistory();
}