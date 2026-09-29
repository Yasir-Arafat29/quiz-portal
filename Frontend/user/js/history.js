// ===========================================
//   User History Page
// ===========================================

const API_BASE = "http://localhost:8080";

const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
    window.location.href = "../login.html";
} else if (user.role === "ADMIN") {
    window.location.href = "../admin/dashboard.html";
}


// লগআউট
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


// DOM
const tableBody = document.getElementById("historyTableBody");
const loadingBox = document.getElementById("loadingBox");
const emptyBox = document.getElementById("emptyBox");
const countText = document.getElementById("countText");
const messageBox = document.getElementById("messageBox");
const filterStatus = document.getElementById("filterStatus");
const searchBox = document.getElementById("searchBox");

let allAttempts = [];


function showMessage(text, type = "success") {
    messageBox.textContent = text;
    messageBox.className = "message-box " + type;
    messageBox.style.display = "block";
    setTimeout(() => { messageBox.style.display = "none"; }, 3500);
}


// ইতিহাস লোড
async function loadHistory() {

    loadingBox.style.display = "flex";
    emptyBox.style.display = "none";
    tableBody.innerHTML = "";

    try {
        const res = await fetch(`${API_BASE}/api/quiz-attempts/user/${user.id}`);
        allAttempts = await res.json();

        loadingBox.style.display = "none";

        updateSummary(allAttempts);
        renderHistory(allAttempts);

    } catch (error) {
        console.error("Error:", error);
        loadingBox.style.display = "none";
        showMessage("ইতিহাস লোড করা যাচ্ছে না।", "error");
    }
}


// সারাংশ
function updateSummary(attempts) {
    document.getElementById("totalAttempts").textContent = toBanglaNumber(attempts.length);

    const passed = attempts.filter(a => a.status === "PASSED").length;
    document.getElementById("totalPassed").textContent = toBanglaNumber(passed);

    if (attempts.length > 0) {
        const avg = Math.round(
            attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length
        );
        const best = Math.round(Math.max(...attempts.map(a => a.percentage)));
        document.getElementById("avgScore").textContent = toBanglaNumber(avg) + "%";
        document.getElementById("bestScore").textContent = toBanglaNumber(best) + "%";
    } else {
        document.getElementById("avgScore").textContent = "০%";
        document.getElementById("bestScore").textContent = "০%";
    }
}


// রেন্ডার
function renderHistory(attempts) {

    tableBody.innerHTML = "";

    if (attempts.length === 0) {
        emptyBox.style.display = "block";
        countText.textContent = "০টি ফলাফল";
        return;
    }

    countText.textContent = toBanglaNumber(attempts.length) + "টি ফলাফল";

    attempts.sort((a, b) => new Date(b.attemptedAt) - new Date(a.attemptedAt));

    attempts.forEach((a, index) => {

        const quizTitle = a.quiz ? a.quiz.title : "—";
        const statusClass = a.status === "PASSED" ? "passed" : "failed";
        const statusText = a.status === "PASSED" ? "উত্তীর্ণ" : "অনুত্তীর্ণ";
        const percentage = toBanglaNumber(Math.round(a.percentage)) + "%";
        const score = toBanglaNumber(a.correct) + "/" + toBanglaNumber(a.totalQuestions);
        const date = formatDate(a.attemptedAt);

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${toBanglaNumber(index + 1)}</td>
            <td class="quiz-name">${escapeHtml(quizTitle)}</td>
            <td class="score-text">${score}</td>
            <td class="percent-text">${percentage}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td class="date-text">${date}</td>
        `;

        tableBody.appendChild(row);
    });
}


// ফিল্টার
function applyFilters() {
    const status = filterStatus.value;
    const search = searchBox.value.trim().toLowerCase();

    let filtered = allAttempts;

    if (status) filtered = filtered.filter(a => a.status === status);
    if (search) filtered = filtered.filter(a =>
        a.quiz && a.quiz.title.toLowerCase().includes(search)
    );

    renderHistory(filtered);
}

filterStatus.addEventListener("change", applyFilters);
searchBox.addEventListener("input", applyFilters);


// হেল্পার
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
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day} ${month} ${year}, ${toBanglaNumber(hours)}:${toBanglaNumber(minutes)}`;
}


// শুরু
if (user && user.role === "USER") {
    loadHistory();
}