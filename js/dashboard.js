import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// =========================================
// AUTH CHECK
// =========================================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.replace("admin.html");

    }

});


// =========================================
// DATE
// =========================================

const todayDate =
    document.getElementById("todayDate");


if (todayDate) {

    const today = new Date();

    todayDate.textContent =
        new Intl.DateTimeFormat(
            "en-GB",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        ).format(today);

}


// =========================================
// DASHBOARD STAT COUNTER
// =========================================

function animateCounter(element, target) {

    if (!element) return;

    target = Number(target) || 0;

    const duration = 700;

    const startTime = performance.now();


    function animate(currentTime) {

        const progress =
            Math.min(
                (currentTime - startTime) /
                duration,
                1
            );


        const current =
            Math.floor(
                progress * target
            );


        element.textContent =
            current.toLocaleString();


        if (progress < 1) {

            requestAnimationFrame(
                animate
            );

        }

    }


    requestAnimationFrame(
        animate
    );

}


// =========================================
// LOAD DASHBOARD DATA
// =========================================

async function loadDashboardStats() {

    try {

        console.log(
            "Loading dashboard statistics..."
        );


        const studentsRef =
            collection(
                db,
                "students"
            );


        const snapshot =
            await getDocs(
                studentsRef
            );


        let totalStudents = 0;

        let pendingAdmissions = 0;

        let monthlyAdmissions = 0;

        let feePaid = 0;


        // Current date

        const now =
            new Date();


        const currentYear =
            now.getFullYear();


        const currentMonth =
            now.getMonth();


        // =====================================
        // LOOP ALL STUDENTS
        // =====================================

        snapshot.forEach((docSnapshot) => {

            const student =
                docSnapshot.data();


            // =================================
            // STATUS
            // =================================

            const status =
                String(
                    student.status || ""
                ).toLowerCase();


            // =================================
            // TOTAL STUDENTS
            // =================================

            if (
                status === "approved"
            ) {

                totalStudents++;

            }


            // =================================
            // NEW ADMISSION
            // Pending approval
            // =================================

            if (
                status === "pending"
            ) {

                pendingAdmissions++;

            }


            // =================================
            // MONTHLY ADMISSION
            // =================================

            if (
                status === "approved" &&
                student.createdAt
            ) {

                const createdDate =
                    student.createdAt.toDate
                        ? student.createdAt.toDate()
                        : new Date(
                            student.createdAt
                        );


                if (
                    createdDate.getFullYear() ===
                        currentYear &&
                    createdDate.getMonth() ===
                        currentMonth
                ) {

                    monthlyAdmissions++;

                }

            }


            // =================================
            // FEE PAID
            // Future Fee Management
            // =================================

            if (
                student.feeStatus ===
                "paid"
            ) {

                feePaid++;

            }

        });


        // =====================================
        // GET DASHBOARD CARDS
        // =====================================

        const counters =
            document.querySelectorAll(
                ".stat-card h3"
            );


        // =====================================
        // TOTAL STUDENTS
        // =====================================

        if (counters[0]) {

            animateCounter(
                counters[0],
                totalStudents
            );

        }


        // =====================================
        // NEW ADMISSION
        // =====================================

        if (counters[1]) {

            animateCounter(
                counters[1],
                pendingAdmissions
            );

        }


        // =====================================
        // MONTHLY ADMISSION
        // =====================================

        if (counters[2]) {

            animateCounter(
                counters[2],
                monthlyAdmissions
            );

        }


        // =====================================
        // FEE PAID
        // =====================================

        if (counters[3]) {

            animateCounter(
                counters[3],
                feePaid
            );

        }


        console.log(
            "Dashboard Stats:",
            {
                totalStudents,
                pendingAdmissions,
                monthlyAdmissions,
                feePaid
            }
        );


    } catch (error) {

        console.error(
            "Dashboard Firebase Error:",
            error
        );

    }

}


// =========================================
// START DASHBOARD
// =========================================

loadDashboardStats();