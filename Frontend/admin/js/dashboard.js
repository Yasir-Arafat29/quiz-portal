// ===========================================
//   Admin Dashboard - API Connection
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
} else {
    document.getElementById("welcomeText").textContent =
        "স্বাগতম, " + user.name;
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
// ৩. পরিসংখ্যান লোড
// ----------------
async function loadCounts() {

    try {

        const [catRes, quizRes, quesRes, userRes] = await Promise.all([
            fetch(`${API_BASE}/api/categories`),
            fetch(`${API_BASE}/api/quizzes`),
            fetch(`${API_BASE}/api/questions`),
            fetch(`${API_BASE}/api/users`)
        ]);

        const categories = await catRes.json();
        const quizzes = await quizRes.json();
        const questions = await quesRes.json();
        const users = await userRes.json();

        animateNumber("catCount", categories.length);
        animateNumber("quizCount", quizzes.length);
        animateNumber("quesCount", questions.length);
        animateNumber("userCount", users.length);

    } catch (error) {
        console.error("Counts লোড করতে ব্যর্থ:", error);

        document.getElementById("catCount").textContent = "০";
        document.getElementById("quizCount").textContent = "০";
        document.getElementById("quesCount").textContent = "০";
        document.getElementById("userCount").textContent = "০";
    }
}


// ----------------
// ৪. সংখ্যা animation
// ----------------
function animateNumber(id, target) {
    const el = document.getElementById(id);
    let current = 0;
    const step = Math.max(1, Math.floor(target / 20));

    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        el.textContent = toBanglaNumber(current);
    }, 40);
}


// ----------------
// ৫. হেল্পার
// ----------------
function toBanglaNumber(n) {
    const map = { 0:'০', 1:'১', 2:'২', 3:'৩', 4:'৪', 5:'৫', 6:'৬', 7:'৭', 8:'৮', 9:'৯' };
    return String(n).split("").map(d => map[d] || d).join("");
}


// ----------------
// ৬. শুরু
// ----------------
if (user && user.role === "ADMIN") {
    loadCounts();
}