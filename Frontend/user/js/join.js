// ===========================================
//   User Join by Code
// ===========================================

const API_BASE = "http://localhost:8080";


// 🔥 লগইন চেক – না থাকলে redirect সহ login-এ পাঠাও
const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
    const currentUrl = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `../login.html?redirect=${currentUrl}`;
} else if (user.role === "ADMIN") {
    window.location.href = "../admin/dashboard.html";
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


const joinForm = document.getElementById("joinForm");
const codeInput = document.getElementById("codeInput");
const joinBtn = document.getElementById("joinBtn");
const messageBox = document.getElementById("messageBox");


function showMessage(text, type = "error") {
    messageBox.textContent = text;
    messageBox.className = "message-box " + type;
    messageBox.style.display = "block";
}


joinForm.addEventListener("submit", async function (e) {

    e.preventDefault();

    const code = codeInput.value.trim().toUpperCase();

    if (!code) {
        showMessage("কোড লিখুন।");
        return;
    }

    messageBox.style.display = "none";
    joinBtn.textContent = "খোঁজা হচ্ছে...";
    joinBtn.disabled = true;

    try {

        const response = await fetch(`${API_BASE}/api/quizzes/code/${code}`);

        if (response.ok) {
            const quiz = await response.json();

            if (quiz.status !== "ACTIVE") {
                showMessage("এই কুইজটি এখন বন্ধ আছে।");
                joinBtn.textContent = "কুইজ শুরু করুন →";
                joinBtn.disabled = false;
                return;
            }

            // সঠিক কোড – quiz.html এ পাঠাও
            window.location.href = `quiz.html?id=${quiz.id}`;

        } else if (response.status === 404) {
            showMessage("এই কোডে কোনো কুইজ পাওয়া যায়নি। আবার চেক করুন।");
            joinBtn.textContent = "কুইজ শুরু করুন →";
            joinBtn.disabled = false;
        } else {
            showMessage("সার্ভারে সমস্যা হয়েছে।");
            joinBtn.textContent = "কুইজ শুরু করুন →";
            joinBtn.disabled = false;
        }

    } catch (error) {
        console.error("Error:", error);
        showMessage("সার্ভারে সংযোগ করা যাচ্ছে না।");
        joinBtn.textContent = "কুইজ শুরু করুন →";
        joinBtn.disabled = false;
    }
});


// ইনপুট auto uppercase
codeInput.addEventListener("input", function () {
    this.value = this.value.toUpperCase();
});