// ===========================================
//   Admin Bulk Questions - Edit + Add
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


const bulkQuiz = document.getElementById("bulkQuiz");
const questionsContainer = document.getElementById("questionsContainer");
const addQuestionBtn = document.getElementById("addQuestionBtn");
const saveAllBtn = document.getElementById("saveAllBtn");
const messageBox = document.getElementById("messageBox");

const counterBar = document.getElementById("counterBar");
const existingBadge = document.getElementById("existingBadge");
const newBadge = document.getElementById("newBadge");


let currentQuizId = null;


function showMessage(text, type = "success") {
    messageBox.textContent = text;
    messageBox.className = "message-box " + type;
    messageBox.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (type === "success") {
        setTimeout(() => {
            messageBox.style.display = "none";
        }, 5000);
    }
}


async function loadQuizzes() {
    try {
        const res = await fetch(`${API_BASE}/api/quizzes`);
        const quizzes = await res.json();

        bulkQuiz.innerHTML = '<option value="">কুইজ নির্বাচন করুন</option>';

        quizzes.forEach(q => {
            const opt = document.createElement("option");
            opt.value = q.id;
            opt.textContent = q.title;
            bulkQuiz.appendChild(opt);
        });

    } catch (error) {
        console.error("Quizzes লোড ব্যর্থ:", error);
        showMessage("কুইজ লোড করা যাচ্ছে না।", "error");
    }
}


// ================================
//  কুইজ সিলেক্ট হলে সব প্রশ্ন লোড
// ================================
bulkQuiz.addEventListener("change", async function () {

    const quizId = this.value;

    if (!quizId) {
        currentQuizId = null;
        questionsContainer.innerHTML = "";
        counterBar.style.display = "none";
        return;
    }

    currentQuizId = quizId;

    try {
        const res = await fetch(`${API_BASE}/api/questions/quiz/${quizId}`);
        const existingQuestions = await res.json();

        questionsContainer.innerHTML = "";

        // existing প্রশ্নগুলো editable কার্ড আকারে দেখাও
        existingQuestions.forEach((q, index) => {
            createQuestionCard({
                id: q.id,
                questionText: q.questionText,
                optionA: q.optionA,
                optionB: q.optionB,
                optionC: q.optionC,
                optionD: q.optionD,
                correctAnswer: q.correctAnswer
            });
        });

        // শেষে ২টা নতুন খালি কার্ড
        createQuestionCard();
        createQuestionCard();

        updateCounter();

    } catch (error) {
        console.error("Error:", error);
        showMessage("প্রশ্ন লোড করা যাচ্ছে না।", "error");
    }
});


// ================================
//  Question Card তৈরি
// ================================
function createQuestionCard(data = null) {

    const isExisting = data && data.id;
    const cardId = Date.now() + Math.random();

    const card = document.createElement("div");
    card.className = "question-card " + (isExisting ? "existing" : "new");
    card.dataset.cardId = cardId;

    if (isExisting) {
        card.dataset.questionId = data.id;
    }

    card.innerHTML = `
        <div class="card-header">
            <span class="card-badge ${isExisting ? 'badge-existing' : 'badge-new'}">
                ${isExisting ? '📌 পুরোনো' : '✨ নতুন'}
            </span>
            <span class="card-number">প্রশ্ন <span class="q-number">?</span></span>
            <button type="button" class="remove-btn" onclick="removeQuestionCard(${cardId})">
                🗑️ মুছুন
            </button>
        </div>

        <div class="form-group">
            <label>প্রশ্ন <span class="required">*</span></label>
            <textarea class="q-text" rows="2" placeholder="প্রশ্ন লিখুন..." required>${isExisting ? escapeHtml(data.questionText) : ''}</textarea>
        </div>

        <div class="options-grid">
            <div class="form-group">
                <label>Option A <span class="required">*</span></label>
                <input type="text" class="opt-a" placeholder="প্রথম অপশন" required value="${isExisting ? escapeHtml(data.optionA) : ''}">
            </div>

            <div class="form-group">
                <label>Option B <span class="required">*</span></label>
                <input type="text" class="opt-b" placeholder="দ্বিতীয় অপশন" required value="${isExisting ? escapeHtml(data.optionB) : ''}">
            </div>

            <div class="form-group">
                <label>Option C <span class="required">*</span></label>
                <input type="text" class="opt-c" placeholder="তৃতীয় অপশন" required value="${isExisting ? escapeHtml(data.optionC) : ''}">
            </div>

            <div class="form-group">
                <label>Option D <span class="required">*</span></label>
                <input type="text" class="opt-d" placeholder="চতুর্থ অপশন" required value="${isExisting ? escapeHtml(data.optionD) : ''}">
            </div>
        </div>

        <div class="form-group">
            <label>সঠিক উত্তর <span class="required">*</span></label>
            <select class="correct-answer" required>
                <option value="">নির্বাচন করুন</option>
                <option value="A" ${isExisting && data.correctAnswer === 'A' ? 'selected' : ''}>Option A</option>
                <option value="B" ${isExisting && data.correctAnswer === 'B' ? 'selected' : ''}>Option B</option>
                <option value="C" ${isExisting && data.correctAnswer === 'C' ? 'selected' : ''}>Option C</option>
                <option value="D" ${isExisting && data.correctAnswer === 'D' ? 'selected' : ''}>Option D</option>
            </select>
        </div>
    `;

    questionsContainer.appendChild(card);
    updateCardNumbers();
    updateCounter();
}


function removeQuestionCard(cardId) {

    if (questionsContainer.children.length === 1) {
        if (!confirm("শেষ প্রশ্নটি মুছে ফেললে খালি থাকবে। তবুও মুছতে চান?")) {
            return;
        }
    }

    const card = questionsContainer.querySelector(`[data-card-id="${cardId}"]`);
    if (card) {
        // existing প্রশ্ন হলে confirm
        if (card.classList.contains("existing")) {
            if (!confirm("⚠️ এটি একটি পুরোনো প্রশ্ন। মুছে ফেললে সেভ করার পর ডাটাবেস থেকেও মুছে যাবে। আপনি কি নিশ্চিত?")) {
                return;
            }
            // মুছে ফেলার জন্য mark করো
            card.dataset.deleted = "true";
        }

        card.remove();
        updateCardNumbers();
        updateCounter();
    }
}


function updateCardNumbers() {
    const cards = questionsContainer.querySelectorAll(".question-card");

    cards.forEach((card, index) => {
        const numSpan = card.querySelector(".q-number");
        if (numSpan) {
            numSpan.textContent = toBanglaNumber(index + 1);
        }
    });
}


function updateCounter() {
    const all = questionsContainer.querySelectorAll(".question-card").length;
    const existing = questionsContainer.querySelectorAll(".question-card.existing").length;
    const newOnes = all - existing;

    if (all === 0) {
        counterBar.style.display = "none";
        return;
    }

    counterBar.style.display = "flex";
    existingBadge.textContent = toBanglaNumber(existing) + "টি পুরোনো";
    newBadge.textContent = toBanglaNumber(newOnes) + "টি নতুন";
}


addQuestionBtn.addEventListener("click", function () {
    createQuestionCard();

    const lastCard = questionsContainer.lastElementChild;
    if (lastCard) {
        setTimeout(() => {
            lastCard.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
    }
});


// ================================
//  সব কার্ড থেকে data সংগ্রহ
// ================================
function collectAllCards() {

    const cards = questionsContainer.querySelectorAll(".question-card");

    const toUpdate = [];   // existing প্রশ্ন (আপডেট)
    const toCreate = [];   // নতুন প্রশ্ন (তৈরি)
    let hasError = false;

    cards.forEach(card => {
        const qText = card.querySelector(".q-text").value.trim();
        const a = card.querySelector(".opt-a").value.trim();
        const b = card.querySelector(".opt-b").value.trim();
        const c = card.querySelector(".opt-c").value.trim();
        const d = card.querySelector(".opt-d").value.trim();
        const correct = card.querySelector(".correct-answer").value;

        if (!qText || !a || !b || !c || !d || !correct) {
            hasError = true;
            card.classList.add("has-error");
        } else {
            card.classList.remove("has-error");
        }

        const data = {
            questionText: qText,
            optionA: a,
            optionB: b,
            optionC: c,
            optionD: d,
            correctAnswer: correct
        };

        const questionId = card.dataset.questionId;
        if (questionId) {
            data.id = parseInt(questionId);
            toUpdate.push(data);
        } else {
            toCreate.push(data);
        }
    });

    return { toUpdate, toCreate, hasError };
}


// ================================
//  SAVE ALL
// ================================
saveAllBtn.addEventListener("click", async function () {

    if (!currentQuizId) {
        showMessage("প্রথমে একটি কুইজ নির্বাচন করুন।", "error");
        bulkQuiz.focus();
        return;
    }

    const { toUpdate, toCreate, hasError } = collectAllCards();

    if (toUpdate.length === 0 && toCreate.length === 0) {
        showMessage("সংরক্ষণ করার মতো কোনো প্রশ্ন নেই।", "error");
        return;
    }

    if (hasError) {
        showMessage("কিছু প্রশ্নে তথ্য অসম্পূর্ণ। লাল চিহ্নিত ঘরগুলো পূরণ করুন।", "error");
        return;
    }

    saveAllBtn.textContent = "সংরক্ষণ হচ্ছে...";
    saveAllBtn.disabled = true;

    let updatedCount = 0;
    let createdCount = 0;
    let errorCount = 0;

    try {

        // ১. existing প্রশ্নগুলো এক এক করে আপডেট করো
        for (const q of toUpdate) {
            try {
                const res = await fetch(`${API_BASE}/api/questions/${q.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        questionText: q.questionText,
                        optionA: q.optionA,
                        optionB: q.optionB,
                        optionC: q.optionC,
                        optionD: q.optionD,
                        correctAnswer: q.correctAnswer
                    })
                });
                if (res.ok) {
                    updatedCount++;
                } else {
                    errorCount++;
                }
            } catch (err) {
                console.error("Update error:", err);
                errorCount++;
            }
        }

        // ২. নতুন প্রশ্নগুলো bulk তৈরি করো
        if (toCreate.length > 0) {
            try {
                const res = await fetch(`${API_BASE}/api/questions/bulk`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        quizId: parseInt(currentQuizId),
                        questions: toCreate
                    })
                });
                const data = await res.json();
                if (data.success) {
                    createdCount = data.count;
                } else {
                    errorCount += toCreate.length;
                }
            } catch (err) {
                console.error("Create error:", err);
                errorCount += toCreate.length;
            }
        }

        // ৩. ফলাফল দেখাও
        if (errorCount === 0) {
            showMessage(
                `✅ সংরক্ষণ সম্পন্ন! ${toBanglaNumber(updatedCount)}টি আপডেট, ${toBanglaNumber(createdCount)}টি নতুন যোগ হয়েছে।`,
                "success"
            );
        } else {
            showMessage(
                `⚠️ কিছু সমস্যা হয়েছে। আপডেট: ${toBanglaNumber(updatedCount)}, নতুন: ${toBanglaNumber(createdCount)}, ত্রুটি: ${toBanglaNumber(errorCount)}।`,
                "error"
            );
        }

        // ৪. কুইজ আবার লোড করো যাতে সব ফ্রেশ আসে
        const quizId = currentQuizId;
        bulkQuiz.value = quizId;
        bulkQuiz.dispatchEvent(new Event("change"));

    } catch (error) {
        console.error("Error:", error);
        showMessage("সার্ভারে সংযোগ করা যাচ্ছে না।", "error");
    }

    saveAllBtn.textContent = "💾 সব পরিবর্তন সংরক্ষণ করুন";
    saveAllBtn.disabled = false;
});


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
    loadQuizzes();
}