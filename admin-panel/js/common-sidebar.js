import { auth } from "../../js/firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


// ========================================
// LOAD COMMON SIDEBAR
// ========================================

async function loadCommonSidebar() {

    const container =
        document.getElementById("commonSidebar");

    if (!container) {
        return;
    }

    try {

        const response =
            await fetch("./admin-panel/components/sidebar.html");

        if (!response.ok) {

            throw new Error(
                "Sidebar file could not be loaded."
            );

        }

        const html =
            await response.text();

        container.innerHTML = html;

        initializeSidebar();

    } catch (error) {

        console.error(
            "Common Sidebar Error:",
            error
        );

    }

}


// ========================================
// INITIALIZE SIDEBAR
// ========================================

function initializeSidebar() {

    const sidebar =
        document.getElementById("sidebar");

    const mobileMenu =
        document.getElementById("mobileMenu");

    const sidebarClose =
        document.getElementById("sidebarClose");

    const sidebarOverlay =
        document.getElementById("sidebarOverlay");

    const studentMenuBtn =
        document.getElementById("studentMenuBtn");

    const studentSubmenu =
        document.getElementById("studentSubmenu");

    const beltMenuBtn =
        document.getElementById("beltMenuBtn");

    const beltSubmenu =
        document.getElementById("beltSubmenu");

    const logoutBtn =
        document.getElementById("logoutBtn");


    // ====================================
    // MOBILE SIDEBAR
    // ====================================

    function openSidebar() {

        sidebar?.classList.add("open");

        sidebarOverlay?.classList.add("show");

    }


    function closeSidebar() {

        sidebar?.classList.remove("open");

        sidebarOverlay?.classList.remove("show");

    }


    mobileMenu?.addEventListener(
        "click",
        openSidebar
    );


    sidebarClose?.addEventListener(
        "click",
        closeSidebar
    );


    sidebarOverlay?.addEventListener(
        "click",
        closeSidebar
    );


    // ====================================
    // CURRENT PAGE
    // ====================================

    const currentPage =
        window.location.pathname
            .split("/")
            .pop()
            .replace(".html", "")
            .toLowerCase();


    // ====================================
    // CURRENT URL
    // ====================================

    const urlParams =
        new URLSearchParams(
            window.location.search
        );


    let currentBelt =
        String(
            urlParams.get("belt") || ""
        )
            .trim()
            .toLowerCase();


    // ====================================
    // STUDENT MANAGEMENT
    // ====================================

    studentMenuBtn?.addEventListener(
        "click",
        () => {

            studentMenuBtn.classList.toggle(
                "open"
            );

            studentSubmenu?.classList.toggle(
                "show"
            );

        }
    );


    // ====================================
    // BELT RANKING
    // ====================================

    beltMenuBtn?.addEventListener(
        "click",
        () => {

            beltMenuBtn.classList.toggle(
                "open"
            );

            beltSubmenu?.classList.toggle(
                "show"
            );

        }
    );


    // ====================================
    // REMOVE ALL ACTIVE STATES
    // ====================================

    const menuItems =
        document.querySelectorAll(
            ".menu-item[data-page], " +
            ".submenu-item[data-page]"
        );


    menuItems.forEach(
        (item) => {

            item.classList.remove(
                "active"
            );

        }
    );


    // ====================================
    // NORMAL PAGE ACTIVE
    // ====================================

    menuItems.forEach(
        (item) => {

            // Belt submenu আলাদাভাবে handle হবে
            if (
                item.classList.contains(
                    "belt-submenu-item"
                )
            ) {

                return;

            }


            const page =
                String(
                    item.dataset.page || ""
                )
                    .trim()
                    .toLowerCase();


            if (
                page === currentPage
            ) {

                item.classList.add(
                    "active"
                );

            }

        }
    );


    // ====================================
    // STUDENT MANAGEMENT
    // ACTIVE + OPEN
    // ====================================

    const studentPages = [

        "total-students",

        "admission-list"

    ];


    if (
        studentPages.includes(
            currentPage
        )
    ) {

        // Parent ACTIVE
        studentMenuBtn?.classList.add(
            "active"
        );


        // Parent OPEN
        studentMenuBtn?.classList.add(
            "open"
        );


        // Submenu OPEN
        studentSubmenu?.classList.add(
            "show"
        );

    }


    // ====================================
    // BELT PAGES
    // ====================================

    const beltPages = [

        "red-belt",

        "yellow-belt",

        "orange-belt",

        "green-belt",

        "blue-belt",

        "brown-belt",

        "black-belt",

        "belt-ranking"

    ];


    // ====================================
    // BELT RANKING ACTIVE + OPEN
    // ====================================

    if (
        beltPages.includes(
            currentPage
        )
    ) {

        // ==================================
        // PARENT ACTIVE
        // ==================================

        beltMenuBtn?.classList.add(
            "active"
        );


        // ==================================
        // PARENT OPEN
        // ==================================

        beltMenuBtn?.classList.add(
            "open"
        );


        // ==================================
        // SUBMENU OPEN
        // ==================================

        beltSubmenu?.classList.add(
            "show"
        );


        // ==================================
        // IF SEPARATE BELT PAGE IS USED
        // ==================================

        if (
            currentBelt === ""
        ) {

            if (
                currentPage === "red-belt"
            ) {

                currentBelt = "red";

            }

            else if (
                currentPage === "yellow-belt"
            ) {

                currentBelt = "yellow";

            }

            else if (
                currentPage === "orange-belt"
            ) {

                currentBelt = "orange";

            }

            else if (
                currentPage === "green-belt"
            ) {

                currentBelt = "green";

            }

            else if (
                currentPage === "blue-belt"
            ) {

                currentBelt = "blue";

            }

            else if (
                currentPage === "brown-belt"
            ) {

                currentBelt = "brown";

            }

            else if (
                currentPage === "black-belt"
            ) {

                currentBelt = "black";

            }

        }


        // ==================================
        // ACTIVE BELT SUBMENU
        // ==================================

        const beltItems =
            document.querySelectorAll(
                ".belt-submenu-item"
            );


        beltItems.forEach(
            (item) => {

                // Remove old active
                item.classList.remove(
                    "active"
                );


                const belt =
                    String(
                        item.dataset.belt || ""
                    )
                        .trim()
                        .toLowerCase();


                if (
                    belt === currentBelt
                ) {

                    item.classList.add(
                        "active"
                    );

                }

            }
        );

    }


    // ====================================
    // LOGOUT
    // ====================================

    logoutBtn?.addEventListener(
        "click",
        async () => {

            try {

                await signOut(
                    auth
                );


                window.location.replace(
                    "admin.html"
                );


            } catch (error) {

                console.error(
                    "Logout Error:",
                    error
                );


                alert(
                    "Logout failed:\n" +
                    error.message
                );

            }

        }
    );

}


// ========================================
// AUTHENTICATION
// ========================================

onAuthStateChanged(
    auth,
    (user) => {

        if (!user) {

            window.location.replace(
                "admin.html"
            );

        }

    }
);


// ========================================
// START
// ========================================

loadCommonSidebar();