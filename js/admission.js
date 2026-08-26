import { db } from "./firebase.js";

import {
    collection,
    doc,
    runTransaction,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// =====================================================
// CLOUDINARY CONFIG
// =====================================================

const CLOUDINARY_CLOUD_NAME = "dcaloytg";
const CLOUDINARY_UPLOAD_PRESET = "KWKMA_ST_image";

const CLOUDINARY_UPLOAD_URL =
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

// =====================================================
// GET FORM VALUE
// =====================================================

function getValue(id) {

    const element =
        document.getElementById(id);

    if (!element) {
        return "";
    }

    return element.value?.trim().toUpperCase() || "";
}

const training =
    [...document.querySelectorAll(
        'input[name="training"]:checked'
    )].map(
        item => item.value.toUpperCase()
    );

const sex =
    (
        document.querySelector(
            'input[name="sex"]:checked'
        )?.value || ""
    ).toUpperCase();

const contribution =
    (
        document.querySelector(
            'input[name="contribution"]:checked'
        )?.value || ""
    ).toUpperCase();




// =====================================================
// ELEMENTS
// =====================================================

const form = document.getElementById("admissionForm");
const submitBtn = document.getElementById("submitBtn");
const message = document.getElementById("message");


// =====================================================
// GENERATE REGISTRATION NUMBER + CREATE STUDENT
// =====================================================

async function createStudent(studentData) {

    const counterRef =
        doc(
            db,
            "settings",
            "registrationCounter"
        );

    const studentRef =
        doc(
            collection(
                db,
                "students"
            )
        );

    let registrationNumber = "";

    await runTransaction(
        db,
        async (transaction) => {

            const counterSnap =
                await transaction.get(
                    counterRef
                );

            let lastNumber = 0;

            if (
                counterSnap.exists()
            ) {

                lastNumber =
                    counterSnap.data()
                        .lastNumber || 0;

            }

            const nextNumber =
                lastNumber + 1;


            registrationNumber =
                `KWKMA-${String(nextNumber).padStart(2, "0")}`;


            // =====================================
            // UPDATE REGISTRATION COUNTER
            // =====================================

            transaction.set(
                counterRef,
                {
                    lastNumber:
                        nextNumber,

                    updatedAt:
                        serverTimestamp()
                }
            );


            // =====================================
            // SAVE STUDENT
            // =====================================

            transaction.set(
                studentRef,
                {

                    ...studentData,

                    registrationNo:
                        registrationNumber,

                    status:
                        "pending",


                    // =================================
                    // BELT MANAGEMENT
                    // =================================

                    // Admission-এর সময় সবাই
                    // automatically Red Belt পাবে

                    belt:
                        "Red Belt",

                    lastExamMark:
                        null,

                    lastExamResult:
                        null,

                    lastExamDate:
                        null,

                    previousBelt:
                        null,

                    beltPromotedAt:
                        null,

                    beltHistory:
                        [],


                    // =================================
                    // CREATED DATE
                    // =================================

                    createdAt:
                        serverTimestamp()

                }
            );

        }
    );


    return registrationNumber;

}
// =====================================================
// COMPRESS IMAGE TO MAX 100KB
// =====================================================

async function compressImageTo100KB(file) {

    const maxSize = 100 * 1024; // 100KB

    // Already below 100KB
    if (file.size <= maxSize) {
        return file;
    }

    return new Promise((resolve, reject) => {

        const img = new Image();
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const objectURL = URL.createObjectURL(file);

        img.onload = () => {

            URL.revokeObjectURL(objectURL);

            let width = img.width;
            let height = img.height;

            // Maximum dimension
            const maxDimension = 1200;

            if (width > maxDimension || height > maxDimension) {

                if (width > height) {

                    height = Math.round(
                        (height * maxDimension) / width
                    );

                    width = maxDimension;

                } else {

                    width = Math.round(
                        (width * maxDimension) / height
                    );

                    height = maxDimension;
                }
            }

            canvas.width = width;
            canvas.height = height;

            ctx.drawImage(
                img,
                0,
                0,
                width,
                height
            );

            let quality = 0.9;

            function compress() {

                canvas.toBlob(
                    (blob) => {

                        if (!blob) {

                            reject(
                                new Error(
                                    "Image compression failed."
                                )
                            );

                            return;
                        }

                        // Successfully below 100KB
                        if (
                            blob.size <= maxSize ||
                            quality <= 0.1
                        ) {

                            if (blob.size > maxSize) {

                                reject(
                                    new Error(
                                        "Image could not be compressed below 100KB."
                                    )
                                );

                                return;
                            }

                            const compressedFile =
                                new File(
                                    [blob],
                                    "student-photo.jpg",
                                    {
                                        type: "image/jpeg",
                                        lastModified: Date.now()
                                    }
                                );

                            resolve(compressedFile);

                        } else {

                            quality -= 0.1;

                            compress();
                        }
                    },
                    "image/jpeg",
                    quality
                );
            }

            compress();
        };

        img.onerror = () => {

            URL.revokeObjectURL(objectURL);

            reject(
                new Error(
                    "Unable to load image."
                )
            );
        };

        img.src = objectURL;
    });
}


// =====================================================
// FORM SUBMIT
// =====================================================

if (form) {

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        // =============================================
        // GET PHOTO
        // =============================================

        const photoInput =
            document.getElementById("photo");

        const photoFile =
            photoInput?.files?.[0] || null;


        // =============================================
        // PHOTO REQUIRED
        // =============================================

        if (!photoFile) {

            if (message) {
                message.textContent =
                    "Please upload your photo before submitting.";

                message.style.color =
                    "#c51a30";
            }

            if (photoInput) {
                photoInput.focus();
            }

            return;
        }


        // =============================================
        // IMAGE TYPE CHECK
        // =============================================

        if (!photoFile.type.startsWith("image/")) {

            if (message) {
                message.textContent =
                    "Please select a valid image file.";

                message.style.color =
                    "#c51a30";
            }

            return;
        }


        // =============================================
        // BUTTON DISABLE
        // =============================================

        if (submitBtn) {

            submitBtn.disabled = true;

            submitBtn.textContent =
                "Uploading photo...";
        }


        if (message) {

            message.textContent = "";

            message.style.color = "";
        }


        try {

            // =============================================
            // COMPRESS IMAGE TO MAX 100KB
            // =============================================

            if (submitBtn) {
                submitBtn.textContent =
                    "Compressing photo...";
            }

            const compressedImage =
                await compressImageTo100KB(
                    photoFile
                );


            // =============================================
            // FINAL SIZE CHECK
            // =============================================

            if (
                !compressedImage ||
                compressedImage.size > 100 * 1024
            ) {

                throw new Error(
                    "Image could not be compressed below 100KB."
                );
            }


            // =============================================
// UPLOAD PHOTO TO CLOUDINARY
// =============================================

if (submitBtn) {
    submitBtn.textContent =
        "Uploading photo...";
}

const cloudinaryFormData = new FormData();

cloudinaryFormData.append(
    "file",
    compressedImage
);

cloudinaryFormData.append(
    "upload_preset",
    CLOUDINARY_UPLOAD_PRESET
);


// =============================================
// CLOUDINARY UPLOAD
// =============================================

const cloudinaryResponse =
    await fetch(
        CLOUDINARY_UPLOAD_URL,
        {
            method: "POST",
            body: cloudinaryFormData
        }
    );


// =============================================
// CHECK UPLOAD RESPONSE
// =============================================

if (!cloudinaryResponse.ok) {

    const errorData =
        await cloudinaryResponse.json()
            .catch(() => ({}));

    console.error(
        "Cloudinary Error:",
        errorData
    );

    throw new Error(
        errorData?.error?.message ||
        "Photo upload failed."
    );
}


// =============================================
// GET CLOUDINARY RESULT
// =============================================

const cloudinaryData =
    await cloudinaryResponse.json();


// =============================================
// PHOTO URL
// =============================================

const photoURL =
    cloudinaryData.secure_url;

if (!photoURL) {

    throw new Error(
        "Cloudinary photo URL was not received."
    );
}

console.log(
    "Cloudinary Photo URL:",
    photoURL
);
            // =============================================
            // TRAINING
            // =============================================

            const training =
                [
                    ...document.querySelectorAll(
                        'input[name="training"]:checked'
                    )
                ].map(
                    item => item.value
                );


            // =============================================
            // SEX / GENDER
            // =============================================

            const sex =
                document.querySelector(
                    'input[name="sex"]:checked'
                )?.value || "";


            // =============================================
            // CONTRIBUTION
            // =============================================

            const contribution =
                document.querySelector(
                    'input[name="contribution"]:checked'
                )?.value || "";


            // =============================================
            // STUDENT DATA
            // =============================================

            const studentData = {

                name:
                    getValue("name"),

                fatherName:
                    getValue("fatherName"),

                motherName:
                    getValue("motherName"),

                presentAddress:
                    getValue("presentAddress"),

                permanentAddress:
                    getValue("permanentAddress"),

                occupation:
                    getValue("occupation"),

                dob:
                    getValue("dob"),

                sex:
                    sex ||
                    getValue("sex"),

                bloodGroup:
                    getValue("bloodGroup"),

                religion:
                    getValue("religion"),

                nationality:
                    getValue("nationality") ||
                    "Bangladeshi",

                mobile:
                    getValue("mobile"),

                email:
                    getValue("email"),

                education:
                    getValue("education"),

                maritalStatus:
                    getValue("maritalStatus"),

                previousMartialArtsExperience:
                    getValue(
                        "previousMartialArtsExperience"
                    ),

                previousBeltRank:
                    getValue(
                        "previousBeltRank"
                    ),

                training,

                contribution,

                photoURL

            };


            // =============================================
            // SAVE STUDENT TO FIRESTORE
            // =============================================

            if (submitBtn) {

                submitBtn.textContent =
                    "Saving admission...";
            }


            const registrationNo =
                await createStudent(
                    studentData
                );


            // =============================================
            // SHOW REGISTRATION COPY
            // =============================================

            showRegistrationCopy(
                registrationNo,
                studentData
            );


        } catch (error) {

            console.error(
                "Admission Error:",
                error
            );


            if (message) {

                message.textContent =
                    "Admission failed: " +
                    error.message;

                message.style.color =
                    "#c51a30";
            }


            if (submitBtn) {

                submitBtn.disabled =
                    false;

                submitBtn.textContent =
                    "Submit Admission";
            }

        }

    });

}

// =====================================================
// SHOW REGISTRATION COPY
// =====================================================

function showRegistrationCopy(
    registrationNo,
    data
) {

    setText(
        "resultRegNo",
        registrationNo
    );

    setText(
        "resultName",
        data.name
    );

    setText(
        "resultFather",
        data.fatherName
    );

    setText(
        "resultMother",
        data.motherName
    );

    setText(
        "resultDob",
        data.dob
    );

    setText(
        "resultSex",
        data.sex || "-"
    );

    setText(
        "resultBlood",
        data.bloodGroup || "-"
    );

    setText(
        "resultReligion",
        data.religion || "-"
    );

    setText(
        "resultNationality",
        data.nationality || "Bangladeshi"
    );

    setText(
        "resultMobile",
        data.mobile
    );

    setText(
        "resultEmail",
        data.email || "-"
    );

    setText(
        "resultPresent",
        data.presentAddress
    );

    setText(
        "resultPermanent",
        data.permanentAddress
    );

    setText(
        "resultEducation",
        data.education || "-"
    );

    setText(
        "resultMarital",
        data.maritalStatus || "-"
    );

    setText(
        "resultOccupation",
        data.occupation || "-"
    );

    setText(
        "resultExperience",
        data.previousMartialArtsExperience || "-"
    );

    setText(
        "resultBeltRank",
        data.previousBeltRank || "-"
    );

    setText(
        "resultTraining",
        data.training?.length
            ? data.training.join(", ")
            : "-"
    );

    setText(
        "resultContribution",
        data.contribution || "-"
    );


    // =================================================
    // RESULT PHOTO
    // =================================================

    const resultPhoto =
        document.getElementById("resultPhoto");

    if (
        resultPhoto &&
        data.photoURL
    ) {

        resultPhoto.src =
            data.photoURL;

        resultPhoto.style.display =
            "block";
    }


    // =================================================
    // HIDE FORM
    // =================================================

    const page =
        document.querySelector(".page");

    if (page) {
        page.classList.add("hidden");
    }


    // =================================================
    // SHOW RESULT
    // =================================================

    const registrationResult =
        document.getElementById(
            "registrationResult"
        );

    if (registrationResult) {

        registrationResult.classList.remove(
            "hidden"
        );
    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// =====================================================
// SET TEXT SAFELY
// =====================================================

function setText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {

        element.textContent =
            value ?? "-";
    }
}


// =====================================================
// PHOTO PREVIEW
// =====================================================

const photoInput =
    document.getElementById("photo");

const studentPhoto =
    document.getElementById("studentPhoto");

const photoPlaceholder =
    document.getElementById(
        "photoPlaceholder"
    );

const studentInfoPhoto =
    document.getElementById(
        "studentInfoPhoto"
    );

const studentInfoPhotoPlaceholder =
    document.getElementById(
        "studentInfoPhotoPlaceholder"
    );


if (photoInput) {

    photoInput.addEventListener(
        "change",
        function () {

            const file =
                this.files?.[0];

            if (!file) {
                return;
            }


            // Check image
            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                alert(
                    "Please select a valid image file."
                );

                this.value = "";

                return;
            }


           
// MAX PHOTO SIZE: 100KB
if (file.size > 100 * 1024) {

    alert(
        "Image size must be 100KB or less."
    );

    this.value = "";

    // Reset preview
    if (studentPhoto) {
        studentPhoto.src = "";
        studentPhoto.style.display = "none";
    }

    if (photoPlaceholder) {
        photoPlaceholder.style.display = "flex";
    }

    if (studentInfoPhoto) {
        studentInfoPhoto.src = "";
        studentInfoPhoto.style.display = "none";
    }

    if (studentInfoPhotoPlaceholder) {
        studentInfoPhotoPlaceholder.style.display = "flex";
    }

    return;
}


            const reader =
                new FileReader();


            reader.onload =
                function (event) {

                    const imageURL =
                        event.target.result;


                    // =================================
                    // HEADER PHOTO
                    // =================================

                    if (studentPhoto) {

                        studentPhoto.src =
                            imageURL;

                        studentPhoto.style.display =
                            "block";
                    }

                    if (photoPlaceholder) {

                        photoPlaceholder.style.display =
                            "none";
                    }


                    // =================================
                    // STUDENT INFORMATION PHOTO
                    // =================================

                    if (studentInfoPhoto) {

                        studentInfoPhoto.src =
                            imageURL;

                        studentInfoPhoto.style.display =
                            "block";
                    }

                    if (
                        studentInfoPhotoPlaceholder
                    ) {

                        studentInfoPhotoPlaceholder.style.display =
                            "none";
                    }

                };


            reader.readAsDataURL(file);

        }
    );

}


// =====================================================
// PREMIUM CUSTOM DROPDOWNS
// =====================================================

const customSelects =
    document.querySelectorAll(
        ".custom-select"
    );


customSelects.forEach(
    (select) => {

        const trigger =
            select.querySelector(
                ".select-trigger"
            );

        const text =
            select.querySelector(
                ".select-text"
            );

        const hiddenInput =
            select.querySelector(
                "input[type='hidden']"
            );

        const options =
            select.querySelectorAll(
                ".select-option"
            );


        // No trigger = skip
        if (!trigger) {
            return;
        }


        // =============================================
        // OPEN / CLOSE
        // =============================================

        trigger.addEventListener(
            "click",
            (e) => {

                e.stopPropagation();


                customSelects.forEach(
                    (other) => {

                        if (
                            other !== select
                        ) {

                            other.classList.remove(
                                "open"
                            );
                        }

                    }
                );


                select.classList.toggle(
                    "open"
                );

            }
        );


        // =============================================
        // SELECT OPTION
        // =============================================

        options.forEach(
            (option) => {

                option.addEventListener(
                    "click",
                    (e) => {

                        e.stopPropagation();


                        const value =
                            option.dataset.value ||
                            "";


                        const labelElement =
                            option.querySelector(
                                "span:last-child"
                            );


                        const label =
                            labelElement
                                ? labelElement.textContent.trim()
                                : value;


                        // Save value
                        if (hiddenInput) {

                            hiddenInput.value =
                                value;
                        }


                        // Show selected text
                        if (text) {

                            text.textContent =
                                label;
                        }


                        // Selected class
                        options.forEach(
                            (item) => {

                                item.classList.remove(
                                    "selected"
                                );

                            }
                        );


                        option.classList.add(
                            "selected"
                        );


                        // Close
                        select.classList.remove(
                            "open"
                        );

                    }
                );

            }
        );

    }
);


// =====================================================
// CLOSE ALL DROPDOWNS
// =====================================================

document.addEventListener(
    "click",
    () => {

        customSelects.forEach(
            (select) => {

                select.classList.remove(
                    "open"
                );

            }
        );

    }
);


// ======================================
// CLOSE / NEW ADMISSION
// ======================================

const backToAdmission =
    document.getElementById("backToAdmission");


// ======================================
// SAME AS PRESENT ADDRESS
// ======================================

const sameAsPresent =
    document.getElementById("sameAsPresent");

const presentAddress =
    document.getElementById("presentAddress");

const permanentAddress =
    document.getElementById("permanentAddress");


// ======================================
// SAME ADDRESS CHECKBOX
// ======================================

if (
    sameAsPresent &&
    presentAddress &&
    permanentAddress
) {

    sameAsPresent.addEventListener(
        "change",
        function () {

            if (this.checked) {

                permanentAddress.value =
                    presentAddress.value;

                permanentAddress.readOnly = true;

                permanentAddress.style.opacity =
                    "0.65";

            } else {

                permanentAddress.value = "";

                permanentAddress.readOnly = false;

                permanentAddress.style.opacity =
                    "1";
            }

        }
    );


    // Present Address লিখলে Permanent Address-এও যাবে

    presentAddress.addEventListener(
        "input",
        function () {

            if (sameAsPresent.checked) {

                permanentAddress.value =
                    this.value;

            }

        }
    );

}


// ======================================
// CLOSE REGISTRATION POPUP
// ======================================

if (backToAdmission) {

    backToAdmission.addEventListener(
        "click",
        function (e) {

            e.preventDefault();

            e.stopPropagation();

            // পুরো form reset
            if (form) {
                form.reset();
            }


            // ==============================
            // RESET CUSTOM DROPDOWNS
            // ==============================

            customSelects.forEach(
                (select) => {

                    const hiddenInput =
                        select.querySelector(
                            "input[type='hidden']"
                        );

                    const text =
                        select.querySelector(
                            ".select-text"
                        );

                    const options =
                        select.querySelectorAll(
                            ".select-option"
                        );


                    if (hiddenInput) {
                        hiddenInput.value = "";
                    }


                    if (text) {

                        text.textContent =
                            text.dataset.default ||
                            "Select";

                    }


                    options.forEach(
                        (option) => {

                            option.classList.remove(
                                "selected"
                            );

                        }
                    );


                    select.classList.remove(
                        "open"
                    );

                }
            );


            // ==============================
            // RESET ADDRESS
            // ==============================

            if (sameAsPresent) {
                sameAsPresent.checked = false;
            }

            if (presentAddress) {
                presentAddress.value = "";
            }

            if (permanentAddress) {

                permanentAddress.value = "";

                permanentAddress.readOnly =
                    false;

                permanentAddress.style.opacity =
                    "1";
            }


            // ==============================
            // RESET PHOTO
            // ==============================

            if (photoInput) {

                photoInput.value = "";

            }

            if (studentPhoto) {

                studentPhoto.src = "";

                studentPhoto.style.display =
                    "none";
            }

            if (photoPlaceholder) {

                photoPlaceholder.style.display =
                    "flex";
            }

            if (studentInfoPhoto) {

                studentInfoPhoto.src = "";

                studentInfoPhoto.style.display =
                    "none";
            }

            if (studentInfoPhotoPlaceholder) {

                studentInfoPhotoPlaceholder.style.display =
                    "flex";
            }


            // ==============================
            // HIDE REGISTRATION POPUP
            // ==============================

            const registrationResult =
                document.getElementById(
                    "registrationResult"
                );

            if (registrationResult) {

                registrationResult.classList.add(
                    "hidden"
                );
            }


            // ==============================
            // SHOW FORM
            // ==============================

            const page =
                document.querySelector(".page");

            if (page) {

                page.classList.remove(
                    "hidden"
                );
            }


            // ==============================
            // CLEAR MESSAGE
            // ==============================

            if (message) {

                message.textContent = "";

                message.style.color = "";

            }


            // ==============================
            // RESET SUBMIT BUTTON
            // ==============================

            if (submitBtn) {

                submitBtn.disabled = false;

                submitBtn.textContent =
                    "Submit Admission";
            }


            // ==============================
            // SCROLL TOP
            // ==============================

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }
    );

}


// ======================================
// PRINT REGISTRATION DOCUMENT
// ======================================

const downloadPdf = document.getElementById("downloadPdf");

if (downloadPdf) {

    downloadPdf.addEventListener("click", function (e) {

        e.preventDefault();

        const documentElement =
            document.getElementById("registrationCopy");

        if (!documentElement) {
            alert("Registration document not found.");
            return;
        }

        // Clone registration document
        const printContent =
            documentElement.cloneNode(true);

        // Remove buttons
        printContent
            .querySelectorAll(".registration-actions")
            .forEach(el => el.remove());


        // ======================================
        // OPEN PRINT WINDOW
        // ======================================

        const printWindow =
            window.open(
                "",
                "_blank",
                "width=1000,height=1200"
            );

        if (!printWindow) {
            alert("Please allow popups for printing.");
            return;
        }


        // ======================================
        // WRITE PRINT DOCUMENT
        // ======================================

        printWindow.document.open();

        printWindow.document.write(`

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<title>KWKMA Student Registration</title>

<style>

* {
    box-sizing: border-box;
}

@page {
    size: A4 portrait;
    margin: 5mm;
}

html,
body {
    margin: 0;
    padding: 0;
    width: 100%;
    background: #ffffff;
    color: #172033;
    font-family: Arial, Helvetica, sans-serif;
}

body {
    width: 100%;
}

#printArea {
    width: 100%;
    max-width: 200mm;
    margin: 0 auto;
}


/* ==========================================
   MAIN DOCUMENT
========================================== */

#registrationCopy {

    width: 100% !important;

    margin: 0 !important;

    padding: 0 !important;

    background: #ffffff !important;

    color: #172033 !important;

    border: 1.5px solid #172033;

    border-radius: 6px;

    overflow: hidden;
}


/* ==========================================
   HEADER
========================================== */

.document-header {

    display: grid !important;

    grid-template-columns:
        1.2fr
        1.5fr
        0.8fr;

    align-items: center;

    gap: 16px;

    padding: 14px 16px;

    background:
        linear-gradient(
            135deg,
            #f8fafc 0%,
            #eef2ff 55%,
            #fff1f2 100%
        );

    border-bottom: 4px solid #991b1b;
}


/* ==========================================
   BRAND
========================================== */

.document-brand {

    display: flex !important;

    align-items: center;

    gap: 11px;
}

.document-brand img {

    width: 54px;

    height: 54px;

    object-fit: contain;

    padding: 3px;

    background: #ffffff;

    border: 1px solid #cbd5e1;

    border-radius: 50%;
}

.document-brand h1 {

    margin: 0;

    font-size: 21px;

    font-weight: 900;

    letter-spacing: 1.2px;

    color: #991b1b;
}

.document-brand p {

    margin: 3px 0 0;

    font-size: 6.5px;

    line-height: 1.3;

    color: #475569;

    font-weight: 700;
}


/* ==========================================
   TITLE
========================================== */

.document-title {

    text-align: center;

    padding: 4px 8px;
}

.document-title span {

    display: block;

    font-size: 7px;

    letter-spacing: 2px;

    color: #64748b;

    font-weight: 800;
}

.document-title h2 {

    margin: 5px 0 0;

    font-size: 17px;

    letter-spacing: 0.8px;

    color: #0f172a;

    font-weight: 900;
}


/* ==========================================
   REGISTRATION NUMBER
========================================== */

.document-reg {

    text-align: center;

    padding: 9px 10px;

    background: #ffffff;

    border: 1.5px solid #991b1b;

    border-radius: 7px;

    box-shadow:
        0 2px 5px rgba(0, 0, 0, 0.06);
}

.document-reg small {

    display: block;

    font-size: 6px;

    color: #64748b;

    font-weight: 800;

    letter-spacing: 0.6px;
}

.document-reg strong {

    display: block;

    margin-top: 4px;

    font-size: 14px;

    color: #991b1b;

    letter-spacing: 0.7px;

    font-weight: 900;
}


/* ==========================================
   SECTION TITLE
========================================== */

.document-section-title {

    display: block !important;

    margin-top: 8px;

    padding: 7px 11px;

    background:
        linear-gradient(
            90deg,
            #7f1d1d,
            #991b1b,
            #b91c1c
        );

    color: #ffffff !important;

    border: none;

    font-size: 8px;

    font-weight: 900;

    letter-spacing: 1px;

    text-transform: uppercase;
}

.document-section-title i {
    margin-right: 6px;
}


/* ==========================================
   STUDENT INFORMATION
========================================== */

.document-body-grid {

    display: grid !important;

    grid-template-columns:
        1fr
        82px;

    gap: 10px;

    padding: 10px;

    border: 1px solid #cbd5e1;

    border-top: none;

    background: #ffffff;
}

.document-fields {

    display: grid !important;

    grid-template-columns:
        1fr
        1fr;

    border-top: 1px solid #cbd5e1;

    border-left: 1px solid #cbd5e1;
}

.result-field {

    min-height: 31px;

    padding: 6px 8px;

    background: #ffffff;

    border-right: 1px solid #cbd5e1;

    border-bottom: 1px solid #cbd5e1;
}


/* Alternate background */

.result-field:nth-child(4n + 1),
.result-field:nth-child(4n + 2) {

    background: #f8fafc;
}

.result-field span {

    display: block;

    margin-bottom: 3px;

    font-size: 6px;

    font-weight: 900;

    color: #64748b;

    letter-spacing: 0.5px;
}

.result-field strong {

    display: block;

    font-size: 8.5px;

    line-height: 1.25;

    color: #0f172a;

    font-weight: 700;

    word-break: break-word;
}


/* ==========================================
   PHOTO
========================================== */

.result-photo-box {

    width: 82px;

    height: 105px;

    padding: 5px;

    border: 1.5px solid #94a3b8;

    background:
        linear-gradient(
            145deg,
            #f8fafc,
            #eef2f7
        );

    display: flex !important;

    flex-direction: column;

    align-items: center;

    justify-content: center;

    overflow: hidden;

    border-radius: 4px;
}

.result-photo-box img {

    width: 70px;

    height: 82px;

    object-fit: cover;

    display: block;

    border: 1px solid #cbd5e1;
}

.result-photo-box span {

    margin-top: 4px;

    font-size: 5.5px;

    font-weight: 800;

    color: #64748b;

    letter-spacing: 0.5px;
}


/* ==========================================
   ADDRESS
========================================== */

.document-address-grid {

    display: grid !important;

    grid-template-columns:
        1fr
        1fr;

    border: 1px solid #cbd5e1;

    border-top: none;

    background: #ffffff;
}

.result-address {

    min-height: 52px;

    padding: 7px 9px;

    border-right: 1px solid #cbd5e1;
}

.result-address:last-child {
    border-right: none;
}

.result-address span {

    display: block;

    margin-bottom: 4px;

    font-size: 6px;

    font-weight: 900;

    color: #64748b;

    letter-spacing: 0.5px;
}

.result-address p {

    margin: 0;

    font-size: 8px;

    line-height: 1.4;

    color: #0f172a;

    font-weight: 600;
}


/* ==========================================
   TRAINING
========================================== */

.result-training {

    padding: 9px 10px;

    border: 1px solid #cbd5e1;

    border-top: none;

    background: #ffffff;
}

.result-training p {

    margin: 0;

    font-size: 8px;

    line-height: 1.4;

    font-weight: 700;

    color: #0f172a;
}


/* ==========================================
   EXTRA INFORMATION
========================================== */

.document-extra-grid {

    display: grid !important;

    grid-template-columns:
        1fr
        1fr
        1fr;

    border-left: 1px solid #cbd5e1;

    border-bottom: 1px solid #cbd5e1;
}

.document-extra-grid .result-field {
    min-height: 38px;
}


/* ==========================================
   DECLARATION
========================================== */

.document-declaration {
    margin-top: 8px;
}

.document-declaration .document-section-title {
    margin-top: 0;
}

.document-declaration p {

    margin: 0;

    padding: 9px 10px;

    border: 1px solid #cbd5e1;

    border-top: none;

    background:
        linear-gradient(
            90deg,
            #f8fafc,
            #ffffff
        );

    font-size: 7px;

    line-height: 1.5;

    color: #334155;

    text-align: justify;
}


/* ==========================================
   SIGNATURE
========================================== */

.document-signatures {

    display: grid !important;

    grid-template-columns:
        1fr
        1fr;

    gap: 70px;

    margin-top: 50px;

    padding: 0 35px 8px;

    text-align: center;
}

.signature-line {

    width: 135px;

    margin: 0 auto 5px;

    border-top: 1.5px solid #334155;
}

.document-signatures strong {

    font-size: 6.5px;

    letter-spacing: 0.6px;

    color: #334155;

    font-weight: 800;
}


/* ==========================================
   FOOTER
========================================== */

.document-footer {

    display: flex !important;

    justify-content: space-between;

    align-items: center;

    margin-top: 8px;

    padding: 7px 10px;

    background:
        linear-gradient(
            90deg,
            #0f172a,
            #1e293b
        );

    color: #ffffff;

    font-size: 5.5px;

    font-weight: 700;

    letter-spacing: 0.5px;
}


/* ==========================================
   HIDE BUTTONS
========================================== */

.registration-actions,
button {
    display: none !important;
}


/* ==========================================
   KEEP SECTIONS TOGETHER
========================================== */

.document-header,
.document-section-title,
.document-body-grid,
.document-address-grid,
.result-training,
.document-extra-grid,
.document-declaration,
.document-signatures,
.document-footer {

    break-inside: avoid;

    page-break-inside: avoid;
}


/* ==========================================
   PRINT COLORS
========================================== */

img {

    -webkit-print-color-adjust: exact !important;

    print-color-adjust: exact !important;
}


/* ==========================================
   A4
========================================== */

@media print {

    html,
    body {

        width: 210mm;

        height: 297mm;

        margin: 0;

        padding: 0;

        background: #ffffff;
    }

    #printArea {

        width: 200mm;

        margin: 0 auto;
    }

    #registrationCopy {

        width: 200mm !important;
    }
}

</style>

</head>

<body>

<div id="printArea">

    ${printContent.outerHTML}

</div>

</body>

</html>

        `);

        printWindow.document.close();


        // ======================================
        // WAIT FOR IMAGES + PRINT ONCE
        // ======================================

        const images = [
            ...printWindow.document.images
        ];

        let printed = false;

        function printOnce() {

            // Prevent print() from being called more than once
            if (printed) {
                return;
            }

            printed = true;

            printWindow.focus();

            printWindow.print();
        }


        // ======================================
        // NO IMAGE
        // ======================================

        if (images.length === 0) {

            setTimeout(() => {

                printOnce();

            }, 300);

        }


        // ======================================
        // HAS IMAGE
        // ======================================

        else {

            let loadedImages = 0;

            function imageLoaded() {

                loadedImages++;

                if (loadedImages >= images.length) {

                    setTimeout(() => {

                        printOnce();

                    }, 300);

                }

            }


            images.forEach((img) => {

                // Already loaded
                if (img.complete) {

                    imageLoaded();

                }

                // Still loading
                else {

                    img.addEventListener(
                        "load",
                        imageLoaded,
                        { once: true }
                    );

                    img.addEventListener(
                        "error",
                        imageLoaded,
                        { once: true }
                    );

                }

            });


            // Safety fallback
            setTimeout(() => {

                printOnce();

            }, 3000);

        }


        // ======================================
        // CLOSE AFTER PRINT
        // ======================================

        printWindow.addEventListener(
            "afterprint",
            () => {

                setTimeout(() => {

                    if (!printWindow.closed) {

                        printWindow.close();

                    }

                }, 300);

            }
        );

    }); // <-- এইটা খুব গুরুত্বপূর্ণ

} // <-- downloadPdf if বন্ধ


// ======================================
// CLOSE X BUTTON
// ======================================

const closeRegistration =
    document.getElementById("closeRegistration");

if (closeRegistration) {

    closeRegistration.addEventListener(
        "click",
        function (e) {

            e.preventDefault();

            e.stopPropagation();

            const registrationResult =
                document.getElementById(
                    "registrationResult"
                );

            if (registrationResult) {

                registrationResult.classList.add(
                    "hidden"
                );

            }

        }
    );

}

/* =====================================================
   KWKMA CUSTOM DATE PICKER
===================================================== */
(function () {

    const dob = document.getElementById("dob");
    const trigger = document.getElementById("dobTrigger");
    const calendar = document.getElementById("dobCalendar");

    const monthText = document.getElementById("dobMonth");
    const yearText = document.getElementById("dobYear");

    const daysContainer = document.getElementById("dobDays");

    const prevBtn = document.getElementById("dobPrev");
    const nextBtn = document.getElementById("dobNext");

    const todayBtn = document.getElementById("dobToday");
    const clearBtn = document.getElementById("dobClear");

    const dobText = document.getElementById("dobText");

    const monthBtn = document.getElementById("dobMonthBtn");
    const yearBtn = document.getElementById("dobYearBtn");

    const calendarTitle = document.querySelector(".calendar-title");


    if (
        !dob ||
        !trigger ||
        !calendar ||
        !daysContainer
    ) {
        return;
    }


    /* =========================================
       CURRENT VIEW DATE
    ========================================= */

    let viewDate = new Date();


    /* =========================================
       MONTH NAMES
    ========================================= */

    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];


    /* =========================================
       FORMAT DATE
    ========================================= */

    function formatDate(date) {

        const year = date.getFullYear();

        const month =
            String(date.getMonth() + 1).padStart(2, "0");

        const day =
            String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }


    /* =========================================
       DISPLAY DATE
    ========================================= */

    function formatDisplayDate(date) {

        return date.toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    }


    /* =========================================
       CLOSE FLOATING PICKERS
    ========================================= */

    function closeCalendarPicker() {

        document
            .querySelectorAll(".calendar-picker")
            .forEach((el) => {
                el.remove();
            });
    }


    /* =========================================
       RENDER CALENDAR
    ========================================= */

    function renderCalendar() {

        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();


        /* Header */

        if (monthText) {
            monthText.textContent =
                monthNames[month];
        }

        if (yearText) {
            yearText.textContent =
                year;
        }


        /* Clear days */

        daysContainer.innerHTML = "";


        const firstDay =
            new Date(year, month, 1).getDay();

        const daysInMonth =
            new Date(year, month + 1, 0).getDate();

        const daysInPrevMonth =
            new Date(year, month, 0).getDate();


        /* =====================================
           PREVIOUS MONTH DAYS
        ===================================== */

        for (
            let i = firstDay - 1;
            i >= 0;
            i--
        ) {

            const day =
                daysInPrevMonth - i;

            const button =
                document.createElement("button");

            button.type = "button";

            button.className =
                "calendar-day other-month";

            button.textContent = day;

            daysContainer.appendChild(button);
        }


        /* =====================================
           CURRENT MONTH DAYS
        ===================================== */

        const today = new Date();

        for (
            let day = 1;
            day <= daysInMonth;
            day++
        ) {

            const button =
                document.createElement("button");

            button.type = "button";

            button.className =
                "calendar-day";

            button.textContent = day;


            const currentDate =
                new Date(
                    year,
                    month,
                    day
                );


            /* Today */

            if (
                currentDate.toDateString() ===
                today.toDateString()
            ) {

                button.classList.add("today");
            }


            /* Selected */

            if (
                dob.value &&
                dob.value ===
                formatDate(currentDate)
            ) {

                button.classList.add("selected");
            }


            /* =================================
               SELECT DATE
            ================================= */

            button.addEventListener(
                "click",
                function (e) {

                    e.preventDefault();
                    e.stopPropagation();

                    dob.value =
                        formatDate(currentDate);

                    if (dobText) {

                        dobText.textContent =
                            formatDisplayDate(
                                currentDate
                            );

                        dobText.style.color =
                            "var(--black)";
                    }


                    calendar.classList.remove(
                        "open"
                    );


                    dob.dispatchEvent(
                        new Event(
                            "change",
                            {
                                bubbles: true
                            }
                        )
                    );


                    renderCalendar();
                }
            );


            daysContainer.appendChild(button);
        }


        /* =====================================
           NEXT MONTH FILLER
        ===================================== */

        const totalCells =
            firstDay + daysInMonth;

        const remaining =
            totalCells % 7 === 0
                ? 0
                : 7 - (totalCells % 7);


        for (
            let day = 1;
            day <= remaining;
            day++
        ) {

            const button =
                document.createElement("button");

            button.type = "button";

            button.className =
                "calendar-day other-month";

            button.textContent = day;

            daysContainer.appendChild(button);
        }
    }


    /* =========================================
       YEAR PICKER
    ========================================= */

    if (yearBtn && calendarTitle) {

        yearBtn.addEventListener(
            "click",
            function (e) {

                e.preventDefault();
                e.stopPropagation();


                /* Remove previous picker */

                closeCalendarPicker();


                const picker =
                    document.createElement("div");

                picker.className =
                    "calendar-picker open";

                picker.id =
                    "dobYearPicker";


                /* Prevent calendar outside click */

                picker.addEventListener(
                    "click",
                    function (e) {

                        e.stopPropagation();
                    }
                );


                const currentYear =
                    new Date().getFullYear();


                /* =================================
                   1900 → CURRENT YEAR
                ================================= */

                for (
                    let year = currentYear;
                    year >= 1900;
                    year--
                ) {

                    const button =
                        document.createElement("button");

                    button.type = "button";

                    button.textContent =
                        year;


                    if (
                        year ===
                        viewDate.getFullYear()
                    ) {

                        button.classList.add(
                            "active"
                        );
                    }


                    button.addEventListener(
                        "click",
                        function (e) {

                            e.preventDefault();
                            e.stopPropagation();


                            viewDate.setFullYear(
                                year
                            );


                            /* Remove picker */

                            picker.remove();


                            /* Re-render */

                            renderCalendar();
                        }
                    );


                    picker.appendChild(
                        button
                    );
                }


                calendarTitle.appendChild(
                    picker
                );
            }
        );
    }


    /* =========================================
       MONTH PICKER
    ========================================= */

    if (monthBtn && calendarTitle) {

        monthBtn.addEventListener(
            "click",
            function (e) {

                e.preventDefault();
                e.stopPropagation();


                /* Remove previous picker */

                closeCalendarPicker();


                const picker =
                    document.createElement("div");

                picker.className =
                    "calendar-picker open";

                picker.id =
                    "dobMonthPicker";


                /* Prevent outside click */

                picker.addEventListener(
                    "click",
                    function (e) {

                        e.stopPropagation();
                    }
                );


                monthNames.forEach(
                    (month, index) => {

                        const button =
                            document.createElement(
                                "button"
                            );

                        button.type =
                            "button";

                        button.textContent =
                            month.substring(0, 3);


                        if (
                            index ===
                            viewDate.getMonth()
                        ) {

                            button.classList.add(
                                "active"
                            );
                        }


                        button.addEventListener(
                            "click",
                            function (e) {

                                e.preventDefault();
                                e.stopPropagation();


                                viewDate.setMonth(
                                    index
                                );


                                picker.remove();


                                renderCalendar();
                            }
                        );


                        picker.appendChild(
                            button
                        );
                    }
                );


                calendarTitle.appendChild(
                    picker
                );
            }
        );
    }


    /* =========================================
       OPEN / CLOSE CALENDAR
    ========================================= */

    trigger.addEventListener(
        "click",
        function (e) {

            e.preventDefault();
            e.stopPropagation();


            closeCalendarPicker();


            calendar.classList.toggle(
                "open"
            );


            if (
                calendar.classList.contains(
                    "open"
                )
            ) {

                renderCalendar();
            }
        }
    );


    /* =========================================
       PREVIOUS MONTH
    ========================================= */

    if (prevBtn) {

        prevBtn.addEventListener(
            "click",
            function (e) {

                e.preventDefault();
                e.stopPropagation();


                closeCalendarPicker();


                viewDate.setMonth(
                    viewDate.getMonth() - 1
                );


                renderCalendar();
            }
        );
    }


    /* =========================================
       NEXT MONTH
    ========================================= */

    if (nextBtn) {

        nextBtn.addEventListener(
            "click",
            function (e) {

                e.preventDefault();
                e.stopPropagation();


                closeCalendarPicker();


                viewDate.setMonth(
                    viewDate.getMonth() + 1
                );


                renderCalendar();
            }
        );
    }


    /* =========================================
       TODAY
    ========================================= */

    if (todayBtn) {

        todayBtn.addEventListener(
            "click",
            function (e) {

                e.preventDefault();
                e.stopPropagation();


                closeCalendarPicker();


                const today =
                    new Date();


                viewDate =
                    new Date(
                        today.getFullYear(),
                        today.getMonth(),
                        1
                    );


                dob.value =
                    formatDate(today);


                if (dobText) {

                    dobText.textContent =
                        formatDisplayDate(
                            today
                        );

                    dobText.style.color =
                        "var(--black)";
                }


                renderCalendar();
            }
        );
    }


    /* =========================================
       CLEAR
    ========================================= */

    if (clearBtn) {

        clearBtn.addEventListener(
            "click",
            function (e) {

                e.preventDefault();
                e.stopPropagation();


                closeCalendarPicker();


                dob.value = "";


                if (dobText) {

                    dobText.textContent =
                        "Select Date of Birth";

                    dobText.style.color =
                        "#777";
                }


                renderCalendar();
            }
        );
    }


    /* =========================================
       CLICK INSIDE CALENDAR
    ========================================= */

    calendar.addEventListener(
        "click",
        function (e) {

            e.stopPropagation();
        }
    );


    /* =========================================
       CLICK OUTSIDE
    ========================================= */

    document.addEventListener(
        "click",
        function (e) {

            if (
                !calendar.contains(e.target) &&
                !trigger.contains(e.target)
            ) {

                closeCalendarPicker();

                calendar.classList.remove(
                    "open"
                );
            }
        }
    );


    /* =========================================
       INITIAL RENDER
    ========================================= */

    renderCalendar();

})();