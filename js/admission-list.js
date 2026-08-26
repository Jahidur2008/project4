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
    document.getElementById("admissionTableBody");

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

const allApproveBtn =
    document.getElementById("allApproveBtn");

const pendingCount =
    document.getElementById("pendingCount");

const approvedCount =
    document.getElementById("approvedCount");

const rejectedCount =
    document.getElementById("rejectedCount");

const canceledCount =
    document.getElementById("canceledCount");


// =====================================================
// MODAL
// =====================================================

const studentModal =
    document.getElementById("studentModal");

const modalClose =
    document.getElementById("modalClose");

const modalApproveBtn =
    document.getElementById("modalApproveBtn");

const modalRejectBtn =
    document.getElementById("modalRejectBtn");

const modalPhoto =
    document.getElementById("modalStudentPhoto");

const photoPlaceholder =
    document.querySelector(
        ".modal-photo-placeholder"
    );


// =====================================================
// DATA
// =====================================================

let allStudents = [];

let currentStudent = null;


// =====================================================
// AUTHENTICATION
// =====================================================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.replace(
            "admin.html"
        );

    }

});


// =====================================================
// LOAD STUDENTS
// =====================================================

async function loadAdmissions() {

    try {

        showLoading();

        console.log(
            "Loading students from Firestore..."
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
        // IMPORTANT
        // FIRESTORE DATA -> allStudents
        // =================================================

        allStudents =
            snapshot.docs.map(
                (document) => {

                    return {

                        id:
                            document.id,

                        ...document.data()

                    };

                }
            );


        // =================================================
        // KEEP ONLY ADMISSION LIST RELATED STATUS
        //
        // pending
        // rejected
        // canceled
        //
        // approved থাকবে Total Students-এ
        // =================================================

        allStudents =
            allStudents.filter(
                (student) => {

                    const status =
                        getStatus(
                            student
                        );


                    return (
                        status === "pending" ||
                        status === "rejected" ||
                        status === "canceled" ||
                        status === "approved"
                    );

                }
            );


        // =================================================
        // SORT
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


        // =================================================
        // UPDATE COUNTS
        // =================================================

        updateCounts();


        // =================================================
        // RENDER
        // =================================================

        renderAdmissions(
            allStudents,
            false
        );


    } catch (error) {

        console.error(
            "Admission Load Error:",
            error
        );


        loadingState.classList.add(
            "hidden"
        );


        tableStatus.textContent =
            "Failed to load admissions.";


        alert(
            "Could not load admission list:\n" +
            error.message
        );

    }

}


// =====================================================
// REGISTRATION NUMBER
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
// RENDER ADMISSIONS
// =====================================================

function renderAdmissions(
    students,
    isSearch = false
) {

    tableBody.innerHTML = "";

    loadingState.classList.add(
        "hidden"
    );


    // =================================================
    // DISPLAY STUDENTS
    // =================================================

    let displayStudents = [];


    if (isSearch) {

        // Search করলে সব status দেখাবে
        displayStudents =
            [...students];

    } else {

        // =================================================
        // NORMAL MODE
        //
        // Pending
        // Rejected
        // Canceled
        //
        // Approved থাকবে না
        // =================================================

        displayStudents =
            students.filter(
                (student) => {

                    const status =
                        getStatus(
                            student
                        );


                    return (
                        status === "pending" ||
                        status === "rejected" ||
                        status === "canceled"
                    );

                }
            );

    }


    // =================================================
    // SORT
    // =================================================

    displayStudents.sort(
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

    if (!displayStudents.length) {

        emptyState.classList.remove(
            "hidden"
        );


        if (isSearch) {

            tableStatus.textContent =
                "No matching students found.";

        } else {

            tableStatus.textContent =
                "No pending, rejected or canceled admissions.";

        }


        return;

    }


    emptyState.classList.add(
        "hidden"
    );


    // =================================================
    // TABLE STATUS
    // =================================================

    if (isSearch) {

        tableStatus.textContent =
            `${displayStudents.length} student(s) found`;

    } else {

        const pending =
            displayStudents.filter(
                (student) =>
                    getStatus(student) ===
                    "pending"
            ).length;


        const rejected =
            displayStudents.filter(
                (student) =>
                    getStatus(student) ===
                    "rejected"
            ).length;


        const canceled =
            displayStudents.filter(
                (student) =>
                    getStatus(student) ===
                    "canceled"
            ).length;


        tableStatus.textContent =
            `${pending} pending • ${rejected} rejected • ${canceled} canceled`;

    }


    // =================================================
    // CREATE ROW
    // =================================================

    displayStudents.forEach(
        (student) => {

            const row =
                document.createElement(
                    "tr"
                );


            const status =
                getStatus(
                    student
                );


            // =================================================
            // ACTION AREA
            // =================================================

            let actionHTML = "";


            // =================================================
            // PENDING
            // =================================================

            if (
                status ===
                "pending"
            ) {

                actionHTML = `

                    <div class="action-buttons">

                        <button
                            type="button"
                            class="approve-btn"
                            data-action="approve"
                            data-id="${escapeHTML(
                                student.id
                            )}"
                        >
                            ✓ Approve
                        </button>


                        <button
                            type="button"
                            class="reject-btn"
                            data-action="reject"
                            data-id="${escapeHTML(
                                student.id
                            )}"
                        >
                            ✕ Reject
                        </button>

                    </div>

                `;

            }


            // =================================================
            // REJECTED
            // =================================================

            else if (
                status ===
                "rejected"
            ) {

                actionHTML = `

                    <div class="action-buttons">

                        <span
                            class="status-badge rejected-badge"
                        >
                            ✕ REJECTED
                        </span>


                        <button
                            type="button"
                            class="approve-btn"
                            data-action="reapprove"
                            data-id="${escapeHTML(
                                student.id
                            )}"
                        >
                            ↻ Re-Approve
                        </button>

                    </div>

                `;

            }


            // =================================================
            // CANCELED
            // =================================================

            else if (
                status ===
                "canceled"
            ) {

                actionHTML = `

                    <div class="action-buttons">

                        <span
                            class="status-badge canceled-badge"
                        >
                            ✕ CANCELED
                        </span>


                        <button
                            type="button"
                            class="approve-btn"
                            data-action="reapprove-canceled"
                            data-id="${escapeHTML(
                                student.id
                            )}"
                        >
                            ↻ Re-Approve
                        </button>

                    </div>

                `;

            }


            // =================================================
            // APPROVED
            // =================================================

            else if (
                status ===
                "approved"
            ) {

                actionHTML = `

                    <div class="action-buttons">

                        <span
                            class="status-badge approved-badge"
                        >
                            ✓ APPROVED
                        </span>

                    </div>

                `;

            }


            // =================================================
            // ROW
            // =================================================

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
                            student.registrationNo ||
                            "-"
                        )}

                    </button>

                </td>


                <td>
                    ${escapeHTML(
                        student.name ||
                        "-"
                    )}
                </td>


                <td>
                    ${escapeHTML(
                        student.fatherName ||
                        "-"
                    )}
                </td>


                <td>
                    ${escapeHTML(
                        student.motherName ||
                        "-"
                    )}
                </td>


                <td>
                    ${escapeHTML(
                        student.sex ||
                        "-"
                    )}
                </td>


                <td>
                    ${escapeHTML(
                        student.dob ||
                        "-"
                    )}
                </td>


                <td>
                    ${escapeHTML(
                        student.mobile ||
                        "-"
                    )}
                </td>


                <td>
                    ${formatDate(
                        student.createdAt
                    )}
                </td>


                <td>

                    ${actionHTML}

                </td>

            `;


            tableBody.appendChild(
                row
            );

        }
    );

}


// =====================================================
// GET STATUS
// =====================================================

function getStatus(
    student
) {

    return String(
        student.status ||
        "pending"
    )
        .trim()
        .toLowerCase();

}


// =====================================================
// COUNTS
// =====================================================

function updateCounts() {

    const pending =
        allStudents.filter(
            (student) =>
                getStatus(student) ===
                "pending"
        ).length;


    const approved =
        allStudents.filter(
            (student) =>
                getStatus(student) ===
                "approved"
        ).length;


    const rejected =
        allStudents.filter(
            (student) =>
                getStatus(student) ===
                "rejected"
        ).length;


    const canceled =
        allStudents.filter(
            (student) =>
                getStatus(student) ===
                "canceled"
        ).length;


    if (pendingCount) {

        pendingCount.textContent =
            pending;

    }


    if (approvedCount) {

        approvedCount.textContent =
            approved;

    }


    if (rejectedCount) {

        rejectedCount.textContent =
            rejected;

    }


    if (canceledCount) {

        canceledCount.textContent =
            canceled;

    }

}


// =====================================================
// TABLE CLICK
// =====================================================

tableBody.addEventListener(
    "click",
    async (event) => {

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
        // ACTION BUTTON
        // =================================================

        const actionButton =
            event.target.closest(
                "button[data-action]"
            );


        if (!actionButton) {

            return;

        }


        const studentId =
            actionButton.dataset.id;


        const action =
            actionButton.dataset.action;


        // =================================================
        // APPROVE
        // =================================================

        if (
            action ===
            "approve"
        ) {

            await changeStudentStatus(
                studentId,
                "approved"
            );

        }


        // =================================================
        // REJECT
        // =================================================

        else if (
            action ===
            "reject"
        ) {

            await changeStudentStatus(
                studentId,
                "rejected"
            );

        }


        // =================================================
        // RE-APPROVE REJECTED
        // =================================================

        else if (
            action ===
            "reapprove"
        ) {

            await reApproveStudent(
                studentId
            );

        }


        // =================================================
        // RE-APPROVE CANCELED
        // =================================================

        else if (
            action ===
            "reapprove-canceled"
        ) {

            await reApproveCanceledStudent(
                studentId
            );

        }

    }
);


// =====================================================
// ALL APPROVE
// =====================================================

async function approveAllPendingStudents() {

    const pendingStudents =
        allStudents.filter(
            (student) =>
                getStatus(student) ===
                "pending"
        );


    if (!pendingStudents.length) {

        alert(
            "There are no pending admissions to approve."
        );

        return;

    }


    const confirmed =
        confirm(
            `Are you sure you want to approve ALL ${pendingStudents.length} pending student(s)?\n\n` +
            `This action will approve all pending admissions.`
        );


    if (!confirmed) {

        return;

    }


    if (allApproveBtn) {

        allApproveBtn.disabled =
            true;

        allApproveBtn.textContent =
            "⏳ Approving...";

    }


    try {

        const updatePromises =
            pendingStudents.map(
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

                            status:
                                "approved",

                            statusUpdatedAt:
                                serverTimestamp()

                        }
                    );

                }
            );


        await Promise.all(
            updatePromises
        );


        alert(
            `All ${pendingStudents.length} pending student(s) approved successfully.\n\n` +
            `They are now available in Total Students.`
        );


        await loadAdmissions();


    } catch (error) {

        console.error(
            "All Approve Error:",
            error
        );


        alert(
            "Could not approve all students:\n" +
            error.message
        );


    } finally {

        if (allApproveBtn) {

            allApproveBtn.disabled =
                false;

            allApproveBtn.textContent =
                "✓ All Approve";

        }

    }

}


// =====================================================
// CHANGE STATUS
// =====================================================

async function changeStudentStatus(
    studentId,
    newStatus
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


    const studentName =
        student.name ||
        student.registrationNo ||
        "this student";


    const actionText =
        newStatus ===
        "approved"
            ? "approve"
            : "reject";


    const confirmed =
        confirm(
            `Are you sure you want to ${actionText} ${studentName}?`
        );


    if (!confirmed) {

        return;

    }


    try {

        const studentRef =
            doc(
                db,
                "students",
                studentId
            );


        await updateDoc(
            studentRef,
            {

                status:
                    newStatus,

                statusUpdatedAt:
                    serverTimestamp()

            }
        );


        if (
            newStatus ===
            "approved"
        ) {

            alert(
                "Student approved successfully.\n\n" +
                "Student is now available in Total Students."
            );

        } else {

            alert(
                "Admission rejected successfully.\n\n" +
                "The rejected student is still saved in the system."
            );

        }


        closeStudentModal();


        await loadAdmissions();


    } catch (error) {

        console.error(
            "Status Update Error:",
            error
        );


        alert(
            "Could not update status:\n" +
            error.message
        );

    }

}


// =====================================================
// RE-APPROVE REJECTED STUDENT
// =====================================================

async function reApproveStudent(
    studentId
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


    const studentName =
        student.name ||
        student.registrationNo ||
        "this student";


    const confirmed =
        confirm(
            `Do you want to re-approve ${studentName}?\n\n` +
            `After re-approve, the student will become PENDING again.`
        );


    if (!confirmed) {

        return;

    }


    try {

        const studentRef =
            doc(
                db,
                "students",
                studentId
            );


        await updateDoc(
            studentRef,
            {

                status:
                    "pending",

                statusUpdatedAt:
                    serverTimestamp()

            }
        );


        alert(
            "Student re-approved successfully.\n\n" +
            "The student is now PENDING again.\n" +
            "Approve or Reject buttons are available."
        );


        closeStudentModal();


        await loadAdmissions();


    } catch (error) {

        console.error(
            "Re-Approve Error:",
            error
        );


        alert(
            "Could not re-approve student:\n" +
            error.message
        );

    }

}


// =====================================================
// RE-APPROVE CANCELED STUDENT
// =====================================================

async function reApproveCanceledStudent(
    studentId
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


    const studentName =
        student.name ||
        student.registrationNo ||
        "this student";


    const confirmed =
        confirm(
            `Do you want to re-approve ${studentName}?\n\n` +
            `After re-approve, the student will become PENDING again.`
        );


    if (!confirmed) {

        return;

    }


    try {

        const studentRef =
            doc(
                db,
                "students",
                studentId
            );


        await updateDoc(
            studentRef,
            {

                status:
                    "pending",

                statusUpdatedAt:
                    serverTimestamp()

            }
        );


        alert(
            "Student re-approved successfully.\n\n" +
            "The student is now PENDING again.\n" +
            "Approve or Reject buttons are available."
        );


        closeStudentModal();


        await loadAdmissions();


    } catch (error) {

        console.error(
            "Canceled Re-Approve Error:",
            error
        );


        alert(
            "Could not re-approve canceled student:\n" +
            error.message
        );

    }

}


// =====================================================
// OPEN STUDENT MODAL
// =====================================================

function openStudentModal(
    student
) {

    currentStudent =
        student;


    // =================================================
    // BASIC
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


    setModalText(
        "modalMarital",
        student.maritalStatus
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

        Array.isArray(
            student.training
        )
            ? student.training.join(
                ", "
            )
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


    const status =
        getStatus(
            student
        );


    if (statusElement) {

        statusElement.textContent =
            status.toUpperCase();


        statusElement.className =
            "modal-status " +
            status;

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
                function () {

                    modalPhoto.style.display =
                        "block";


                    if (
                        photoPlaceholder
                    ) {

                        photoPlaceholder.style.display =
                            "none";

                    }

                };


            modalPhoto.onerror =
                function () {

                    modalPhoto.style.display =
                        "none";


                    if (
                        photoPlaceholder
                    ) {

                        photoPlaceholder.style.display =
                            "flex";

                    }

                };

        } else {

            if (
                photoPlaceholder
            ) {

                photoPlaceholder.style.display =
                    "flex";

            }

        }

    }


    // =================================================
    // MODAL BUTTONS
    // =================================================

    if (modalApproveBtn) {

        modalApproveBtn.style.display =
            status ===
            "pending"
                ? "block"
                : "none";

    }


    if (modalRejectBtn) {

        modalRejectBtn.style.display =
            status ===
            "pending"
                ? "block"
                : "none";

    }


    // =================================================
    // SHOW
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
        closeStudentModal
    );

}


// =====================================================
// OUTSIDE MODAL
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

        if (
            event.key ===
            "Escape"
        ) {

            closeStudentModal();

        }

    }
);


// =====================================================
// MODAL APPROVE
// =====================================================

if (modalApproveBtn) {

    modalApproveBtn.addEventListener(
        "click",
        async () => {

            if (!currentStudent) {

                return;

            }


            await changeStudentStatus(
                currentStudent.id,
                "approved"
            );

        }
    );

}


// =====================================================
// MODAL REJECT
// =====================================================

if (modalRejectBtn) {

    modalRejectBtn.addEventListener(
        "click",
        async () => {

            if (!currentStudent) {

                return;

            }


            await changeStudentStatus(
                currentStudent.id,
                "rejected"
            );

        }
    );

}


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


            // =================================================
            // SEARCH EMPTY
            // =================================================

            if (!search) {

                renderAdmissions(
                    allStudents,
                    false
                );

                return;

            }


            // =================================================
            // SEARCH ALL STATUS
            // =================================================

            const filtered =
                allStudents.filter(
                    (student) => {

                        const registration =
                            String(
                                student.registrationNo ||
                                ""
                            ).toLowerCase();


                        const name =
                            String(
                                student.name ||
                                ""
                            ).toLowerCase();


                        const mobile =
                            String(
                                student.mobile ||
                                ""
                            ).toLowerCase();


                        const status =
                            String(
                                student.status ||
                                ""
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
                            ) ||

                            status.includes(
                                search
                            )

                        );

                    }
                );


            renderAdmissions(
                filtered,
                true
            );

        }
    );

}


// =====================================================
// ALL APPROVE BUTTON
// =====================================================

if (allApproveBtn) {

    allApproveBtn.addEventListener(
        "click",
        approveAllPendingStudents
    );

}


// =====================================================
// REFRESH
// =====================================================

if (refreshBtn) {

    refreshBtn.addEventListener(
        "click",
        loadAdmissions
    );

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

function openSidebar() {

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

}


// =====================================================
// CLOSE SIDEBAR
// =====================================================

function closeSidebar() {

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

}


// =====================================================
// MOBILE
// =====================================================

if (mobileMenu) {

    mobileMenu.addEventListener(
        "click",
        openSidebar
    );

}


if (sidebarClose) {

    sidebarClose.addEventListener(
        "click",
        closeSidebar
    );

}


if (sidebarOverlay) {

    sidebarOverlay.addEventListener(
        "click",
        closeSidebar
    );

}


// =====================================================
// MODAL TEXT
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
            value ||
            "-";

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
                day:
                    "2-digit",

                month:
                    "short",

                year:
                    "numeric"
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

    loadingState.classList.remove(
        "hidden"
    );


    emptyState.classList.add(
        "hidden"
    );


    tableBody.innerHTML =
        "";

}


// =====================================================
// START
// =====================================================

loadAdmissions();