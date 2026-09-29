// ===========================================
//   User Quizzes - Browse, Share & Start
// ===========================================

const API_BASE = "http://localhost:8080";


const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
    window.location.href = "../login.html";
} else if (user.role === "ADMIN") {
    window.location.href = "../admin/dashboard.html";
}


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


const quizGrid = document.getElementById("quizGrid");
const loadingBox = document.getElementById("loadingBox");
const emptyBox = document.getElementById("emptyBox");
const messageBox = document.getElementById("messageBox");
const filterCategory = document.getElementById("filterCategory");
const searchBox = document.getElementById("searchBox");

// Share modal
const shareModal = document.getElementById("shareModal");
const shareCodeText = document.getElementById("shareCodeText");
const shareLinkText = document.getElementById("shareLinkText");
const copyCodeBtn = document.getElementById("copyCodeBtn");
const copyLinkBtn = document.getElementById("copyLinkBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const shareWhatsapp = document.getElementById("shareWhatsapp");
const shareEmail = document.getElementById("shareEmail");

let allQuizzes = [];


function showMessage(text, type = "success") {
    messageBox.textContent = text;
    messageBox.className = "message-box " + type;
    messageBox.style.display = "block";
    setTimeout(() => {
        messageBox.style.display = "none";
    }, 3500);
}


async function loadCategoriesIntoDropdown() {
    try {
        const res = await fetch(`${API_BASE}/api/categories`);
        const categories = await res.json();

        filterCategory.innerHTML = '<option value="">সব বিভাগ</option>';

        categories.forEach(cat => {
            const opt = document.createElement("option");
            opt.value = cat.id;
            opt.textContent = cat.name;
            filterCategory.appendChild(opt);
        });

    } catch (error) {
        console.error("Categories লোড ব্যর্থ:", error);
    }
}


async function loadQuizzes() {

    loadingBox.style.display = "flex";
    emptyBox.style.display = "none";
    quizGrid.innerHTML = "";

    try {

        const response = await fetch(`${API_BASE}/api/quizzes/active`);
        allQuizzes = await response.json();

        loadingBox.style.display = "none";

        renderQuizzes(allQuizzes);

    } catch (error) {
        console.error("Error:", error);
        loadingBox.style.display = "none";
        showMessage("কুইজ লোড করা যাচ্ছে না। সার্ভার চালু আছে কিনা দেখুন।", "error");
    }
}


function renderQuizzes(quizzes) {

    quizGrid.innerHTML = "";

    if (quizzes.length === 0) {
        emptyBox.style.display = "block";
        return;
    }

    emptyBox.style.display = "none";

    quizzes.forEach(quiz => {

        const categoryName = quiz.category ? quiz.category.name : "—";
        const description = quiz.description || "কোনো বিবরণ নেই।";
        const code = quiz.quizCode || "";

        const card = document.createElement("div");
        card.className = "quiz-card";

        card.innerHTML = `
            <div class="quiz-card-header">
                <h3>${escapeHtml(quiz.title)}</h3>
                <span class="category-badge">${escapeHtml(categoryName)}</span>
            </div>

            <p class="quiz-description">${escapeHtml(description)}</p>

            <div class="quiz-meta">
                <span class="meta-item">
                    <span class="meta-icon">⏱️</span>
                    <span>${toBanglaNumber(quiz.timeLimit)} মিনিট</span>
                </span>
                <span class="meta-item">
                    <span class="meta-icon">📝</span>
                    <span>${toBanglaNumber(quiz.totalQuestions)}টি প্রশ্ন</span>
                </span>
            </div>

            <div class="quiz-card-footer">
                <button class="share-icon-btn"
                        onclick="openShareModal('${escapeHtml(code)}', '${escapeHtml(quiz.title)}')"
                        title="শেয়ার করুন">
                    🔗
                </button>
                <a href="quiz.html?id=${quiz.id}" class="start-btn">
                    কুইজ শুরু করুন →
                </a>
            </div>
        `;

        quizGrid.appendChild(card);
    });
}


// ============================
//  SHARE MODAL
// ============================

let currentShareCode = "";
let currentShareLink = "";

function openShareModal(code, title) {

    if (!code) {
        showMessage("এই কুইজের কোনো শেয়ার কোড নেই।", "error");
        return;
    }

    currentShareCode = code;
        currentShareLink = `${window.location.origin}/Frontend/user/join.html`;

    shareCodeText.textContent = code;
    shareLinkText.textContent = currentShareLink;

    const msg = encodeURIComponent(`আমার কুইজে যোগ দিন! কোড: ${code}\n${currentShareLink}`);
    shareWhatsapp.href = `https://wa.me/?text=${msg}`;
    shareEmail.href = `mailto:?subject=${encodeURIComponent(title)}&body=${msg}`;

    shareModal.style.display = "flex";
}

closeModalBtn.addEventListener("click", () => {
    shareModal.style.display = "none";
});

shareModal.addEventListener("click", (e) => {
    if (e.target === shareModal) {
        shareModal.style.display = "none";
    }
});

copyCodeBtn.addEventListener("click", () => {
    copyToClipboard(currentShareCode);
    copyCodeBtn.textContent = "✓ কপি হয়েছে";
    setTimeout(() => { copyCodeBtn.textContent = "📋 কপি"; }, 2000);
});

copyLinkBtn.addEventListener("click", () => {
    copyToClipboard(currentShareLink);
    copyLinkBtn.textContent = "✓ কপি হয়েছে";
    setTimeout(() => { copyLinkBtn.textContent = "📋 কপি"; }, 2000);
});


function copyToClipboard(text) {
    navigator.clipboard.writeText(text).catch(() => {
        const el = document.createElement("textarea");
        el.value = text;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
    });
}


// ============================
//  FILTER & SEARCH
// ============================

function applyFilters() {

    const categoryId = filterCategory.value;
    const search = searchBox.value.trim().toLowerCase();

    let filtered = allQuizzes;

    if (categoryId) {
        filtered = filtered.filter(q =>
            q.category && String(q.category.id) === String(categoryId)
        );
    }

    if (search) {
        filtered = filtered.filter(q =>
            q.title.toLowerCase().includes(search)
        );
    }

    renderQuizzes(filtered);
}

filterCategory.addEventListener("change", applyFilters);
searchBox.addEventListener("input", applyFilters);


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


if (user && user.role === "USER") {
    loadCategoriesIntoDropdown();
    loadQuizzes();
}