import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


const loginForm = document.getElementById("loginForm");

const loginMessage = document.getElementById("loginMessage");


loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;


    loginMessage.textContent = "Login হচ্ছে...";


    try {

        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        loginMessage.style.color = "#198754";

        loginMessage.textContent =
            "Login successful!";


        // পরে এখানে dashboard-এ পাঠাবো
        setTimeout(() => {

            window.location.href = "dashboard.html";

        }, 800);


    } catch (error) {

    console.log("Firebase Error Code:", error.code);
    console.log("Firebase Error Message:", error.message);

    loginMessage.style.color = "#c51a30";

    loginMessage.textContent = error.code;

}

});

// =========================
// Show / Hide Password
// =========================

const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");

togglePassword.addEventListener("click", () => {

    if (passwordInput.type === "password") {

        passwordInput.type = "text";

        togglePassword.innerHTML =
        '<i class="fa-regular fa-eye-slash"></i>';
        
    } else {
        
        passwordInput.type = "password";
        
        togglePassword.innerHTML =
        '<i class="fa-regular fa-eye"></i>';
    }

});