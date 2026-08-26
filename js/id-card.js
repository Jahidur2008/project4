import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// =====================================================
// ELEMENTS
// =====================================================

const registrationInput =
    document.getElementById("registrationInput");

const validityInput =
    document.getElementById("validityInput");

const generateBtn =
    document.getElementById("generateBtn");

const messageBox =
    document.getElementById("messageBox");

const previewSection =
    document.getElementById("previewSection");

const downloadPngBtn =
    document.getElementById("downloadPngBtn");

const downloadPdfBtn =
    document.getElementById("downloadPdfBtn");

const idCardFront =
    document.getElementById("idCardFront");

const idCardBack =
    document.getElementById("idCardBack");


// =====================================================
// CURRENT STUDENT
// =====================================================

let currentStudent = null;
let currentValidity = "";


// =====================================================
// CARD SIZE
// =====================================================
//
// 2.3654 inch × 3.6252 inch
//
// Original design ratio ≈ 710 × 1088
//
// 0.1 inch bleed ≈ 30px at 300 DPI
//
// The visible card itself remains 710 × 1088.
// =====================================================

const CARD_WIDTH = 710;
const CARD_HEIGHT = 1088;


// =====================================================
// TEMPLATE IMAGES
// =====================================================

const FRONT_TEMPLATE =
    "./images/Id Card-01.png";

const BACK_TEMPLATE =
    "./images/Id Card-02.png";


// =====================================================
// MESSAGE
// =====================================================

function showMessage(
    message,
    type = "error"
) {

    if (!messageBox) {
        return;
    }

    messageBox.textContent = message;

    messageBox.className =
        `message-box ${type}`;
}


function hideMessage() {

    if (!messageBox) {
        return;
    }

    messageBox.className =
        "message-box hidden";
}


// =====================================================
// GET URL STUDENT ID
// =====================================================

function getStudentIdFromURL() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    return params.get("id");
}


// =====================================================
// LOAD STUDENT BY DOCUMENT ID
// =====================================================

async function loadStudentById(studentId) {

    if (!studentId) {
        return null;
    }

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "students"
                )
            );

        const studentDoc =
            snapshot.docs.find(
                doc =>
                    doc.id === studentId
            );

        if (!studentDoc) {
            return null;
        }

        return {
            id: studentDoc.id,
            ...studentDoc.data()
        };

    } catch (error) {

        console.error(
            "Load Student Error:",
            error
        );

        throw error;
    }
}


// =====================================================
// FIND STUDENT BY REGISTRATION ID
// =====================================================

async function findStudentByRegistration(
    registrationNo
) {

    const searchValue =
        String(
            registrationNo || ""
        )
            .trim()
            .toLowerCase();

    if (!searchValue) {
        return null;
    }

    const snapshot =
        await getDocs(
            collection(
                db,
                "students"
            )
        );

    for (
        const studentDoc
        of snapshot.docs
    ) {

        const data =
            studentDoc.data();

        const studentRegistration =
            String(
                data.registrationNo || ""
            )
                .trim()
                .toLowerCase();

        if (
            studentRegistration ===
            searchValue
        ) {

            return {
                id: studentDoc.id,
                ...data
            };
        }
    }

    return null;
}


// =====================================================
// FORMAT REGISTRATION ID
// =====================================================
//
// User types only number.
// Example:
//
// 06
// 6
// 001
//
// Output:
//
// KWKMA-06
// KWKMA-6
// KWKMA-001
//
// If Firestore already contains KWKMA-06,
// it remains KWKMA-06.
// =====================================================

function normalizeRegistration(value) {

    let registration =
        String(value || "")
            .trim();

    if (!registration) {
        return "";
    }

    if (
        registration
            .toUpperCase()
            .startsWith("KWKMA-")
    ) {

        return registration
            .toUpperCase();
    }

    return `KWKMA-${registration}`;
}


// =====================================================
// CREATE CARD CONTAINER
// =====================================================

function prepareCard(card, template) {

    if (!card) {
        return;
    }

    // Remove existing card content
    card.innerHTML = "";

    card.style.width =
        `${CARD_WIDTH}px`;

    card.style.height =
        `${CARD_HEIGHT}px`;

    card.style.position =
        "relative";

    card.style.overflow =
        "hidden";

    card.style.background =
        "#111";

    card.style.boxShadow =
        "none";

    card.style.border =
        "none";

    card.style.margin =
        "0";

    card.style.padding =
        "0";

    card.style.flexShrink =
        "0";

    card.style.backgroundImage =
        `url("${template}")`;

    card.style.backgroundSize =
        "100% 100%";

    card.style.backgroundPosition =
        "center";

    card.style.backgroundRepeat =
        "no-repeat";
}


// =====================================================
// CREATE OVERLAY ELEMENT
// =====================================================

function createOverlay(
    parent,
    className = ""
) {

    const element =
        document.createElement("div");

    if (className) {
        element.className =
            className;
    }

    element.style.position =
        "absolute";

    element.style.boxSizing =
        "border-box";

    parent.appendChild(element);

    return element;
}


// =====================================================
// CREATE TEXT
// =====================================================

function createText(
    parent,
    text,
    options = {}
) {

    const element =
        createOverlay(parent);

    element.textContent =
        text || "";

    element.style.left =
        options.left || "0";

    element.style.top =
        options.top || "0";

    element.style.width =
        options.width || "100%";

    element.style.height =
        options.height || "auto";

    element.style.display =
        "flex";

    element.style.alignItems =
        options.alignItems || "center";

    element.style.justifyContent =
        options.justifyContent || "flex-start";

    element.style.fontFamily =
        options.fontFamily ||
        "Arial, sans-serif";

    element.style.fontSize =
        options.fontSize ||
        "24px";

    element.style.fontWeight =
        options.fontWeight ||
        "700";

    element.style.color =
        options.color ||
        "#ffffff";

    element.style.textAlign =
        options.textAlign ||
        "left";

    element.style.lineHeight =
        options.lineHeight ||
        "1.2";

    element.style.whiteSpace =
        options.whiteSpace ||
        "nowrap";

    element.style.overflow =
        "hidden";

    return element;
}


// =====================================================
// CREATE PHOTO
// =====================================================

function createStudentPhoto(
    parent,
    photoURL
) {

    const photo =
        createOverlay(parent);

    // Photo position based on the supplied
    // 710 × 1088 front template.

    photo.style.left =
        "201px";

    photo.style.top =
        "313px";

    photo.style.width =
        "307px";

    photo.style.height =
        "345px";

    photo.style.objectFit =
        "cover";

    photo.style.objectPosition =
        "center";

    photo.style.borderRadius =
        "38px";

    photo.style.display =
        "block";

    photo.style.zIndex =
        "10";

    photo.style.background =
        "#eeeeee";

    if (photoURL) {

        photo.src =
            photoURL;

        photo.onerror = () => {

            photo.style.display =
                "none";
        };

    } else {

        photo.style.display =
            "none";
    }

    return photo;
}


// =====================================================
// FRONT CARD
// =====================================================

function buildFrontCard(student, validity) {

    if (!idCardFront) {
        return;
    }

    prepareCard(
        idCardFront,
        FRONT_TEMPLATE
    );


    // =================================================
    // PHOTO
    // =================================================

    const photoURL =
        student.photoURL ||
        student.photoUrl ||
        student.photo ||
        student.imageURL ||
        student.imageUrl ||
        "";

    createStudentPhoto(
        idCardFront,
        photoURL
    );


    // =================================================
    // NAME BACKGROUND COVER
    // =================================================
    //
    // Template contains "FULL NAME".
    // Cover it with the same dark background.
    // =================================================

    const nameCover =
        createOverlay(
            idCardFront
        );

    nameCover.style.left =
        "60px";

    nameCover.style.top =
        "674px";

    nameCover.style.width =
        "590px";

    nameCover.style.height =
        "75px";

    nameCover.style.background =
        "#101010";

    nameCover.style.zIndex =
        "20";


    // =================================================
    // STUDENT NAME
    // =================================================

    const studentName =
        String(
            student.name ||
            "STUDENT NAME"
        )
            .trim()
            .toUpperCase();

    createText(
        idCardFront,
        studentName,
        {
            left: "55px",
            top: "681px",
            width: "600px",
            height: "62px",
            justifyContent: "center",
            textAlign: "center",
            fontSize: "42px",
            fontWeight: "800",
            color: "#ff9418",
            zIndex: "30"
        }
    );


    // =================================================
    // INFORMATION
    // =================================================

    const registration =
        normalizeRegistration(
            student.registrationNo
        );

    const dob =
        student.dob ||
        "-";

    const blood =
        student.bloodGroup ||
        "-";

    const mobile =
        student.mobile ||
        "-";

    const valid =
        validity ||
        "-";


    // =================================================
    // VALUE POSITIONS
    // =================================================
    //
    // These positions match the supplied
    // 710 × 1088 design.
    // =================================================

    const valueOptions = {
        left: "385px",
        width: "280px",
        height: "43px",
        justifyContent: "flex-start",
        fontSize: "27px",
        fontWeight: "800",
        color: "#ffffff",
        zIndex: "30"
    };


    // REGISTRATION

    createText(
        idCardFront,
        registration,
        {
            ...valueOptions,
            top: "751px"
        }
    );


    // DATE OF BIRTH

    createText(
        idCardFront,
        dob,
        {
            ...valueOptions,
            top: "803px"
        }
    );


    // BLOOD GROUP

    createText(
        idCardFront,
        blood,
        {
            ...valueOptions,
            top: "854px",
            color: "#ff2525"
        }
    );


    // MOBILE

    createText(
        idCardFront,
        mobile,
        {
            ...valueOptions,
            top: "905px"
        }
    );


    // VALIDITY

    createText(
        idCardFront,
        valid,
        {
            ...valueOptions,
            top: "957px"
        }
    );
}


// =====================================================
// BACK CARD
// =====================================================

function buildBackCard() {

    if (!idCardBack) {
        return;
    }

    prepareCard(
        idCardBack,
        BACK_TEMPLATE
    );
}


// =====================================================
// DISPLAY CARD
// =====================================================

function displayStudentCard(
    student,
    validity
) {

    currentStudent =
        student;

    currentValidity =
        validity;


    buildFrontCard(
        student,
        validity
    );

    buildBackCard();


    // Show preview

    if (previewSection) {

        previewSection.classList.remove(
            "hidden"
        );
    }


    // Scroll

    setTimeout(() => {

        if (previewSection) {

            previewSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }

    }, 100);
}


// =====================================================
// GENERATE CARD
// =====================================================

async function generateCard() {

    hideMessage();


    // =================================================
    // GET INPUT
    // =================================================

    const registrationInputValue =
        registrationInput?.value
            .trim();

    const validity =
        validityInput?.value
            .trim();


    // =================================================
    // VALIDATION
    // =================================================

    if (!registrationInputValue) {

        showMessage(
            "Please enter the Registration ID."
        );

        registrationInput?.focus();

        return;
    }


    if (!validity) {

        showMessage(
            "Please enter the ID Card validity."
        );

        validityInput?.focus();

        return;
    }


    // =================================================
    // NORMALIZE SEARCH VALUE
    // =================================================

    const registrationNo =
        normalizeRegistration(
            registrationInputValue
        );


    // =================================================
    // LOADING
    // =================================================

    if (generateBtn) {

        generateBtn.disabled =
            true;

        generateBtn.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Loading Student...
        `;
    }


    try {

        const student =
            await findStudentByRegistration(
                registrationNo
            );


        // =================================================
        // STUDENT NOT FOUND
        // =================================================

        if (!student) {

            showMessage(
                `No student found with Registration ID "${registrationNo}".`
            );

            return;
        }


        // =================================================
        // APPROVED CHECK
        // =================================================

        const status =
            String(
                student.status || ""
            )
                .trim()
                .toLowerCase();


        if (
            status &&
            status !== "approved"
        ) {

            showMessage(
                `This student is not approved. Current status: ${student.status}`
            );

            return;
        }


        // =================================================
        // DISPLAY
        // =================================================

        displayStudentCard(
            student,
            validity
        );


        showMessage(
            "ID Card generated successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "Generate ID Card Error:",
            error
        );

        showMessage(
            "Could not load student information. Please try again."
        );


    } finally {

        if (generateBtn) {

            generateBtn.disabled =
                false;

            generateBtn.innerHTML = `
                <i class="fa-solid fa-wand-magic-sparkles"></i>
                Generate ID Card
            `;
        }
    }
}


// =====================================================
// GENERATE BUTTON
// =====================================================

if (generateBtn) {

    generateBtn.addEventListener(
        "click",
        generateCard
    );
}


// =====================================================
// ENTER KEY
// =====================================================

if (registrationInput) {

    registrationInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                generateCard();
            }
        }
    );
}


if (validityInput) {

    validityInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                generateCard();
            }
        }
    );
}


// =====================================================
// AUTO LOAD FROM PROFILE
// =====================================================

async function autoLoadStudent() {

    const studentId =
        getStudentIdFromURL();


    if (!studentId) {
        return;
    }


    try {

        const student =
            await loadStudentById(
                studentId
            );


        if (!student) {

            showMessage(
                "Student information could not be found."
            );

            return;
        }


        // =============================================
        // ONLY NUMBER IN INPUT
        // =============================================

        if (registrationInput) {

            const registration =
                String(
                    student.registrationNo ||
                    ""
                );

            // Remove KWKMA-
            const numberOnly =
                registration
                    .replace(
                        /^KWKMA-/i,
                        ""
                    );

            registrationInput.value =
                numberOnly;
        }


        if (validityInput) {

            validityInput.focus();
        }


    } catch (error) {

        console.error(
            "Auto Load Error:",
            error
        );

        showMessage(
            "Could not load student information."
        );
    }
}


// =====================================================
// CREATE CLEAN EXPORT AREA
// =====================================================

function createExportArea() {

    const wrapper =
        document.createElement("div");

    wrapper.style.position =
        "fixed";

    wrapper.style.left =
        "-100000px";

    wrapper.style.top =
        "0";

    wrapper.style.width =
        "1000px";

    wrapper.style.display =
        "flex";

    wrapper.style.flexDirection =
        "row";

    wrapper.style.alignItems =
        "flex-start";

    wrapper.style.gap =
        "40px";

    wrapper.style.padding =
        "30px";

    wrapper.style.background =
        "#ffffff";

    wrapper.style.zIndex =
        "-9999";


    const front =
        idCardFront.cloneNode(true);

    const back =
        idCardBack.cloneNode(true);


    // Make sure cloned cards
    // retain exact size.

    [front, back].forEach(card => {

        card.style.width =
            `${CARD_WIDTH}px`;

        card.style.height =
            `${CARD_HEIGHT}px`;

        card.style.minWidth =
            `${CARD_WIDTH}px`;

        card.style.minHeight =
            `${CARD_HEIGHT}px`;

        card.style.transform =
            "none";

        card.style.margin =
            "0";

        card.style.boxShadow =
            "none";
    });


    wrapper.appendChild(front);
    wrapper.appendChild(back);

    document.body.appendChild(
        wrapper
    );


    return wrapper;
}


// =====================================================
// DOWNLOAD PNG
// =====================================================

async function downloadPNG() {

    if (
        !currentStudent ||
        !idCardFront ||
        !idCardBack
    ) {

        showMessage(
            "Please generate an ID Card first."
        );

        return;
    }


    try {

        if (downloadPngBtn) {

            downloadPngBtn.disabled =
                true;

            downloadPngBtn.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Creating PNG...
            `;
        }


        // =================================================
        // CREATE EXPORT
        // =================================================

        const exportWrapper =
            createExportArea();


        // Allow browser to render
        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    150
                )
        );


        // =================================================
        // CANVAS
        // =================================================

        const canvas =
            await html2canvas(
                exportWrapper,
                {
                    scale: 3,

                    useCORS: true,

                    allowTaint: false,

                    backgroundColor:
                        "#ffffff",

                    imageTimeout:
                        15000,

                    logging:
                        false
                }
            );


        document.body.removeChild(
            exportWrapper
        );


        // =================================================
        // DOWNLOAD
        // =================================================

        const link =
            document.createElement("a");


        const registration =
            normalizeRegistration(
                currentStudent.registrationNo
            )
                .replace(
                    /[^a-zA-Z0-9-]/g,
                    ""
                );


        link.download =
            `${registration}-ID-Card.png`;


        link.href =
            canvas.toDataURL(
                "image/png",
                1.0
            );


        document.body.appendChild(
            link
        );

        link.click();

        document.body.removeChild(
            link
        );


        showMessage(
            "PNG downloaded successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "PNG Download Error:",
            error
        );

        showMessage(
            "PNG download failed."
        );


    } finally {

        if (downloadPngBtn) {

            downloadPngBtn.disabled =
                false;

            downloadPngBtn.innerHTML = `
                <i class="fa-solid fa-image"></i>
                Download PNG
            `;
        }
    }
}


// =====================================================
// DOWNLOAD PDF
// =====================================================

async function downloadPDF() {

    if (
        !currentStudent ||
        !idCardFront ||
        !idCardBack
    ) {

        showMessage(
            "Please generate an ID Card first."
        );

        return;
    }


    try {

        if (downloadPdfBtn) {

            downloadPdfBtn.disabled =
                true;

            downloadPdfBtn.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Creating PDF...
            `;
        }


        // =================================================
        // CHECK jsPDF
        // =================================================

        if (
            !window.jspdf ||
            !window.jspdf.jsPDF
        ) {

            throw new Error(
                "jsPDF library not loaded."
            );
        }


        const {
            jsPDF
        } = window.jspdf;


        // =================================================
        // CREATE EXPORT AREA
        // =================================================

        const exportWrapper =
            createExportArea();


        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    150
                )
        );


        // =================================================
        // CREATE CANVAS
        // =================================================

        const canvas =
            await html2canvas(
                exportWrapper,
                {
                    scale: 3,

                    useCORS: true,

                    allowTaint: false,

                    backgroundColor:
                        "#ffffff",

                    imageTimeout:
                        15000,

                    logging:
                        false
                }
            );


        document.body.removeChild(
            exportWrapper
        );


        // =================================================
        // IMAGE
        // =================================================

        const imageData =
            canvas.toDataURL(
                "image/png",
                1.0
            );


        // =================================================
        // CARD PHYSICAL SIZE
        // =================================================
        //
        // 2.3654 × 3.6252 inch
        //
        // Landscape A4 page
        // with both cards centered.
        // =================================================

        const cardWidthMM =
            2.3654 * 25.4;

        const cardHeightMM =
            3.6252 * 25.4;


        const pdf =
            new jsPDF({
                orientation:
                    "landscape",

                unit:
                    "mm",

                format:
                    "a4",

                compress:
                    true
            });


        const pageWidth =
            pdf.internal.pageSize
                .getWidth();

        const pageHeight =
            pdf.internal.pageSize
                .getHeight();


        // =================================================
        // GAP
        // =================================================

        const gap =
            8;


        // Total width

        const totalWidth =
            cardWidthMM * 2 +
            gap;


        // Starting X

        const startX =
            (
                pageWidth -
                totalWidth
            ) / 2;


        const startY =
            (
                pageHeight -
                cardHeightMM
            ) / 2;


        // =================================================
        // FRONT IMAGE
        // =================================================
        //
        // Canvas contains both cards.
        // Calculate each half.
        // =================================================

        const halfCanvasWidth =
            canvas.width / 2;


        const cardCanvasHeight =
            canvas.height;


        const frontCanvas =
            document.createElement(
                "canvas"
            );

        frontCanvas.width =
            halfCanvasWidth;

        frontCanvas.height =
            cardCanvasHeight;


        const frontContext =
            frontCanvas.getContext(
                "2d"
            );


        frontContext.drawImage(
            canvas,

            0,
            0,
            halfCanvasWidth,
            cardCanvasHeight,

            0,
            0,
            halfCanvasWidth,
            cardCanvasHeight
        );


        // =================================================
        // BACK IMAGE
        // =================================================

        const backCanvas =
            document.createElement(
                "canvas"
            );

        backCanvas.width =
            halfCanvasWidth;

        backCanvas.height =
            cardCanvasHeight;


        const backContext =
            backCanvas.getContext(
                "2d"
            );


        backContext.drawImage(
            canvas,

            canvas.width -
                halfCanvasWidth,
            0,

            halfCanvasWidth,
            cardCanvasHeight,

            0,
            0,

            halfCanvasWidth,
            cardCanvasHeight
        );


        const frontData =
            frontCanvas.toDataURL(
                "image/png",
                1.0
            );


        const backData =
            backCanvas.toDataURL(
                "image/png",
                1.0
            );


        // =================================================
        // ADD FRONT
        // =================================================

        pdf.addImage(
            frontData,
            "PNG",

            startX,
            startY,

            cardWidthMM,
            cardHeightMM,

            undefined,
            "FAST"
        );


        // =================================================
        // ADD BACK
        // =================================================

        pdf.addImage(
            backData,
            "PNG",

            startX +
                cardWidthMM +
                gap,

            startY,

            cardWidthMM,
            cardHeightMM,

            undefined,
            "FAST"
        );


        // =================================================
        // FILE NAME
        // =================================================

        const registration =
            normalizeRegistration(
                currentStudent.registrationNo
            )
                .replace(
                    /[^a-zA-Z0-9-]/g,
                    ""
                );


        pdf.save(
            `${registration}-ID-Card.pdf`
        );


        showMessage(
            "PDF downloaded successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "PDF Download Error:",
            error
        );

        showMessage(
            "PDF download failed."
        );


    } finally {

        if (downloadPdfBtn) {

            downloadPdfBtn.disabled =
                false;

            downloadPdfBtn.innerHTML = `
                <i class="fa-solid fa-file-pdf"></i>
                Download PDF
            `;
        }
    }
}


// =====================================================
// PNG BUTTON
// =====================================================

if (downloadPngBtn) {

    downloadPngBtn.addEventListener(
        "click",
        downloadPNG
    );
}


// =====================================================
// PDF BUTTON
// =====================================================

if (downloadPdfBtn) {

    downloadPdfBtn.addEventListener(
        "click",
        downloadPDF
    );
}


// =====================================================
// INITIAL CARD SETUP
// =====================================================

if (idCardFront) {

    prepareCard(
        idCardFront,
        FRONT_TEMPLATE
    );
}


if (idCardBack) {

    prepareCard(
        idCardBack,
        BACK_TEMPLATE
    );
}


// =====================================================
// START
// =====================================================

autoLoadStudent();