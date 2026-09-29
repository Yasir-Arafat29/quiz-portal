// ===========================================
//   User Dashboard - API Connection
// ===========================================

const API_BASE = "http://localhost:8080";


// ----------------
// ১. লগইন চেক
// ----------------
const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
    window.location.href = "../login.html";
} else if (user.role === "ADMIN") {
    // অ্যাডমিন ভুল করে এখানে এলে admin dashboard-এ পাঠাও
    window.location.href = "../admin/dashboard.html";
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
async function loadStats() {

    try {

        // সব কুইজ ও আমার attempt একসাথে আনো
        const [quizRes, attemptRes] = await Promise.all([
            fetch(`${API_BASE}/api/quizzes/active`),
            fetch(`${API_BASE}/api/quiz-attempts/user/${user.id}`)
        ]);

        const quizzes = await quizRes.json();
        const attempts = await attemptRes.json();

        // মোট কুইজ
        animateNumber("quizCount", quizzes.length);

        // আমার কুইজ দেওয়ার সংখ্যা
        animateNumber("attemptCount", attempts.length);

        // উত্তীর্ণ কতবার
        const passed = attempts.filter(a => a.status === "PASSED").length;
        animateNumber("passedCount", passed);

        // গড় স্কোর
        if (attempts.length > 0) {
            const totalPercent = attempts.reduce((sum, a) => sum + a.percentage, 0);
            const avg = Math.round(totalPercent / attempts.length);
            const el = document.getElementById("avgScore");
            let current = 0;
            const timer = setInterval(() => {
                current++;
                if (current >= avg) {
                    current = avg;
                    clearInterval(timer);
                }
                el.textContent = toBanglaNumber(current) + "%";
            }, 40);
        } else {
            document.getElementById("avgScore").textContent = "০%";
        }

    } catch (error) {
        console.error("Stats লোড ব্যর্থ:", error);
        document.getElementById("quizCount").textContent = "০";
        document.getElementById("attemptCount").textContent = "০";
        document.getElementById("passedCount").textContent = "০";
        document.getElementById("avgScore").textContent = "০%";
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
if (user && user.role === "USER") {
    loadStats();
}