// ===========================================
//   Admin Questions - List + Filter + Edit + Delete
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
        if (confirm("আপনি কি প্রস্থান করতে চান?")) {
            localStorage.removeItem("user");
            window.location.href = "../login.html";
        }
    });
}


const filterQuiz = document.getElementById("filterQuiz");
const tableBody = document.getElementById("questionTableBody");
const loadingBox = document.getElementById("loadingBox");
const emptyBox = document.getElementById("emptyBox");
const countText = document.getElementById("countText");
const messageBox = document.getElementById("messageBox");

// Modal elements
const editModal = document.getElementById("editModal");
const editForm = document.getElementById("editForm");
const editQuestionId = document.getElementById("editQuestionId");
const editQuestionText = document.getElementById("editQuestionText");
const editOptionA = document.getElementById("editOptionA");
const editOptionB = document.getElementById("editOptionB");
const editOptionC = document.getElementById("editOptionC");
const editOptionD = document.getElementById("editOptionD");
const editCorrectAnswer = document.getElementById("editCorrectAnswer");
const modalCloseBtn = document.getElementById("modalCloseBtn");
const modalCancelBtn = document.getElementById("modalCancelBtn");
const modalSaveBtn = document.getElementById("modalSaveBtn");


function showMessage(text, type = "success") {
    messageBox.textContent = text;
    messageBox.className = "message-box " + type;
    messageBox.style.display = "block";
    setTimeout(() => {
        messageBox.style.display = "none";
    }, 3500);
}


async function loadQuizzesIntoDropdown() {
    try {
        const res = await fetch(`${API_BASE}/api/quizzes`);
        const quizzes = await res.json();

        filterQuiz.innerHTML = '<option value="">সব কুইজ</option>';

        quizzes.forEach(q => {
            const opt = document.createElement("option");
            opt.value = q.id;
            opt.textContent = q.title;
            filterQuiz.appendChild(opt);
        });

    } catch (error) {
        console.error("Quizzes লোড ব্যর্থ:", error);
    }
}


async function loadQuestions() {

    loadingBox.style.display = "flex";
    emptyBox.style.display = "none";
    tableBody.innerHTML = "";

    try {

        const selectedQuizId = filterQuiz.value;
        const url = selectedQuizId
            ? `${API_BASE}/api/questions/quiz/${selectedQuizId}`
            : `${API_BASE}/api/questions`;

        const response = await fetch(url);
        const questions = await response.json();

        loadingBox.style.display = "none";

        if (questions.length === 0) {
            emptyBox.style.display = "block";
            countText.textContent = "০টি প্রশ্ন";
            return;
        }

        countText.textContent = toBanglaNumber(questions.length) + "টি প্রশ্ন";

        questions.forEach((q, index) => {

            const quizTitle = q.quiz ? q.quiz.title : "—";
            const truncatedText = q.questionText.length > 60
                ? q.questionText.substring(0, 60) + "..."
                : q.questionText;

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${toBanglaNumber(index + 1)}</td>
                <td class="q-text">${escapeHtml(truncatedText)}</td>
                <td>${escapeHtml(quizTitle)}</td>
                <td>
                    <span class="answer-badge">${escapeHtml(q.correctAnswer)}</span>
                </td>
                <td>
                    <button class="edit-btn" onclick="openEditModal(${q.id})">
                        Edit
                    </button>
                    <button class="delete-btn" onclick="deleteQuestion(${q.id})">
                        Delete
                    </button>
                </td>
            `;

            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Error:", error);
        loadingBox.style.display = "none";
        showMessage("প্রশ্ন লোড করা যাচ্ছে না।", "error");
    }
}


filterQuiz.addEventListener("change", loadQuestions);


// ============================
//  EDIT MODAL
// ============================

async function openEditModal(id) {

    try {
        const response = await fetch(`${API_BASE}/api/questions/${id}`);
        const q = await response.json();

        editQuestionId.value = q.id;
        editQuestionText.value = q.questionText;
        editOptionA.value = q.optionA;
        editOptionB.value = q.optionB;
        editOptionC.value = q.optionC;
        editOptionD.value = q.optionD;
        editCorrectAnswer.value = q.correctAnswer;

        editModal.style.display = "flex";
        editQuestionText.focus();

    } catch (error) {
        console.error("Error:", error);
        showMessage("প্রশ্নের তথ্য আনা যাচ্ছে না।", "error");
    }
}


function closeEditModal() {
    editModal.style.display = "none";
    editForm.reset();
    editQuestionId.value = "";
    modalSaveBtn.textContent = "আপডেট করুন";
    modalSaveBtn.disabled = false;
}

modalCloseBtn.addEventListener("click", closeEditModal);
modalCancelBtn.addEventListener("click", closeEditModal);

// বাইরে ক্লিক করলে modal বন্ধ
editModal.addEventListener("click", (e) => {
    if (e.target === editModal) {
        closeEditModal();
    }
});


editForm.addEventListener("submit", async function (e) {

    e.preventDefault();

    const id = editQuestionId.value;
    const questionText = editQuestionText.value.trim();
    const a = editOptionA.value.trim();
    const b = editOptionB.value.trim();
    const c = editOptionC.value.trim();
    const d = editOptionD.value.trim();
    const correct = editCorrectAnswer.value;

    if (!questionText || !a || !b || !c || !d || !correct) {
        alert("সব ঘর পূরণ করুন।");
        return;
    }

    modalSaveBtn.textContent = "সংরক্ষণ হচ্ছে...";
    modalSaveBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE}/api/questions/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                questionText: questionText,
                optionA: a,
                optionB: b,
                optionC: c,
                optionD: d,
                correctAnswer: correct
            })
        });

        if (response.ok) {
            showMessage("প্রশ্ন সফলভাবে আপডেট হয়েছে।", "success");
            closeEditModal();
            loadQuestions();
        } else {
            showMessage("আপডেট করা যায়নি।", "error");
            modalSaveBtn.textContent = "আপডেট করুন";
            modalSaveBtn.disabled = false;
        }

    } catch (error) {
        console.error("Error:", error);
        showMessage("সার্ভারে সংযোগ করা যাচ্ছে না।", "error");
        modalSaveBtn.textContent = "আপডেট করুন";
        modalSaveBtn.disabled = false;
    }
});


// ============================
//  DELETE
// ============================

async function deleteQuestion(id) {
    if (!confirm("প্রশ্নটি মুছে ফেলতে চান?")) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/questions/${id}`, {
            method: "DELETE"
        });

        if (response.ok) {
            showMessage("প্রশ্ন মুছে ফেলা হয়েছে।", "success");
            loadQuestions();
        } else {
            showMessage("প্রশ্ন মোছা যাচ্ছে না।", "error");
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
    loadQuizzesIntoDropdown().then(() => {
        loadQuestions();
    });
}