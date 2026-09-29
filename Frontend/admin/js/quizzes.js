// ===========================================
//   Admin Quizzes - Full CRUD + Share
// ===========================================

const API_BASE = "http://localhost:8080";


const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
    window.location.href = "../login.html";
} else if (user.role !== "ADMIN") {
    window.location.href = "../user/dashboard.html";
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


const formCard = document.getElementById("formCard");
const formTitle = document.getElementById("formTitle");
const quizForm = document.getElementById("quizForm");
const editingId = document.getElementById("editingId");
const quizTitle = document.getElementById("quizTitle");
const quizCategory = document.getElementById("quizCategory");
const quizDescription = document.getElementById("quizDescription");
const quizTime = document.getElementById("quizTime");
const quizQuestions = document.getElementById("quizQuestions");
const quizStatus = document.getElementById("quizStatus");
const tableBody = document.getElementById("quizTableBody");
const loadingBox = document.getElementById("loadingBox");
const emptyBox = document.getElementById("emptyBox");
const countText = document.getElementById("countText");
const messageBox = document.getElementById("messageBox");

const openFormBtn = document.getElementById("openFormBtn");
const cancelBtn = document.getElementById("cancelBtn");
const saveBtn = document.getElementById("saveBtn");

// Share modal elements
const shareModal = document.getElementById("shareModal");
const shareCodeText = document.getElementById("shareCodeText");
const shareLinkText = document.getElementById("shareLinkText");
const copyCodeBtn = document.getElementById("copyCodeBtn");
const copyLinkBtn = document.getElementById("copyLinkBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const shareWhatsapp = document.getElementById("shareWhatsapp");
const shareEmail = document.getElementById("shareEmail");


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

        quizCategory.innerHTML = '<option value="">বিভাগ নির্বাচন করুন</option>';

        categories.forEach(cat => {
            const opt = document.createElement("option");
            opt.value = cat.id;
            opt.textContent = cat.name;
            quizCategory.appendChild(opt);
        });

    } catch (error) {
        console.error("Categories লোড ব্যর্থ:", error);
    }
}


async function loadQuizzes() {

    loadingBox.style.display = "flex";
    emptyBox.style.display = "none";
    tableBody.innerHTML = "";

    try {

        const response = await fetch(`${API_BASE}/api/quizzes`);
        const quizzes = await response.json();

        loadingBox.style.display = "none";

        if (quizzes.length === 0) {
            emptyBox.style.display = "block";
            countText.textContent = "০টি কুইজ";
            return;
        }

        countText.textContent = toBanglaNumber(quizzes.length) + "টি কুইজ";

        quizzes.forEach((quiz, index) => {
            const statusClass = quiz.status === "ACTIVE" ? "active" : "inactive";
            const statusText = quiz.status === "ACTIVE" ? "Active" : "Inactive";
            const categoryName = quiz.category ? quiz.category.name : "—";
            const code = quiz.quizCode || "—";

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${toBanglaNumber(index + 1)}</td>
                <td class="quiz-title">${escapeHtml(quiz.title)}</td>
                <td>${escapeHtml(categoryName)}</td>
                <td>${toBanglaNumber(quiz.timeLimit)} মিনিট</td>
                <td>${toBanglaNumber(quiz.totalQuestions)}</td>
                <td>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </td>
                <td>
                    <span class="code-badge">${escapeHtml(code)}</span>
                </td>
                <td>
                    <button class="share-btn" onclick="openShareModal('${escapeHtml(code)}', '${escapeHtml(quiz.title)}')">
                        Share
                    </button>
                    <button class="edit-btn" onclick="editQuiz(${quiz.id})">
                        Edit
                    </button>
                    <button class="delete-btn" onclick="deleteQuiz(${quiz.id}, '${escapeHtml(quiz.title)}')">
                        Delete
                    </button>
                </td>
            `;

            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Error:", error);
        loadingBox.style.display = "none";
        showMessage("কুইজ লোড করা যাচ্ছে না।", "error");
    }
}


// ============================
//  SHARE MODAL
// ============================

let currentShareCode = "";
let currentShareLink = "";

function openShareModal(code, title) {

    if (code === "—") {
        showMessage("এই কুইজের কোনো কোড নেই।", "error");
        return;
    }

    currentShareCode = code;
        currentShareLink = `${window.location.origin}/Frontend/user/join.html`;

    shareCodeText.textContent = code;
    shareLinkText.textContent = currentShareLink;

    // WhatsApp / Email লিংক
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
//  FORM
// ============================

openFormBtn.addEventListener("click", function () {
    resetForm();
    formTitle.textContent = "নতুন কুইজ যোগ করুন";
    formCard.style.display = "block";
    formCard.scrollIntoView({ behavior: "smooth", block: "center" });
    quizTitle.focus();
});

cancelBtn.addEventListener("click", function () {
    formCard.style.display = "none";
    resetForm();
});


function resetForm() {
    editingId.value = "";
    quizForm.reset();
    saveBtn.textContent = "সংরক্ষণ করুন";
    saveBtn.disabled = false;
}


quizForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const title = quizTitle.value.trim();
    const categoryId = quizCategory.value;
    const description = quizDescription.value.trim();
    const timeLimit = parseInt(quizTime.value);
    const totalQuestions = parseInt(quizQuestions.value);
    const status = quizStatus.value;

    if (!title || !categoryId || !timeLimit || !totalQuestions) {
        showMessage("সব প্রয়োজনীয় ঘর পূরণ করুন।", "error");
        return;
    }

    saveBtn.textContent = "অপেক্ষা করুন...";
    saveBtn.disabled = true;

    const isEdit = editingId.value !== "";
    const url = isEdit
        ? `${API_BASE}/api/quizzes/${editingId.value}`
        : `${API_BASE}/api/quizzes?categoryId=${categoryId}`;

    const method = isEdit ? "PUT" : "POST";

    const body = { title, description, timeLimit, totalQuestions, status };

    try {
        const response = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        if (response.ok) {
            showMessage(
                isEdit ? "কুইজ সফলভাবে হালনাগাদ হয়েছে।" : "নতুন কুইজ যোগ করা হয়েছে।",
                "success"
            );
            formCard.style.display = "none";
            resetForm();
            loadQuizzes();
        } else {
            showMessage("কিছু একটা ভুল হয়েছে।", "error");
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


async function editQuiz(id) {
    try {
        const response = await fetch(`${API_BASE}/api/quizzes/${id}`);
        const quiz = await response.json();

        editingId.value = quiz.id;
        quizTitle.value = quiz.title;
        quizDescription.value = quiz.description || "";
        quizTime.value = quiz.timeLimit;
        quizQuestions.value = quiz.totalQuestions;
        quizStatus.value = quiz.status;

        if (quiz.category) {
            quizCategory.value = quiz.category.id;
        }

        formTitle.textContent = "কুইজ সম্পাদনা করুন";
        saveBtn.textContent = "আপডেট করুন";
        formCard.style.display = "block";
        formCard.scrollIntoView({ behavior: "smooth", block: "center" });
        quizTitle.focus();

    } catch (error) {
        console.error("Error:", error);
        showMessage("কুইজের তথ্য আনা যাচ্ছে না।", "error");
    }
}


async function deleteQuiz(id, title) {
    if (!confirm(`"${title}" কুইজটি মুছে ফেলতে চান?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/quizzes/${id}`, {
            method: "DELETE"
        });

        if (response.ok) {
            showMessage("কুইজ মুছে ফেলা হয়েছে।", "success");
            loadQuizzes();
        } else {
            showMessage("কুইজ মোছা যাচ্ছে না।", "error");
        }

    } catch (error) {
        console.error("Error:", error);
        showMessage("সার্ভারে সংযোগ করা যাচ্ছে না।", "error");
    }
}


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


if (user && user.role === "ADMIN") {
    loadCategoriesIntoDropdown();
    loadQuizzes();
}