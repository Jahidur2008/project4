import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// =====================================================
// CONFIG — field names & belt template mapping.
// Only "yellow" has an image right now — add the rest to
// images/ using the same "{Belt}_Certificate.jpg" naming
// and they'll work immediately, no other code changes needed.
// =====================================================

const MARKS_FIELD = "marks"; // change this if your belts subcollection uses a different field name

// Exact belt label used in Firestore's beltHistory entries (e.g. "Yellow Belt")
const BELT_LABELS = {
    yellow: "Yellow Belt",
    orange: "Orange Belt",
    green:  "Green Belt",
    blue:   "Blue Belt",
    brown:  "Brown Belt",
    black:  "Black Belt"
};

const BELT_TEMPLATES = {
    yellow: "./images/Yellow_Certificate.jpg",
    orange: "./images/Orange_Certificate.jpg",
    green:  "./images/Green_Certificate.jpg",
    blue:   "./images/Blue_Certificate.jpg",
    brown:  "./images/Brown_Certificate.jpg",
    black:  "./images/Black_Certificate.jpg"
};

const CARD_WIDTH = 1536;
const CARD_HEIGHT = 1024;


// =====================================================
// ELEMENTS
// =====================================================

const registrationInput = document.getElementById("registrationInput");
const beltSelect = document.getElementById("beltSelect");
const generateBtn = document.getElementById("generateBtn");
const resetBtn = document.getElementById("resetBtn");
const messageBox = document.getElementById("messageBox");
const previewSection = document.getElementById("previewSection");
const downloadPngBtn = document.getElementById("downloadPngBtn");
const downloadPdfBtn = document.getElementById("downloadPdfBtn");
const certificate = document.getElementById("certificate");


// =====================================================
// STATE
// =====================================================

let currentStudent = null;
let currentBeltKey = "";
let currentMarks = "";


// =====================================================
// MESSAGE
// =====================================================

function showMessage(message, type = "error") {
    if (!messageBox) return;
    messageBox.textContent = message;
    messageBox.className = `message-box ${type}`;
}

function hideMessage() {
    if (!messageBox) return;
    messageBox.className = "message-box hidden";
}


// =====================================================
// NORMALIZE REGISTRATION (same convention as id-card.js)
// =====================================================

function normalizeRegistration(value) {
    let registration = String(value || "").trim();
    if (!registration) return "";
    if (registration.toUpperCase().startsWith("KWKMA-")) {
        return registration.toUpperCase();
    }
    return `KWKMA-${registration}`;
}


// =====================================================
// FIND STUDENT BY REGISTRATION ID
// =====================================================

async function findStudentByRegistration(registrationNo) {
    const searchValue = String(registrationNo || "").trim().toLowerCase();
    if (!searchValue) return null;

    const snapshot = await getDocs(collection(db, "students"));

    for (const studentDoc of snapshot.docs) {
        const data = studentDoc.data();
        const studentRegistration =
            String(data.registrationNo || "").trim().toLowerCase();

        if (studentRegistration === searchValue) {
            return { id: studentDoc.id, ...data };
        }
    }

    return null;
}


// =====================================================
// GET MARKS FOR A BELT
// Reads from the student's own "beltHistory" array field
// (each entry looks like: { belt: "Yellow Belt", mark: 85, ... })
// =====================================================

function getBeltMarks(student, beltKey) {

    const beltLabel = BELT_LABELS[beltKey];

    if (!beltLabel) {
        return null;
    }

    const history =
        Array.isArray(student.beltHistory)
            ? student.beltHistory
            : [];

    // search from the end so a retake's latest mark wins
    for (let i = history.length - 1; i >= 0; i--) {

        const entry = history[i];

        if (entry && entry.belt === beltLabel) {

            return (entry.mark !== undefined && entry.mark !== null)
                ? entry.mark
                : null;
        }
    }

    return null;
}


// =====================================================
// PREPARE CARD CONTAINER
// =====================================================

function prepareCertificate(card, template) {
    if (!card) return;

    card.innerHTML = "";

    card.style.width = `${CARD_WIDTH}px`;
    card.style.height = `${CARD_HEIGHT}px`;
    card.style.position = "relative";
    card.style.overflow = "hidden";
    card.style.background = "#111";
    card.style.margin = "0";
    card.style.padding = "0";
    card.style.flexShrink = "0";

    card.style.backgroundImage = `url("${template}")`;
    card.style.backgroundSize = "100% 100%";
    card.style.backgroundPosition = "center";
    card.style.backgroundRepeat = "no-repeat";
}


// =====================================================
// TEXT OVERLAY HELPER
// =====================================================

function createText(parent, text, options = {}) {
    const el = document.createElement("div");

    el.textContent = text || "";

    el.style.position = "absolute";
    el.style.boxSizing = "border-box";
    el.style.left = options.left || "0";
    el.style.top = options.top || "0";
    el.style.width = options.width || "auto";
    el.style.height = options.height || "auto";
    el.style.display = "flex";
    el.style.alignItems = options.alignItems || "center";
    el.style.justifyContent = options.justifyContent || "flex-start";
    el.style.fontFamily = options.fontFamily || "Georgia, 'Times New Roman', serif";
    el.style.fontSize = options.fontSize || "26px";
    el.style.fontWeight = options.fontWeight || "700";
    el.style.fontStyle = options.fontStyle || "normal";
    el.style.color = options.color || "#2a1c10";
    el.style.whiteSpace = options.whiteSpace || "nowrap";
    el.style.zIndex = options.zIndex || "auto";
    el.style.overflow = "hidden";

    parent.appendChild(el);
    return el;
}


// =====================================================
// BUILD CERTIFICATE
// =====================================================

function buildCertificate(student, beltKey, marks) {
    if (!certificate) return;

    const template = BELT_TEMPLATES[beltKey];

    if (!template) {
        showMessage(`"${beltKey}" belt এর জন্য এখনো কোনো certificate template যোগ করা হয়নি।`);
        return;
    }

    prepareCertificate(certificate, template);

    // ---------- NAME (on the blank line under "This is to certify that") ----------
function toTitleCase(str) {
    return String(str || "")
        .toLowerCase()
        .replace(/\b\w/g, ch => ch.toUpperCase());
}

// ব্যবহার:
const studentName = toTitleCase(student.name || "STUDENT NAME");


    createText(certificate, studentName, {
        left: "415px",
        top: "277px",
        width: "620px",
        height: "100px",
        justifyContent: "center",
        alignItems: "flex-end",
        fontFamily: "OPTIOldFashionedScript",
        textTransform: "capitalize",
        fontSize: "75px",
        fontWeight: "400",
        fontStyle: "normal",
    });

    // ---------- REGISTRATION NO. ----------
    const registration = normalizeRegistration(student.registrationNo);

    createText(certificate, registration, {
        left: "1270px",
        top: "338px",
        width: "160px",
        height: "32px",
        fontFamily:"FELIXTI",
        justifyContent: "flex-start",
        fontSize: "24px",
        fontWeight: "600"
    });

    // ---------- MARKS ----------
    const marksText = (marks === null || marks === undefined || marks === "")
        ? "-"
        : String(marks);

    createText(certificate, marksText, {
        left: "473px",
        top: "493px",
        width: "85px",
        height: "36px",
        justifyContent: "center",
        fontFamily:"cataneo-bt",
        fontSize: "30px",
        fontWeight: "400"

    });
}


// =====================================================
// DISPLAY
// =====================================================

function displayCertificate(student, beltKey, marks) {
    currentStudent = student;
    currentBeltKey = beltKey;
    currentMarks = marks;

    buildCertificate(student, beltKey, marks);

    if (previewSection) {
        previewSection.classList.remove("hidden");
    }

    setTimeout(() => {
        if (previewSection) {
            previewSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, 100);
}


// =====================================================
// GENERATE
// =====================================================

async function generateCertificate() {
    hideMessage();

    const registrationValue = registrationInput?.value.trim();
    const beltKey = beltSelect?.value;

    if (!registrationValue) {
        showMessage("Please enter the Registration ID.");
        registrationInput?.focus();
        return;
    }

    if (!beltKey) {
        showMessage("Please select a belt.");
        beltSelect?.focus();
        return;
    }

    const registrationNo = normalizeRegistration(registrationValue);

    if (generateBtn) {
        generateBtn.disabled = true;
        generateBtn.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Loading...
        `;
    }

    try {
        const student = await findStudentByRegistration(registrationNo);

        if (!student) {
            showMessage(`No student found with Registration ID "${registrationNo}".`);
            return;
        }


        const marks = getBeltMarks(student, beltKey);

        if (marks === null) {
            showMessage(
                `"${registrationNo}" এর জন্য "${beltKey}" belt এ কোনো মার্ক পাওয়া যায়নি — certificate marks ছাড়া দেখানো হচ্ছে।`,
                "error"
            );
        }

        displayCertificate(student, beltKey, marks);

        if (marks !== null) {
            showMessage("Certificate generated successfully.", "success");
        }

    } catch (error) {
        console.error("Generate Certificate Error:", error);
        showMessage("Could not load certificate. Please try again.");

    } finally {
        if (generateBtn) {
            generateBtn.disabled = false;
            generateBtn.innerHTML = `
                <i class="fa-solid fa-wand-magic-sparkles"></i>
                Generate Certificate
            `;
        }
    }
}

if (generateBtn) {
    generateBtn.addEventListener("click", generateCertificate);
}

if (registrationInput) {
    registrationInput.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            event.preventDefault();
            generateCertificate();
        }
    });
}


// =====================================================
// RESET
// =====================================================

if (resetBtn) {
    resetBtn.addEventListener("click", () => {
        if (registrationInput) registrationInput.value = "";
        if (beltSelect) beltSelect.value = "";

        currentStudent = null;
        currentBeltKey = "";
        currentMarks = "";

        hideMessage();

        if (previewSection) {
            previewSection.classList.add("hidden");
        }

        if (certificate) {
            certificate.innerHTML = "";
        }

        registrationInput?.focus();
    });
}


// =====================================================
// OFFSCREEN CLONE (native-size capture for reliable export)
// =====================================================

function createOffscreenClone(cardElement) {
    const wrapper = document.createElement("div");
    wrapper.style.position = "fixed";
    wrapper.style.left = "-100000px";
    wrapper.style.top = "0";
    wrapper.style.zIndex = "-9999";
    wrapper.style.background = "#ffffff";

    const clone = cardElement.cloneNode(true);
    clone.style.width = `${CARD_WIDTH}px`;
    clone.style.height = `${CARD_HEIGHT}px`;
    clone.style.minWidth = `${CARD_WIDTH}px`;
    clone.style.minHeight = `${CARD_HEIGHT}px`;
    clone.style.transform = "none";
    clone.style.margin = "0";
    clone.style.boxShadow = "none";

    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    return { wrapper, clone };
}

function waitForImagesToLoad(container, timeoutMs = 8000) {
    const images = Array.from(container.querySelectorAll("img"));
    if (images.length === 0) return Promise.resolve();

    const promises = images.map(img => {
        if (img.complete && img.naturalWidth > 0) return Promise.resolve();
        return new Promise(resolve => {
            const done = () => resolve();
            img.addEventListener("load", done, { once: true });
            img.addEventListener("error", done, { once: true });
            setTimeout(done, timeoutMs);
        });
    });

    return Promise.all(promises);
}


// =====================================================
// DOWNLOAD PNG
// =====================================================

async function downloadPNG() {
    if (!currentStudent || !certificate || !certificate.innerHTML) {
        showMessage("Please generate a certificate first.");
        return;
    }

    try {
        if (downloadPngBtn) {
            downloadPngBtn.disabled = true;
            downloadPngBtn.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Creating PNG...
            `;
        }

        const registration = normalizeRegistration(currentStudent.registrationNo)
            .replace(/[^a-zA-Z0-9-]/g, "");

        const html2canvasOptions = {
            scale: 2,
            useCORS: true,
            allowTaint: false,
            backgroundColor: "#ffffff",
            imageTimeout: 15000,
            logging: false
        };

        const clone = createOffscreenClone(certificate);
        await waitForImagesToLoad(clone.clone);
        await new Promise(resolve => setTimeout(resolve, 150));

        const canvas = await html2canvas(clone.clone, html2canvasOptions);
        document.body.removeChild(clone.wrapper);

        const link = document.createElement("a");
        link.download = `${registration}-${currentBeltKey}-Certificate.png`;
        link.href = canvas.toDataURL("image/png", 1.0);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showMessage("Certificate PNG downloaded.", "success");

    } catch (error) {
        console.error("PNG Download Error:", error);
        showMessage("PNG download failed.");

    } finally {
        if (downloadPngBtn) {
            downloadPngBtn.disabled = false;
            downloadPngBtn.innerHTML = `
                <i class="fa-solid fa-image"></i>
                Download PNG
            `;
        }
    }
}

if (downloadPngBtn) {
    downloadPngBtn.addEventListener("click", downloadPNG);
}


// =====================================================
// DOWNLOAD PDF
// =====================================================

async function downloadPDF() {
    if (!currentStudent || !certificate || !certificate.innerHTML) {
        showMessage("Please generate a certificate first.");
        return;
    }

    try {
        if (downloadPdfBtn) {
            downloadPdfBtn.disabled = true;
            downloadPdfBtn.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Creating PDF...
            `;
        }

        if (!window.jspdf || !window.jspdf.jsPDF) {
            throw new Error("jsPDF library not loaded.");
        }

        const { jsPDF } = window.jspdf;

        const html2canvasOptions = {
            scale: 2,
            useCORS: true,
            allowTaint: false,
            backgroundColor: "#ffffff",
            imageTimeout: 15000,
            logging: false
        };

        const clone = createOffscreenClone(certificate);
        await waitForImagesToLoad(clone.clone);
        await new Promise(resolve => setTimeout(resolve, 150));

        const canvas = await html2canvas(clone.clone, html2canvasOptions);
        document.body.removeChild(clone.wrapper);

        const imageData = canvas.toDataURL("image/png", 1.0);

        // certificate is landscape — A4 landscape, full page with margin
        const pdf = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4",
            compress: true
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const margin = 10;
        const availableWidth = pageWidth - margin * 2;
        const availableHeight = pageHeight - margin * 2;

        // maintain 1536:1024 (3:2) ratio within available space
        const ratio = CARD_WIDTH / CARD_HEIGHT;
        let drawWidth = availableWidth;
        let drawHeight = drawWidth / ratio;

        if (drawHeight > availableHeight) {
            drawHeight = availableHeight;
            drawWidth = drawHeight * ratio;
        }

        const startX = (pageWidth - drawWidth) / 2;
        const startY = (pageHeight - drawHeight) / 2;

        pdf.addImage(imageData, "PNG", startX, startY, drawWidth, drawHeight, undefined, "FAST");

        const registration = normalizeRegistration(currentStudent.registrationNo)
            .replace(/[^a-zA-Z0-9-]/g, "");

        pdf.save(`${registration}-${currentBeltKey}-Certificate.pdf`);

        showMessage("Certificate PDF downloaded.", "success");

    } catch (error) {
        console.error("PDF Download Error:", error);
        showMessage("PDF download failed.");

    } finally {
        if (downloadPdfBtn) {
            downloadPdfBtn.disabled = false;
            downloadPdfBtn.innerHTML = `
                <i class="fa-solid fa-file-pdf"></i>
                Download PDF
            `;
        }
    }
}

if (downloadPdfBtn) {
    downloadPdfBtn.addEventListener("click", downloadPDF);
}


// =====================================================
// BACK BUTTON
// =====================================================

const backBtn = document.getElementById("backBtn");

if (backBtn) {
    backBtn.addEventListener("click", () => {
        if (document.referrer && document.referrer.includes(window.location.origin)) {
            window.history.back();
        } else {
            window.location.href = "dashboard.html";
        }
    });
}