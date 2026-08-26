import { auth, db } from "./firebase.js";

import {
    collection,
    doc,
    getDocs,
    serverTimestamp,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


// =====================================================
// ELEMENTS
// =====================================================

const tableBody =
    document.getElementById("studentTableBody");

const loadingState =
    document.getElementById("loadingState");

const emptyState =
    document.getElementById("emptyState");

const tableStatus =
    document.getElementById("tableStatus");

const searchInput =
    document.getElementById("searchInput");

const refreshBtn =
    document.getElementById("refreshBtn");

const backfillBeltBtn =
    document.getElementById("backfillBeltBtn");

const totalCount =
    document.getElementById("totalCount");

const approvedCount =
    document.getElementById("approvedCount");

const activeCount =
    document.getElementById("activeCount");

const canceledCount =
    document.getElementById("canceledCount");


// =====================================================
// MODAL
// =====================================================

const studentModal =
    document.getElementById("studentModal");

const modalClose =
    document.getElementById("modalClose");

const modalPhoto =
    document.getElementById("modalStudentPhoto");

const photoPlaceholder =
    document.querySelector(".modal-photo-placeholder");


// =====================================================
// DATA
// =====================================================

let allStudents = [];
let currentStudent = null;
let canceledStudentsCount = 0;


// =====================================================
// AUTH
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
// LOAD STUDENTS
// =====================================================

async function loadStudents() {

    try {

        showLoading();

        console.log(
            "Loading approved students..."
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

        console.log(
            "Students found:",
            snapshot.size
        );


        // =================================================
        // ALL STUDENTS
        // =================================================

        allStudents =
            snapshot.docs.map(
                (document) => {

                    return {
                        id: document.id,
                        ...document.data()
                    };

                }
            );


        // =================================================
        // CANCELED STUDENT COUNT
        // =================================================

        canceledStudentsCount =
            snapshot.docs.filter(
                (document) => {

                    const data =
                        document.data();

                    return (
                        String(
                            data.status || ""
                        ).toLowerCase() ===
                        "canceled"
                    );

                }
            ).length;


        // =================================================
        // ONLY APPROVED STUDENTS
        // =================================================

        allStudents =
            allStudents.filter(
                (student) => {

                    return (
                        String(
                            student.status || ""
                        ).toLowerCase() ===
                        "approved"
                    );

                }
            );


        // =================================================
        // SORT
        // KWKMA-1
        // KWKMA-2
        // KWKMA-3
        // =================================================

        allStudents.sort(
            (a, b) => {

                return (
                    getRegistrationNumber(
                        a.registrationNo
                    ) -
                    getRegistrationNumber(
                        b.registrationNo
                    )
                );

            }
        );


        updateCounts();

        renderStudents(
            allStudents
        );


    } catch (error) {

        console.error(
            "Student Load Error:",
            error
        );

        if (loadingState) {

            loadingState.classList.add(
                "hidden"
            );

        }

        if (tableStatus) {

            tableStatus.textContent =
                "Failed to load students.";

        }

        alert(
            "Could not load students:\n" +
            error.message
        );

    }

}


// =====================================================
// GET REGISTRATION NUMBER
// =====================================================

function getRegistrationNumber(
    registrationNo
) {

    if (!registrationNo) {

        return Number.MAX_SAFE_INTEGER;

    }

    const value =
        String(
            registrationNo
        )
            .trim()
            .match(
                /(\d+)\s*$/
            );

    if (!value) {

        return Number.MAX_SAFE_INTEGER;

    }

    return Number(
        value[1]
    );

}


// =====================================================
// RENDER STUDENTS
// =====================================================

function renderStudents(
    students
) {

    if (tableBody) {

        tableBody.innerHTML = "";

    }

    if (loadingState) {

        loadingState.classList.add(
            "hidden"
        );

    }


    // =================================================
    // SORT
    // =================================================

    const sortedStudents =
        [...students].sort(
            (a, b) => {

                return (
                    getRegistrationNumber(
                        a.registrationNo
                    ) -
                    getRegistrationNumber(
                        b.registrationNo
                    )
                );

            }
        );


    // =================================================
    // EMPTY
    // =================================================

    if (!sortedStudents.length) {

        if (emptyState) {

            emptyState.classList.remove(
                "hidden"
            );

        }

        if (tableStatus) {

            tableStatus.textContent =
                "No approved students.";

        }

        return;

    }


    if (emptyState) {

        emptyState.classList.add(
            "hidden"
        );

    }


    if (tableStatus) {

        tableStatus.textContent =
            `${sortedStudents.length} approved student(s)`;

    }


    // =================================================
    // CREATE ROW
    // =================================================

    sortedStudents.forEach(
        (student) => {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>

                    <button
                        type="button"
                        class="registration-link"
                        data-id="${escapeHTML(
                            student.id
                        )}"
                    >

                        ${escapeHTML(
                            student.registrationNo || "-"
                        )}

                    </button>

                </td>


                <td>

                    ${escapeHTML(
                        student.name || "-"
                    )}

                </td>


                <td>

                    ${escapeHTML(
                        student.fatherName || "-"
                    )}

                </td>


                <td>

                    ${escapeHTML(
                        student.motherName || "-"
                    )}

                </td>


                <td>

                    ${escapeHTML(
                        student.sex || "-"
                    )}

                </td>


                <td>

                    ${escapeHTML(
                        student.dob || "-"
                    )}

                </td>


                <td>

                    ${escapeHTML(
                        student.mobile || "-"
                    )}

                </td>


                <td>

                    ${formatDate(
                        student.statusUpdatedAt
                    )}

                </td>


                <td>

                    <span class="status-badge">

                        ✓ APPROVED

                    </span>

                </td>


                <td>

                    <button
                        type="button"
                        class="cancel-btn"
                        data-id="${escapeHTML(
                            student.id
                        )}"
                    >

                        Cancel

                    </button>

                </td>

            `;


            if (tableBody) {

                tableBody.appendChild(
                    row
                );

            }

        }
    );

}


// =====================================================
// UPDATE COUNTS
// =====================================================

function updateCounts() {

    // =================================================
    // APPROVED STUDENTS
    // =================================================

    const approved =
        allStudents.filter(
            (student) =>
                String(
                    student.status || ""
                ).toLowerCase() ===
                "approved"
        ).length;


    // =================================================
    // ACTIVE STUDENTS
    // =================================================

    const active =
        approved;


    // =================================================
    // TOTAL
    // =================================================

    if (totalCount) {

        totalCount.textContent =
            approved;

    }


    // =================================================
    // APPROVED
    // =================================================

    if (approvedCount) {

        approvedCount.textContent =
            approved;

    }


    // =================================================
    // ACTIVE
    // =================================================

    if (activeCount) {

        activeCount.textContent =
            active;

    }


    // =================================================
    // CANCELED
    // =================================================

    if (canceledCount) {

        canceledCount.textContent =
            canceledStudentsCount;

    }

}


// =====================================================
// TABLE CLICK
// =====================================================

if (tableBody) {

    tableBody.addEventListener(
        "click",
        (event) => {

            // =================================================
            // REGISTRATION CLICK
            // =================================================

            const registrationButton =
                event.target.closest(
                    ".registration-link"
                );


            if (registrationButton) {

                const studentId =
                    registrationButton.dataset.id;


                const student =
                    allStudents.find(
                        (item) =>
                            item.id ===
                            studentId
                    );


                if (student) {

                    openStudentModal(
                        student
                    );

                }

                return;

            }


            // =================================================
            // CANCEL CLICK
            // =================================================

            const cancelButton =
                event.target.closest(
                    ".cancel-btn"
                );


            if (cancelButton) {

                cancelStudent(
                    cancelButton.dataset.id,
                    cancelButton
                );

            }

        }
    );

}


// =====================================================
// CANCEL STUDENT
// =====================================================

async function cancelStudent(
    studentId,
    cancelButton
) {

    const student =
        allStudents.find(
            (item) =>
                item.id ===
                studentId
        );


    if (!student) {

        return;

    }


    const confirmCancel =
        confirm(
            `Are you sure you want to cancel ${student.registrationNo}?`
        );


    if (!confirmCancel) {

        return;

    }


    try {

        cancelButton.disabled =
            true;

        cancelButton.textContent =
            "Canceling...";


        const studentRef =
            doc(
                db,
                "students",
                studentId
            );


        await updateDoc(
            studentRef,
            {
                status: "canceled",
                statusUpdatedAt:
                    serverTimestamp()
            }
        );


        alert(
            `${student.registrationNo} has been canceled.`
        );


        await loadStudents();


    } catch (error) {

        console.error(
            "Cancel Student Error:",
            error
        );


        alert(
            "Failed to cancel student:\n" +
            error.message
        );


        cancelButton.disabled =
            false;

        cancelButton.textContent =
            "Cancel";

    }

}


// =====================================================
// OPEN MODAL
// =====================================================

function openStudentModal(
    student
) {

    currentStudent =
        student;


    // =================================================
    // BASIC INFORMATION
    // =================================================

    setModalText(
        "modalRegistrationNo",
        student.registrationNo
    );

    setModalText(
        "modalStudentName",
        student.name
    );

    setModalText(
        "modalFatherName",
        student.fatherName
    );

    setModalText(
        "modalMotherName",
        student.motherName
    );

    setModalText(
        "modalGender",
        student.sex
    );

    setModalText(
        "modalDob",
        student.dob
    );

    setModalText(
        "modalBlood",
        student.bloodGroup
    );

    setModalText(
        "modalReligion",
        student.religion
    );

    setModalText(
        "modalNationality",
        student.nationality
    );

    setModalText(
        "modalMobile",
        student.mobile
    );

    setModalText(
        "modalEmail",
        student.email
    );

    setModalText(
        "modalEducation",
        student.education
    );

    setModalText(
        "modalOccupation",
        student.occupation
    );


    // =================================================
    // CURRENT BELT
    // =================================================

    setModalText(
        "modalCurrentBelt",
        student.belt
    );

    setModalText(
        "modalBeltDisplay",
        student.belt
    );


    // =================================================
    // ADDRESS
    // =================================================

    setModalText(
        "modalPresentAddress",
        student.presentAddress
    );

    setModalText(
        "modalPermanentAddress",
        student.permanentAddress
    );


    // =================================================
    // MARTIAL ARTS
    // =================================================

    setModalText(
        "modalExperience",
        student.previousMartialArtsExperience
    );

    setModalText(
        "modalBelt",
        student.previousBeltRank
    );

    setModalText(
        "modalTraining",
        Array.isArray(student.training)
            ? student.training.join(", ")
            : student.training
    );

    setModalText(
        "modalContribution",
        student.contribution
    );


    // =================================================
    // STATUS
    // =================================================

    const statusElement =
        document.getElementById(
            "modalStatus"
        );


    if (statusElement) {

        statusElement.textContent =
            "APPROVED";

        statusElement.className =
            "modal-status approved";

    }


    // =================================================
    // PHOTO
    // =================================================

    if (modalPhoto) {

        modalPhoto.style.display =
            "none";

        modalPhoto.removeAttribute(
            "src"
        );


        const photoURL =
            student.photoURL ||
            student.photoUrl ||
            student.photo ||
            student.imageURL ||
            student.imageUrl ||
            "";


        if (photoURL) {

            modalPhoto.src =
                photoURL;


            modalPhoto.onload =
                () => {

                    modalPhoto.style.display =
                        "block";


                    if (photoPlaceholder) {

                        photoPlaceholder.style.display =
                            "none";

                    }

                };


            modalPhoto.onerror =
                () => {

                    modalPhoto.style.display =
                        "none";


                    if (photoPlaceholder) {

                        photoPlaceholder.style.display =
                            "flex";

                    }

                };


        } else {

            if (photoPlaceholder) {

                photoPlaceholder.style.display =
                    "flex";

            }

        }

    }


    // =================================================
    // SHOW MODAL
    // =================================================

    if (studentModal) {

        studentModal.classList.remove(
            "hidden"
        );

    }


    document.body.style.overflow =
        "hidden";

}


// =====================================================
// CLOSE MODAL
// =====================================================

function closeStudentModal() {

    if (studentModal) {

        studentModal.classList.add(
            "hidden"
        );

    }


    document.body.style.overflow =
        "";


    currentStudent =
        null;

}


// =====================================================
// MODAL CLOSE
// =====================================================

if (modalClose) {

    modalClose.addEventListener(
        "click",
        (event) => {

            event.preventDefault();
            event.stopPropagation();

            closeStudentModal();

        }
    );

}


// =====================================================
// CLICK OUTSIDE MODAL
// =====================================================

if (studentModal) {

    studentModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                studentModal
            ) {

                closeStudentModal();

            }

        }
    );

}


// =====================================================
// ESC
// =====================================================

document.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Escape") {

            closeStudentModal();

        }

    }
);


// =====================================================
// SEARCH
// =====================================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        () => {

            const search =
                searchInput.value
                    .trim()
                    .toLowerCase();


            if (!search) {

                renderStudents(
                    allStudents
                );

                return;

            }


            const filtered =
                allStudents.filter(
                    (student) => {

                        const registration =
                            String(
                                student.registrationNo || ""
                            ).toLowerCase();


                        const name =
                            String(
                                student.name || ""
                            ).toLowerCase();


                        const mobile =
                            String(
                                student.mobile || ""
                            ).toLowerCase();


                        return (
                            registration.includes(
                                search
                            ) ||
                            name.includes(
                                search
                            ) ||
                            mobile.includes(
                                search
                            )
                        );

                    }
                );


            renderStudents(
                filtered
            );

        }
    );

}


// =====================================================
// REFRESH
// =====================================================

if (refreshBtn) {

    refreshBtn.addEventListener(
        "click",
        loadStudents
    );

}


// =====================================================
// BACKFILL RED BELT
// =====================================================

if (backfillBeltBtn) {

    backfillBeltBtn.addEventListener(
        "click",
        backfillRedBelt
    );

}


async function backfillRedBelt() {

    const studentsWithoutBelt =
        allStudents.filter(
            (student) => {

                return !student.belt;

            }
        );


    if (!studentsWithoutBelt.length) {

        alert(
            "All approved students already have a belt assigned. Nothing to do."
        );

        return;

    }


    const confirmed =
        confirm(
            `${studentsWithoutBelt.length} approved student(s) have no belt yet.\n\n` +
            `Assign Red Belt to all of them now?`
        );


    if (!confirmed) {

        return;

    }


    backfillBeltBtn.disabled =
        true;

    backfillBeltBtn.textContent =
        "⏳ Assigning...";


    try {

        const updatePromises =
            studentsWithoutBelt.map(
                async (student) => {

                    const studentRef =
                        doc(
                            db,
                            "students",
                            student.id
                        );


                    await updateDoc(
                        studentRef,
                        {
                            belt:
                                "Red Belt",

                            beltAssignedAt:
                                serverTimestamp()
                        }
                    );

                }
            );


        await Promise.all(
            updatePromises
        );


        alert(
            `Red Belt assigned to ${studentsWithoutBelt.length} student(s) successfully.`
        );


        await loadStudents();


    } catch (error) {

        console.error(
            "Backfill Belt Error:",
            error
        );


        alert(
            "Could not assign Red Belt to all students:\n" +
            error.message
        );

    }


    backfillBeltBtn.disabled =
        false;

    backfillBeltBtn.textContent =
        "🥋 Assign Red Belt (Old Students)";

}


// =====================================================
// LOGOUT
// =====================================================

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async (event) => {

            event.preventDefault();

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


// =====================================================
// MOBILE SIDEBAR
// =====================================================

const sidebar =
    document.getElementById(
        "sidebar"
    );

const mobileMenu =
    document.getElementById(
        "mobileMenu"
    );

const sidebarClose =
    document.getElementById(
        "sidebarClose"
    );

const sidebarOverlay =
    document.getElementById(
        "sidebarOverlay"
    );


// =====================================================
// OPEN SIDEBAR
// =====================================================

function openSidebar(event) {

    if (event) {

        event.preventDefault();
        event.stopPropagation();

    }


    if (sidebar) {

        sidebar.classList.add(
            "open"
        );

    }


    if (sidebarOverlay) {

        sidebarOverlay.classList.add(
            "show"
        );

    }


    document.body.style.overflow =
        "hidden";

}


// =====================================================
// CLOSE SIDEBAR
// =====================================================

function closeSidebar(event) {

    // =================================================
    // IMPORTANT:
    // STOP href/navigation
    // This prevents going to Dashboard.
    // =================================================

    if (event) {

        event.preventDefault();
        event.stopPropagation();

    }


    if (sidebar) {

        sidebar.classList.remove(
            "open"
        );

    }


    if (sidebarOverlay) {

        sidebarOverlay.classList.remove(
            "show"
        );

    }


    document.body.style.overflow =
        "";

}


// =====================================================
// MOBILE MENU BUTTON
// =====================================================

if (mobileMenu) {

    mobileMenu.addEventListener(
        "click",
        openSidebar,
        false
    );

}


// =====================================================
// CLOSE BUTTON
// =====================================================

if (sidebarClose) {

    sidebarClose.addEventListener(
        "click",
        closeSidebar,
        false
    );

}


// =====================================================
// EXTRA PROTECTION FOR CLOSE BUTTON
// =====================================================
// If sidebarClose is inside <a href="admin.html">,
// this capture listener will stop navigation.

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


// =====================================================
// OVERLAY CLICK
// =====================================================

if (sidebarOverlay) {

    sidebarOverlay.addEventListener(
        "click",
        closeSidebar,
        false
    );

}


// =====================================================
// ESCAPE CLOSE SIDEBAR
// =====================================================

document.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Escape") {

            closeSidebar();

        }

    }
);


// =====================================================
// CLOSE SIDEBAR AFTER REAL MENU LINK CLICK
// =====================================================

if (sidebar) {

    sidebar.addEventListener(
        "click",
        (event) => {

            const link =
                event.target.closest(
                    "a"
                );


            if (!link) {

                return;

            }


            // Never interfere with X button
            if (
                link.id ===
                "sidebarClose"
            ) {

                return;

            }


            // If X icon is inside the link
            if (
                link.contains(
                    sidebarClose
                )
            ) {

                return;

            }


            // Don't interfere with # links
            const href =
                link.getAttribute(
                    "href"
                );


            if (
                !href ||
                href === "#" ||
                href ===
                "javascript:void(0)"
            ) {

                return;

            }


            // Close sidebar before navigating
            if (
                window.innerWidth <= 768
            ) {

                closeSidebar();

            }

        },
        false
    );

}


// =====================================================
// RESIZE HANDLER
// =====================================================

window.addEventListener(
    "resize",
    () => {

        if (window.innerWidth > 768) {

            if (sidebar) {

                sidebar.classList.remove(
                    "open"
                );

            }


            if (sidebarOverlay) {

                sidebarOverlay.classList.remove(
                    "show"
                );

            }


            document.body.style.overflow =
                "";

        }

    }
);


// =====================================================
// HELPER
// =====================================================

function setModalText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value || "-";

    }

}


// =====================================================
// DATE FORMAT
// =====================================================

function formatDate(
    timestamp
) {

    if (!timestamp) {

        return "-";

    }


    try {

        let date;


        if (
            typeof timestamp.toDate ===
            "function"
        ) {

            date =
                timestamp.toDate();

        } else {

            date =
                new Date(
                    timestamp
                );

        }


        return new Intl.DateTimeFormat(
            "en-GB",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        ).format(
            date
        );


    } catch (error) {

        return "-";

    }

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// =====================================================
// LOADING
// =====================================================

function showLoading() {

    if (loadingState) {

        loadingState.classList.remove(
            "hidden"
        );

    }


    if (emptyState) {

        emptyState.classList.add(
            "hidden"
        );

    }


    if (tableBody) {

        tableBody.innerHTML =
            "";

    }

}


// =====================================================
// START
// =====================================================

loadStudents();


// =====================================================
// PROFILE ACTION BUTTONS
// =====================================================

const editStudentBtn =
    document.getElementById(
        "editStudentBtn"
    );

const idCardBtn =
    document.getElementById(
        "idCardBtn"
    );

const certificateBtn =
    document.getElementById(
        "certificateBtn"
    );


// =====================================================
// EDIT STUDENT
// =====================================================

if (editStudentBtn) {

    editStudentBtn.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            if (!currentStudent) {

                return;

            }


            window.location.href =
                `edit-student.html?id=${encodeURIComponent(
                    currentStudent.id
                )}`;

        }
    );

}


// =====================================================
// ID CARD
// =====================================================

if (idCardBtn) {

    idCardBtn.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            if (!currentStudent) {

                return;

            }


            window.location.href =
                `id-card.html?id=${encodeURIComponent(
                    currentStudent.id
                )}`;

        }
    );

}


// =====================================================
// CERTIFICATE
// =====================================================

if (certificateBtn) {

    certificateBtn.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            if (!currentStudent) {

                return;

            }


            window.location.href =
                `certificate.html?id=${encodeURIComponent(
                    currentStudent.id
                )}`;

        }
    );

}