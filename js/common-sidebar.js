// =====================================================
// SIDEBAR
// =====================================================

import { auth } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


// =====================================================
// LOAD COMMON SIDEBAR
// =====================================================

async function loadCommonSidebar() {

    const container =
        document.getElementById("commonSidebar");

    if (!container) {
        console.error(
            "❌ #commonSidebar not found."
        );
        return;
    }

    try {

        const response =
            await fetch("./sidebar.html");

        if (!response.ok) {
            throw new Error(
                `Sidebar could not be loaded. Status: ${response.status}`
            );
        }

        const html =
            await response.text();

        container.innerHTML = html;

        initializeSidebar();

    } catch (error) {

        console.error(
            "❌ Common Sidebar Error:",
            error
        );
    }
}


// =====================================================
// INITIALIZE SIDEBAR
// =====================================================

function initializeSidebar() {

    // =================================================
    // ELEMENTS
    // =================================================

    const sidebar =
        document.getElementById("sidebar");

    const mobileMenu =
        document.getElementById("mobileMenu");

    const sidebarClose =
        document.getElementById("sidebarClose");

    const sidebarOverlay =
        document.getElementById("sidebarOverlay");


    // =================================================
    // STUDENT MANAGEMENT
    // =================================================

    const studentMenuBtn =
        document.getElementById("studentMenuBtn");

    const studentSubmenu =
        document.getElementById("studentSubmenu");


    // =================================================
    // BELT RANKING
    // =================================================

    const beltMenuBtn =
        document.getElementById("beltMenuBtn");

    const beltSubmenu =
        document.getElementById("beltSubmenu");


    // =================================================
    // ID CARD & CERTIFICATE
    // =================================================

    const idCardMenuBtn =
        document.getElementById("idCardMenuBtn");

    const idCardSubmenu =
        document.getElementById("idCardSubmenu");


    // =================================================
    // LOGOUT
    // =================================================

    const logoutBtn =
        document.getElementById("logoutBtn");


    // =================================================
    // MOBILE SIDEBAR
    // =================================================

    function openSidebar(event) {

        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        sidebar?.classList.add("open");

        sidebarOverlay?.classList.add("show");

        document.body.style.overflow = "hidden";
    }


    function closeSidebar(event) {

        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        sidebar?.classList.remove("open");

        sidebarOverlay?.classList.remove("show");

        document.body.style.overflow = "";
    }


    // =================================================
    // MOBILE MENU
    // =================================================

    if (mobileMenu) {

        mobileMenu.addEventListener(
            "click",
            openSidebar
        );
    }


    // =================================================
    // CLOSE BUTTON
    // =================================================

    if (sidebarClose) {

        sidebarClose.addEventListener(
            "click",
            closeSidebar
        );
    }


    // =================================================
    // OVERLAY
    // =================================================

    if (sidebarOverlay) {

        sidebarOverlay.addEventListener(
            "click",
            closeSidebar
        );
    }


    // =================================================
    // ESCAPE
    // =================================================

    document.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Escape") {

                closeSidebar();
            }
        }
    );


    // =================================================
    // CURRENT PAGE
    // =================================================

    let currentPage =
        window.location.pathname
            .split("/")
            .pop()
            .replace(".html", "")
            .toLowerCase()
            .trim();


    // =================================================
    // DEFAULT PAGE
    // =================================================

    if (
        !currentPage ||
        currentPage === ""
    ) {

        currentPage = "dashboard";
    }


    // =================================================
    // URL PARAMETERS
    // =================================================

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


    // =================================================
    // BELT FROM PAGE NAME
    // =================================================

    const beltPageMap = {

        "red-belt":
            "red",

        "yellow-belt":
            "yellow",

        "orange-belt":
            "orange",

        "green-belt":
            "green",

        "blue-belt":
            "blue",

        "brown-belt":
            "brown",

        "black-belt":
            "black"
    };


    if (
        !currentBelt &&
        beltPageMap[currentPage]
    ) {

        currentBelt =
            beltPageMap[currentPage];
    }


    // =================================================
    // STUDENT MANAGEMENT
    // =================================================

    if (
        studentMenuBtn &&
        studentSubmenu
    ) {

        studentMenuBtn.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                event.stopPropagation();

                studentMenuBtn.classList.toggle(
                    "open"
                );

                studentSubmenu.classList.toggle(
                    "show"
                );
            }
        );
    }


    // =================================================
    // BELT RANKING
    // =================================================

    if (
        beltMenuBtn &&
        beltSubmenu
    ) {

        beltMenuBtn.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                event.stopPropagation();

                beltMenuBtn.classList.toggle(
                    "open"
                );

                beltSubmenu.classList.toggle(
                    "show"
                );
            }
        );
    }


    // =================================================
    // ID CARD & CERTIFICATE
    // =================================================

    if (
        idCardMenuBtn &&
        idCardSubmenu
    ) {

        idCardMenuBtn.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                event.stopPropagation();

                idCardMenuBtn.classList.toggle(
                    "open"
                );

                idCardSubmenu.classList.toggle(
                    "show"
                );
            }
        );
    }


    // =================================================
    // REMOVE ACTIVE STATES
    // =================================================

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


    // =================================================
    // NORMAL MENU ACTIVE
    // =================================================

    menuItems.forEach(
        (item) => {

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


    // =================================================
    // STUDENT PAGES
    // =================================================

    const studentPages = [

        "total-students",

        "admission-list"

    ];


    if (
        studentPages.includes(
            currentPage
        )
    ) {

        studentMenuBtn?.classList.add(
            "active"
        );

        studentMenuBtn?.classList.add(
            "open"
        );

        studentSubmenu?.classList.add(
            "show"
        );
    }


    // =================================================
    // BELT PAGES
    // =================================================

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


    if (
        beltPages.includes(
            currentPage
        )
    ) {

        beltMenuBtn?.classList.add(
            "active"
        );

        beltMenuBtn?.classList.add(
            "open"
        );

        beltSubmenu?.classList.add(
            "show"
        );


        // =============================================
        // ACTIVE BELT
        // =============================================

        const beltItems =
            document.querySelectorAll(
                ".belt-submenu-item"
            );


        beltItems.forEach(
            (item) => {

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
                    belt &&
                    belt === currentBelt
                ) {

                    item.classList.add(
                        "active"
                    );
                }
            }
        );
    }


    // =================================================
    // ID CARD & CERTIFICATE PAGES
    // =================================================

    const idCardPages = [

        "id-card",

        "certificate",

        "testimonial"

    ];


    if (
        idCardPages.includes(
            currentPage
        )
    ) {

        idCardMenuBtn?.classList.add(
            "active"
        );

        idCardMenuBtn?.classList.add(
            "open"
        );

        idCardSubmenu?.classList.add(
            "show"
        );
    }


    // =================================================
    // CLOSE SIDEBAR BEFORE REAL LINK NAVIGATION
    // =================================================

    if (sidebar) {

        sidebar.addEventListener(
            "click",
            (event) => {

                const link =
                    event.target.closest("a");


                if (!link) {
                    return;
                }


                // ---------------------------------------
                // CLOSE BUTTON
                // ---------------------------------------

                if (
                    link.contains(
                        sidebarClose
                    )
                ) {

                    return;
                }


                // ---------------------------------------
                // HASH LINK
                // ---------------------------------------

                const href =
                    link.getAttribute("href");


                if (
                    !href ||
                    href === "#" ||
                    href ===
                    "javascript:void(0)"
                ) {

                    return;
                }


                // ---------------------------------------
                // MOBILE ONLY
                // ---------------------------------------

                if (
                    window.innerWidth <= 768
                ) {

                    closeSidebar();
                }
            }
        );
    }


    // =================================================
    // EXTRA CLOSE BUTTON PROTECTION
    // =================================================

    document.addEventListener(
        "click",
        (event) => {

            const closeElement =
                event.target.closest(
                    "#sidebarClose"
                );


            if (closeElement) {

                event.preventDefault();

                event.stopPropagation();

                closeSidebar();
            }
        },
        true
    );


    // =================================================
    // RESIZE
    // =================================================

    window.addEventListener(
        "resize",
        () => {

            if (
                window.innerWidth > 768
            ) {

                sidebar?.classList.remove(
                    "open"
                );

                sidebarOverlay?.classList.remove(
                    "show"
                );

                document.body.style.overflow =
                    "";
            }
        }
    );


    // =================================================
    // LOGOUT
    // =================================================

    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            async (event) => {

                event.preventDefault();

                event.stopPropagation();


                try {

                    await signOut(auth);

                    window.location.replace(
                        "admin.html"
                    );

                } catch (error) {

                    console.error(
                        "❌ Logout Error:",
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


    // =================================================
    // LOG
    // =================================================

    console.log(
        `✅ Sidebar initialized: ${currentPage}`
    );
}


// =====================================================
// AUTHENTICATION
// =====================================================

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


// =====================================================
// START
// =====================================================

loadCommonSidebar();