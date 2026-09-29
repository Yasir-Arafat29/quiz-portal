// ===========================================
//   User Result Page
// ===========================================

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
const loadingBox = document.getElementById("loadingBox");
const resultCard = document.getElementById("resultCard");
const noResultBox = document.getElementById("noResultBox");


// ----------------
// ৪. localStorage থেকে result আনো
// ----------------
const resultJson = localStorage.getItem("lastResult");

if (!resultJson) {
    loadingBox.style.display = "none";
    noResultBox.style.display = "block";
} else {
    const result = JSON.parse(resultJson);
    showResult(result);
}


// ----------------
// ৫. ফলাফল দেখাও
// ----------------
function showResult(data) {

    loadingBox.style.display = "none";
    resultCard.style.display = "block";

    const percentage = Math.round(data.percentage);
    const isPassed = data.status === "PASSED";

    // হেডার
    if (isPassed) {
        document.getElementById("resultIcon").textContent = "🎉";
        document.getElementById("resultTitle").textContent = "অভিনন্দন!";
        document.getElementById("resultSubtitle").textContent =
            "আপনি সফলভাবে কুইজটি সম্পন্ন করেছেন।";
    } else {
        document.getElementById("resultIcon").textContent = "💪";
        document.getElementById("resultTitle").textContent = "চেষ্টা চালিয়ে যান!";
        document.getElementById("resultSubtitle").textContent =
            "আরেকবার চেষ্টা করলে অবশ্যই ভালো করবেন।";
    }

    // স্কোর সার্কেল
    const circle = document.getElementById("scoreCircle");
    circle.style.background =
        `conic-gradient(${isPassed ? "#10b981" : "#ef4444"} 0% ${percentage}%, #e2e8f0 ${percentage}% 100%)`;

    document.getElementById("scorePercent").textContent = toBanglaNumber(percentage) + "%";

    // details
    document.getElementById("correctCount").textContent = toBanglaNumber(data.correct);
    document.getElementById("wrongCount").textContent = toBanglaNumber(data.wrong);
    document.getElementById("skippedCount").textContent = toBanglaNumber(data.skipped);

    // কুইজের তথ্য
    document.getElementById("quizName").textContent = data.quizTitle;
    document.getElementById("totalQ").textContent = toBanglaNumber(data.totalQuestions);

    // সময়
    const mins = Math.floor(data.timeTaken / 60);
    const secs = data.timeTaken % 60;
    document.getElementById("timeTaken").textContent =
        `${toBanglaNumber(mins)} মিনিট ${toBanglaNumber(secs)} সেকেন্ড`;

    // তারিখ
    document.getElementById("attemptDate").textContent = formatDate(data.attemptedAt);

    // স্ট্যাটাস
    const statusBadge = document.getElementById("statusBadge");
    statusBadge.textContent = isPassed ? "উত্তীর্ণ" : "অনুত্তীর্ণ";
    statusBadge.className = "status-badge " + (isPassed ? "passed" : "failed");

    // পারফরম্যান্স বার
    const total = data.totalQuestions || 1;
    const correctP = Math.round((data.correct / total) * 100);
    const wrongP = Math.round((data.wrong / total) * 100);
    const skippedP = Math.round((data.skipped / total) * 100);

    setTimeout(() => {
        document.getElementById("correctBar").style.width = correctP + "%";
        document.getElementById("wrongBar").style.width = wrongP + "%";
        document.getElementById("skippedBar").style.width = skippedP + "%";
    }, 100);

    document.getElementById("correctPerfLabel").textContent =
        toBanglaNumber(data.correct) + " (" + toBanglaNumber(correctP) + "%)";
    document.getElementById("wrongPerfLabel").textContent =
        toBanglaNumber(data.wrong) + " (" + toBanglaNumber(wrongP) + "%)";
    document.getElementById("skippedPerfLabel").textContent =
        toBanglaNumber(data.skipped) + " (" + toBanglaNumber(skippedP) + "%)";

    // result দেখানোর পর localStorage থেকে মুছে ফেলো
    // যাতে রিফ্রেশ করলে "কোনো ফলাফল নেই" দেখায়
    setTimeout(() => {
        localStorage.removeItem("lastResult");
    }, 500);
}


// ----------------
// ৬. হেল্পার
// ----------------
function toBanglaNumber(n) {
    const map = { 0:'০', 1:'১', 2:'২', 3:'৩', 4:'৪', 5:'৫', 6:'৬', 7:'৭', 8:'৮', 9:'৯' };
    return String(n).split("").map(d => map[d] || d).join("");
}

function formatDate(dateStr) {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    const months = ["জানু", "ফেব", "মার্চ", "এপ্রিল", "মে", "জুন",
                    "জুলাই", "আগস্ট", "সেপ্ট", "অক্টো", "নভে", "ডিসে"];
    return `${toBanglaNumber(date.getDate())} ${months[date.getMonth()]} ${toBanglaNumber(date.getFullYear())}`;
}