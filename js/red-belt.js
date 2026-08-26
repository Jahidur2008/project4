import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    arrayUnion,
    collection,
    doc,
    getDocs,
    query,
    serverTimestamp,
    updateDoc,
    where
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// =========================================
// ELEMENTS
// =========================================

const tableBody =
    document.getElementById("redBeltTableBody");

const totalRedStudents =
    document.getElementById("totalRedStudents");

const examGiven =
    document.getElementById("examGiven");

const passedCount =
    document.getElementById("passedCount");

const failedCount =
    document.getElementById("failedCount");

const tableStatus =
    document.getElementById("tableStatus");

const loadingState =
    document.getElementById("loadingState");

const emptyState =
    document.getElementById("emptyState");

const refreshBtn =
    document.getElementById("refreshBtn");

const searchInput =
    document.getElementById("searchInput");


// =========================================
// EXAM MODAL
// =========================================

const examModal =
    document.getElementById("examModal");

const examMark =
    document.getElementById("examMark");

const examStudentName =
    document.getElementById("examStudentName");

const examRegistration =
    document.getElementById("examRegistration");

const resultPreview =
    document.getElementById("resultPreview");

const saveResultBtn =
    document.getElementById("saveResultBtn");

const examModalClose =
    document.getElementById("examModalClose");


// =========================================
// STUDENT PROFILE MODAL
// =========================================

const studentModal =
    document.getElementById("studentModal");

const studentModalClose =
    document.getElementById("studentModalClose");

const modalPhoto =
    document.getElementById("modalStudentPhoto");

const photoPlaceholder =
    document.querySelector(".modal-photo-placeholder");


// =========================================
// DATA
// =========================================

let allStudents = [];

let selectedStudent = null;


// =========================================
// AUTH
// =========================================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.replace("admin.html");

        return;
    }

    loadRedBeltStudents();
});


// =========================================
// LOAD RED BELT STUDENTS
// =========================================

async function loadRedBeltStudents() {

    if (!tableBody) {

        console.error(
            "redBeltTableBody not found."
        );

        return;
    }


    // -------------------------------------
    // START LOADING
    // -------------------------------------

    tableBody.innerHTML = "";

    loadingState?.classList.remove("hidden");

    emptyState?.classList.add("hidden");


    if (tableStatus) {

        tableStatus.textContent =
            "Loading students...";
    }


    try {

        const studentsRef =
            collection(
                db,
                "students"
            );


        const q =
            query(
                studentsRef,

                where(
                    "status",
                    "==",
                    "approved"
                ),

                where(
                    "belt",
                    "==",
                    "Red Belt"
                )
            );


        const snapshot =
            await getDocs(q);


        const students = [];


        snapshot.forEach(
            (studentDoc) => {

                students.push({

                    id: studentDoc.id,

                    ...studentDoc.data()

                });
            }
        );


        // -------------------------------------
        // SORT
        // -------------------------------------

        students.sort(
            (a, b) => {

                return String(
                    a.registrationNo || ""
                ).localeCompare(

                    String(
                        b.registrationNo || ""
                    ),

                    undefined,

                    {
                        numeric: true
                    }
                );
            }
        );


        // Save all students

        allStudents =
            students;


        // -------------------------------------
        // STOP LOADING
        // -------------------------------------

        loadingState?.classList.add(
            "hidden"
        );


        // Render table

        renderStudents(
            students
        );


        // Table status

        if (tableStatus) {

            if (
                students.length === 0
            ) {

                tableStatus.textContent =
                    "No students found";

            } else {

                tableStatus.textContent =
                    `${students.length} student${students.length > 1 ? "s" : ""} found`;
            }
        }


        // Empty state

        if (
            students.length === 0
        ) {

            emptyState?.classList.remove(
                "hidden"
            );

        } else {

            emptyState?.classList.add(
                "hidden"
            );
        }


    } catch (error) {

        console.error(
            "Red Belt Load Error:",
            error
        );


        // Loading বন্ধ

        loadingState?.classList.add(
            "hidden"
        );


        if (tableStatus) {

            tableStatus.textContent =
                "Failed to load students";
        }


        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="loading-row"
                >

                    <i class="fa-solid fa-triangle-exclamation"></i>

                    Failed to load students.

                    <br>

                    <small>

                        ${escapeHTML(
                            error.message
                        )}

                    </small>

                </td>

            </tr>

        `;
    }
}


// =========================================
// RENDER STUDENTS
// =========================================

function renderStudents(students) {

    if (!tableBody) {

        return;
    }


    // -------------------------------------
    // NO STUDENTS
    // -------------------------------------

    if (
        !students ||
        students.length === 0
    ) {

        tableBody.innerHTML = "";

        updateStats([]);

        return;
    }


    tableBody.innerHTML = "";


    students.forEach(
        (student, index) => {

            const mark =
                student.lastExamMark;


            const result =
                student.lastExamResult;


            // =================================
            // RESULT
            // =================================

            let resultHTML = `

                <span
                    class="result-badge result-pending"
                >
                    Not Examined
                </span>

            `;


            if (
                result === "PASS"
            ) {

                resultHTML = `

                    <span
                        class="result-badge result-pass"
                    >
                        PASS
                    </span>

                `;
            }


            if (
                result === "FAIL"
            ) {

                resultHTML = `

                    <span
                        class="result-badge result-fail"
                    >
                        FAIL
                    </span>

                `;
            }


            // =================================
            // PHOTO
            // =================================

            const photo =
                student.photoURL ||
                student.photoUrl ||
                student.photo ||
                student.imageURL ||
                student.imageUrl ||
                "./images/logo.png";


            // =================================
            // BUTTON TEXT
            // =================================

            const hasMark =
                mark !== null &&
                mark !== undefined;


            const buttonText =
                hasMark
                    ? "Remark"
                    : "Give Mark";


            // =================================
            // CREATE ROW
            // =================================

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${index + 1}
                </td>


                <td>

                    <button
                        type="button"
                        class="registration-link"
                        data-id="${student.id}"
                    >

                        ${escapeHTML(
                            student.registrationNo || "-"
                        )}

                    </button>

                </td>


                <td>

                    <div class="student-name">

                        <img
                            class="student-photo"
                            src="${escapeAttribute(photo)}"
                            alt="Student"
                        />

                        <div>

                            <strong>

                                ${escapeHTML(
                                    student.name || "-"
                                )}

                            </strong>

                            <small>

                                ${escapeHTML(
                                    student.bloodGroup || ""
                                )}

                            </small>

                        </div>

                    </div>

                </td>


                <td>

                    ${escapeHTML(
                        student.mobile || "-"
                    )}

                </td>


                <td>

                    <span class="belt-badge">

                        Red Belt

                    </span>

                </td>


                <td>

                    <strong>

                        ${
                            hasMark
                                ? `${mark}/100`
                                : "-"
                        }

                    </strong>

                </td>


                <td>

                    ${resultHTML}

                </td>


                <td>

                    <button
                        class="exam-btn"
                        type="button"
                        data-id="${student.id}"
                    >

                        <i class="fa-solid fa-pen"></i>

                        ${buttonText}

                    </button>

                </td>

            `;


            // =================================
            // GIVE MARK / REMARK
            // =================================

            const examButton =
                row.querySelector(
                    ".exam-btn"
                );


            examButton?.addEventListener(
                "click",
                () => {

                    openExamModal(
                        student
                    );

                }
            );


            tableBody.appendChild(
                row
            );

        }
    );


    updateStats(
        students
    );
}


// =========================================
// UPDATE STATS
// =========================================

function updateStats(students) {

    if (totalRedStudents) {

        totalRedStudents.textContent =
            students.length;
    }


    const examined =
        students.filter(
            (student) => {

                return (
                    student.lastExamMark !== null &&
                    student.lastExamMark !== undefined
                );

            }
        );


    const passed =
        students.filter(
            (student) => {

                return (
                    student.lastExamResult ===
                    "PASS"
                );

            }
        );


    const failed =
        students.filter(
            (student) => {

                return (
                    student.lastExamResult ===
                    "FAIL"
                );

            }
        );


    if (examGiven) {

        examGiven.textContent =
            examined.length;
    }


    if (passedCount) {

        passedCount.textContent =
            passed.length;
    }


    if (failedCount) {

        failedCount.textContent =
            failed.length;
    }
}


// =========================================
// SEARCH
// =========================================

searchInput?.addEventListener(
    "input",
    () => {

        const keyword =
            searchInput.value
                .trim()
                .toLowerCase();


        const filteredStudents =
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
                            keyword
                        ) ||

                        name.includes(
                            keyword
                        ) ||

                        mobile.includes(
                            keyword
                        )

                    );
                }
            );


        renderStudents(
            filteredStudents
        );


        if (tableStatus) {

            tableStatus.textContent =
                `${filteredStudents.length} student${filteredStudents.length > 1 ? "s" : ""} found`;
        }

    }
);


// =========================================
// REFRESH
// =========================================

refreshBtn?.addEventListener(
    "click",
    () => {

        if (searchInput) {

            searchInput.value = "";
        }


        loadRedBeltStudents();

    }
);


// =========================================
// REGISTRATION CLICK
// =========================================

tableBody?.addEventListener(
    "click",
    (event) => {

        const registrationButton =
            event.target.closest(
                ".registration-link"
            );


        if (!registrationButton) {

            return;
        }


        const studentId =
            registrationButton.dataset.id;


        const student =
            allStudents.find(
                (item) => {

                    return (
                        item.id ===
                        studentId
                    );

                }
            );


        if (student) {

            openStudentModal(
                student
            );
        }

    }
);


// =========================================
// OPEN STUDENT PROFILE
// =========================================

function openStudentModal(student) {

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

    setModalText(
        "modalPresentAddress",
        student.presentAddress
    );

    setModalText(
        "modalPermanentAddress",
        student.permanentAddress
    );

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
            ? student.training.join(", ")
            : student.training
    );


    setModalText(
        "modalContribution",
        student.contribution
    );


    const statusElement =
        document.getElementById(
            "modalStatus"
        );


    if (statusElement) {

        statusElement.textContent =
            (
                student.belt ||
                "RED BELT"
            ).toUpperCase();


        statusElement.className =
            "modal-status approved";
    }


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


                    if (
                        photoPlaceholder
                    ) {

                        photoPlaceholder.style.display =
                            "none";
                    }

                };


            modalPhoto.onerror =
                () => {

                    modalPhoto.style.display =
                        "none";


                    if (
                        photoPlaceholder
                    ) {

                        photoPlaceholder.style.display =
                            "flex";
                    }

                };

        } else if (
            photoPlaceholder
        ) {

            photoPlaceholder.style.display =
                "flex";
        }
    }


    studentModal?.classList.remove(
        "hidden"
    );


    document.body.style.overflow =
        "hidden";
}


// =========================================
// CLOSE STUDENT PROFILE
// =========================================

function closeStudentModal() {

    studentModal?.classList.add(
        "hidden"
    );


    document.body.style.overflow =
        "";
}


studentModalClose?.addEventListener(
    "click",
    closeStudentModal
);


studentModal?.addEventListener(
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


// =========================================
// SET MODAL TEXT
// =========================================

function setModalText(id, value) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            (
                value === undefined ||
                value === null ||
                value === ""
            )
                ? "-"
                : value;
    }
}


// =========================================
// OPEN EXAM MODAL
// =========================================

function openExamModal(student) {

    selectedStudent =
        student;


    if (examStudentName) {

        examStudentName.textContent =
            student.name || "-";
    }


    if (examRegistration) {

        examRegistration.textContent =
            student.registrationNo || "-";
    }


    if (examMark) {

        examMark.value =
            student.lastExamMark ?? "";
    }


    updateResultPreview();


    // =====================================
    // FORCE MODAL TO SHOW
    // =====================================

    if (examModal) {

        examModal.style.display =
            "flex";


        examModal.style.visibility =
            "visible";


        examModal.style.opacity =
            "1";


        examModal.classList.add(
            "show"
        );
    }


    // =====================================
    // IMPORTANT
    // BODY SCROLL LOCK
    // =====================================

    document.body.style.overflow =
        "hidden";


    setTimeout(
        () => {

            examMark?.focus();

        },
        100
    );
}


// =========================================
// CLOSE EXAM MODAL
// ONLY CLOSE BUTTON CAN CLOSE IT
// =========================================

function closeExamModal() {

    if (examModal) {

        examModal.classList.remove(
            "show"
        );


        examModal.style.display =
            "none";


        examModal.style.visibility =
            "";


        examModal.style.opacity =
            "";
    }


    document.body.style.overflow =
        "";


    selectedStudent =
        null;
}


// =========================================
// EXAM MODAL CLOSE BUTTON
// =========================================

examModalClose?.addEventListener(
    "click",
    (event) => {

        event.preventDefault();

        event.stopPropagation();

        closeExamModal();

    }
);


// =========================================
// IMPORTANT:
// DO NOT CLOSE EXAM MODAL ON OUTSIDE CLICK
// =========================================
//
// এখানে intentionally কোনো close code নেই.
//
// আগে যদি এমন code থাকে:
//
// examModal.addEventListener("click", ...)
// event.target === examModal
// closeExamModal();
//
// সেটা রাখা যাবে না.
//
// এখন modal-এর বাইরে/body/sidebar-এ click করলেও
// Give Mark popup থাকবে।
// শুধু Close button-এ click করলে close হবে.
//
// =========================================


// =========================================
// MARK INPUT
// =========================================

examMark?.addEventListener(
    "input",
    updateResultPreview
);


// =========================================
// RESULT PREVIEW
// =========================================

function updateResultPreview() {

    if (
        !examMark ||
        !resultPreview
    ) {

        return;
    }


    if (
        examMark.value === ""
    ) {

        resultPreview.textContent =
            "Enter a mark to see result";


        resultPreview.className =
            "result-preview";


        return;
    }


    const mark =
        Number(
            examMark.value
        );


    if (
        !Number.isFinite(mark) ||
        mark < 0 ||
        mark > 100
    ) {

        resultPreview.textContent =
            "Mark must be between 0 and 100";


        resultPreview.className =
            "result-preview result-fail";


        return;
    }


    if (
        mark >= 40
    ) {

        resultPreview.textContent =
            "PASS — Student will be promoted to Yellow Belt";


        resultPreview.className =
            "result-preview result-pass";

    } else {

        resultPreview.textContent =
            "FAIL — Student will remain in Red Belt";


        resultPreview.className =
            "result-preview result-fail";
    }
}


// =========================================
// SAVE RESULT
// =========================================

saveResultBtn?.addEventListener(
    "click",
    saveExamResult
);


async function saveExamResult() {

    if (
        !selectedStudent
    ) {

        return;
    }


    const mark =
        Number(
            examMark?.value
        );


    if (
        !Number.isFinite(mark) ||
        mark < 0 ||
        mark > 100
    ) {

        alert(
            "Please enter a valid mark between 0 and 100."
        );


        examMark?.focus();

        return;
    }


    const result =
        mark >= 40
            ? "PASS"
            : "FAIL";


    saveResultBtn.disabled =
        true;


    saveResultBtn.innerHTML = `

        <i class="fa-solid fa-spinner fa-spin"></i>

        Saving...

    `;


    try {

        const studentRef =
            doc(
                db,
                "students",
                selectedStudent.id
            );


        // =================================
        // FAIL
        // RED BELT-এই থাকবে
        // =================================

        if (
            result === "FAIL"
        ) {

            await updateDoc(
                studentRef,
                {

                    lastExamMark:
                        mark,

                    lastExamResult:
                        "FAIL",

                    lastExamDate:
                        serverTimestamp(),

                    beltHistory:
                        arrayUnion({

                            belt:
                                "Red Belt",

                            mark:
                                mark,

                            result:
                                "FAIL",

                            examDate:
                                new Date()

                        })

                }
            );
        }


        // =================================
        // PASS
        // YELLOW BELT-এ যাবে
        // =================================

        if (
            result === "PASS"
        ) {

            await updateDoc(
                studentRef,
                {

                    belt:
                        "Yellow Belt",

                    previousBelt:
                        "Red Belt",

                    lastExamMark:
                        mark,

                    lastExamResult:
                        "PASS",

                    lastExamDate:
                        serverTimestamp(),

                    beltPromotedAt:
                        serverTimestamp(),

                    beltHistory:
                        arrayUnion({

                            belt:
                                "Red Belt",

                            mark:
                                mark,

                            result:
                                "PASS",

                            promotedTo:
                                "Yellow Belt",

                            examDate:
                                new Date()

                        })

                }
            );
        }


        alert(

            result === "PASS"

                ? "Exam passed! Student promoted to Yellow Belt."

                : "Exam result saved. Student remains in Red Belt."

        );


        closeExamModal();


        await loadRedBeltStudents();


    } catch (error) {

        console.error(
            "Save Exam Error:",
            error
        );


        alert(
            "Failed to save result: " +
            error.message
        );

    } finally {

        saveResultBtn.disabled =
            false;


        saveResultBtn.innerHTML = `

            <i class="fa-solid fa-check"></i>

            Save Result

        `;
    }
}


// =========================================
// PRINT
// =========================================

document
    .getElementById("printBtn")
    ?.addEventListener(
        "click",
        () => {

            window.print();

        }
    );


// =========================================
// SECURITY HELPERS
// =========================================

function escapeHTML(value) {

    return String(
        value ?? ""
    )

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );
}


function escapeAttribute(value) {

    return escapeHTML(
        value
    );
}