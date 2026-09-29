// ===========================================
//   User Quiz Taking System
// ===========================================

const API_BASE = "http://localhost:8080";


// ----------------
// ১. লগইন চেক
// ----------------
const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
    window.location.href = "../login.html";
} else if (user.role === "ADMIN") {
    window.location.href = "../admin/dashboard.html";
}


// ----------------
// ২. URL থেকে quizId বের করো
// ----------------
const urlParams = new URLSearchParams(window.location.search);
const quizId = urlParams.get("id");

if (!quizId) {
    alert("কুইজ আইডি পাওয়া যায়নি!");
    window.location.href = "quizzes.html";
}


// ----------------
// ৩. State
// ----------------
let quiz = null;
let questions = [];
let currentIndex = 0;
let userAnswers = {};         // { questionId: "A" }
let timeLimitSeconds = 0;
let timeLeft = 0;
let timerInterval = null;
let startTime = null;
let isSubmitting = false;


// ----------------
// ৪. DOM
// ----------------
const loadingBox = document.getElementById("loadingBox");
const quizContainer = document.getElementById("quizContainer");
const quizTitle = document.getElementById("quizTitle");
const categoryBadge = document.getElementById("categoryBadge");
const timerBox = document.getElementById("timerBox");
const timerValue = document.getElementById("timerValue");
const progressText = document.getElementById("progressText");
const answeredText = document.getElementById("answeredText");
const progressFill = document.getElementById("progressFill");
const questionNumber = document.getElementById("questionNumber");
const questionText = document.getElementById("questionText");
const optionsContainer = document.getElementById("optionsContainer");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const submitBtn = document.getElementById("submitBtn");

const confirmModal = document.getElementById("confirmModal");
const confirmMessage = document.getElementById("confirmMessage");
const modalCancel = document.getElementById("modalCancel");
const modalConfirm = document.getElementById("modalConfirm");
const timeoutModal = document.getElementById("timeoutModal");


// ----------------
// ৫. কুইজ লোড
// ----------------
async function loadQuiz() {
    try {
        // কুইজ ডিটেইলস
        const quizRes = await fetch(`${API_BASE}/api/quizzes/${quizId}`);
        if (!quizRes.ok) throw new Error("কুইজ পাওয়া যায়নি");
        quiz = await quizRes.json();

        // প্রশ্নগুলো
        const questionsRes = await fetch(`${API_BASE}/api/questions/quiz/${quizId}`);
        questions = await questionsRes.json();

        if (questions.length === 0) {
            alert("এই কুইজে কোনো প্রশ্ন নেই!");
            window.location.href = "quizzes.html";
            return;
        }

        // হেডার সেট
        quizTitle.textContent = quiz.title;
        categoryBadge.textContent = quiz.category ? quiz.category.name : "সাধারণ";

        // টাইমার সেট
        timeLimitSeconds = quiz.timeLimit * 60;
        timeLeft = timeLimitSeconds;
        startTime = Date.now();

        // প্রথম প্রশ্ন দেখাও
        renderQuestion();

        // UI দেখাও
        loadingBox.style.display = "none";
        quizContainer.style.display = "block";

        // টাইমার শুরু
        startTimer();

    } catch (error) {
        console.error("Error:", error);
        loadingBox.innerHTML = `
            <div class="error-box-lg">
                <p>কুইজ লোড করা যাচ্ছে না।</p>
                <button onclick="window.location.href='quizzes.html'">ফিরে যান</button>
            </div>
        `;
    }
}


// ----------------
// ৬. প্রশ্ন রেন্ডার
// ----------------
function renderQuestion() {

    const q = questions[currentIndex];

    // প্রশ্ন নাম্বার
    questionNumber.textContent = `প্রশ্ন ${toBanglaNumber(currentIndex + 1)}`;
    questionText.textContent = q.questionText;

    // অপশন তৈরি
    const options = [
        { key: "A", text: q.optionA },
        { key: "B", text: q.optionB },
        { key: "C", text: q.optionC },
        { key: "D", text: q.optionD }
    ];

    optionsContainer.innerHTML = "";

    options.forEach(opt => {
        const selected = userAnswers[q.id] === opt.key;

        const div = document.createElement("div");
        div.className = "option-item" + (selected ? " selected" : "");

        div.innerHTML = `
            <div class="option-key">${opt.key}</div>
            <div class="option-text">${escapeHtml(opt.text)}</div>
        `;

        div.addEventListener("click", () => selectAnswer(q.id, opt.key));

        optionsContainer.appendChild(div);
    });

    // Nav buttons
    prevBtn.disabled = currentIndex === 0;
    nextBtn.textContent = currentIndex === questions.length - 1
        ? "শেষ প্রশ্ন"
        : "পরবর্তী →";
    nextBtn.disabled = currentIndex === questions.length - 1;

    updateProgress();
}


// ----------------
// ৭. উত্তর সিলেক্ট
// ----------------
function selectAnswer(questionId, answerKey) {
    userAnswers[questionId] = answerKey;

    // সব অপশন আবার রেন্ডার করো
    const optionDivs = optionsContainer.children;
    for (let i = 0; i < optionDivs.length; i++) {
        const div = optionDivs[i];
        const key = div.querySelector(".option-key").textContent;
        if (key === answerKey) {
            div.classList.add("selected");
        } else {
            div.classList.remove("selected");
        }
    }

    updateProgress();
}


// ----------------
// ৮. প্রগ্রেস আপডেট
// ----------------
function updateProgress() {
    const total = questions.length;
    const answered = Object.keys(userAnswers).length;

    progressText.textContent =
        `প্রশ্ন ${toBanglaNumber(currentIndex + 1)} / ${toBanglaNumber(total)}`;

    answeredText.textContent =
        `উত্তর দিয়েছেন ${toBanglaNumber(answered)}টি`;

    const percent = ((currentIndex + 1) / total) * 100;
    progressFill.style.width = percent + "%";
}


// ----------------
// ৯. Prev / Next
// ----------------
prevBtn.addEventListener("click", () => {
    if (currentIndex > 0) {
        currentIndex--;
        renderQuestion();
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
});

nextBtn.addEventListener("click", () => {
    if (currentIndex < questions.length - 1) {
        currentIndex++;
        renderQuestion();
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
});


// ----------------
// ১০. টাইমার
// ----------------
function startTimer() {
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        timeLeft--;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timeLeft = 0;
            updateTimerDisplay();
            handleTimeout();
            return;
        }

        // শেষ ১ মিনিটে লাল
        if (timeLeft <= 60) {
            timerBox.classList.add("warning");
        }

        updateTimerDisplay();
    }, 1000);
}

function updateTimerDisplay() {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    timerValue.textContent =
        `${pad2(toBanglaNumber(mins))}:${pad2(toBanglaNumber(secs))}`;
}

function pad2(str) {
    return str.length < 2 ? "০" + str : str;
}

function handleTimeout() {
    timeoutModal.style.display = "flex";
    setTimeout(() => {
        submitQuiz();
    }, 2000);
}


// ----------------
// ১১. Submit
// ----------------
submitBtn.addEventListener("click", () => {
    const answered = Object.keys(userAnswers).length;
    const total = questions.length;

    if (answered === 0) {
        confirmMessage.textContent =
            "আপনি এখনো কোনো প্রশ্নের উত্তর দেননি। তবুও কি জমা দিতে চান?";
    } else if (answered < total) {
        confirmMessage.textContent =
            `আপনি ${toBanglaNumber(answered)}টি প্রশ্নের উত্তর দিয়েছেন। বাকি ${toBanglaNumber(total - answered)}টি বাদ যাবে।`;
    } else {
        confirmMessage.textContent =
            "আপনি সব প্রশ্নের উত্তর দিয়েছেন। জমা দিতে প্রস্তুত?";
    }

    confirmModal.style.display = "flex";
});

modalCancel.addEventListener("click", () => {
    confirmModal.style.display = "none";
});

modalConfirm.addEventListener("click", () => {
    confirmModal.style.display = "none";
    submitQuiz();
});


// ----------------
// ১২. Submit API কল
// ----------------
async function submitQuiz() {

    if (isSubmitting) return;
    isSubmitting = true;

    clearInterval(timerInterval);

    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    // answers map বানাও (Long string)
    const answersMap = {};
    Object.keys(userAnswers).forEach(qId => {
        answersMap[qId] = userAnswers[qId];
    });

    const payload = {
        quizId: parseInt(quizId),
        userId: user.id,
        timeTaken: timeTaken,
        answers: answersMap
    };

    try {
        const response = await fetch(`${API_BASE}/api/quiz-attempts/submit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.success) {
            // Result পেজে পাঠাও – data localStorage-এ সেভ করো
            localStorage.setItem("lastResult", JSON.stringify(data.data));
            window.location.href = "result.html";
        } else {
            alert("জমা দিতে সমস্যা: " + (data.message || "অজানা ত্রুটি"));
            isSubmitting = false;
        }

    } catch (error) {
        console.error("Error:", error);
        alert("সার্ভারে সংযোগ করা যাচ্ছে না। আবার চেষ্টা করুন।");
        isSubmitting = false;
    }
}


// ----------------
// ১৩. ব্রাউজার close prevent (unsubmitted)
// ----------------
window.addEventListener("beforeunload", (e) => {
    if (!isSubmitting && quizContainer.style.display !== "none") {
        e.preventDefault();
        e.returnValue = "";
    }
});


// ----------------
// ১৪. হেল্পার
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


// ----------------
// ১৫. শুরু
// ----------------
if (user && user.role === "USER") {
    loadQuiz();
}