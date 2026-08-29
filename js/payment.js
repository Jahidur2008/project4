// ============================================
// KWKMA PAYMENT SYSTEM
// FIREBASE FIRESTORE CONNECTED VERSION
// ============================================

import { db } from "./firebase.js";

import {
    addDoc,
    collection,
    getDocs,
    query,
    serverTimestamp,
    where
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ============================================
// ELEMENTS
// ============================================

const registrationInput =
  document.getElementById("registrationInput");

const studentInfoCard =
  document.getElementById("studentInfoCard");

const studentError =
  document.getElementById("studentError");

const studentName =
  document.getElementById("studentName");

const studentRegistration =
  document.getElementById("studentRegistration");

const paymentTypeSection =
  document.getElementById("paymentTypeSection");

const paymentDetailsSection =
  document.getElementById("paymentDetailsSection");

const paymentTypeCards =
  document.querySelectorAll(".payment-type-card");

const beltPaymentDetails =
  document.getElementById("beltPaymentDetails");

const monthlyPaymentDetails =
  document.getElementById("monthlyPaymentDetails");

const beltSelect =
  document.getElementById("beltSelect");

const monthSelect =
  document.getElementById("monthSelect");

const paymentAmountBox =
  document.getElementById("paymentAmountBox");

const paymentAmount =
  document.getElementById("paymentAmount");

const payNowBtn =
  document.getElementById("payNowBtn");


// ============================================
// STUDENT PHOTO
// ============================================

let studentPhoto =
  document.getElementById("studentPhoto") ||
  document.getElementById("studentImage") ||
  document.getElementById("studentAvatar");


// ============================================
// SUMMARY ELEMENTS
// ============================================

const summaryStudent =
  document.getElementById("summaryStudent");

const summaryRegistration =
  document.getElementById("summaryRegistration");

const summaryType =
  document.getElementById("summaryType");

const summaryDetails =
  document.getElementById("summaryDetails");

const summaryAmount =
  document.getElementById("summaryAmount");


// ============================================
// PAYMENT STATE
// ============================================

let currentStudent = null;
let selectedPaymentType = null;
let selectedPaymentDetails = null;
let selectedAmount = 0;
let searchTimer = null;


// ============================================
// IMPORTANT SEARCH REQUEST ID
// ============================================

let searchRequestId = 0;


// ============================================
// FEE SETTINGS
// ============================================

const fees = {

  monthly: 1000,

  belts: {

    "Red Belt": 800,
    "Yellow Belt": 800,
    "Orange Belt": 800,
    "Green Belt": 800,
    "Blue Belt": 800,
    "Brown Belt": 1000,
    "Black Belt": 1000

  }

};


// ============================================
// CUSTOM TOAST
// ============================================

function showToast(
  message,
  type = "error"
) {

  let toastContainer =
    document.getElementById(
      "kwkmaToastContainer"
    );


  // ==========================================
  // CREATE CONTAINER
  // ==========================================

  if (!toastContainer) {

    toastContainer =
      document.createElement("div");

    toastContainer.id =
      "kwkmaToastContainer";

    toastContainer.style.position =
      "fixed";

    toastContainer.style.top =
      "100px";

    toastContainer.style.right =
      "25px";

    toastContainer.style.zIndex =
      "999999";

    toastContainer.style.display =
      "flex";

    toastContainer.style.flexDirection =
      "column";

    toastContainer.style.gap =
      "10px";

    toastContainer.style.pointerEvents =
      "none";

    document.body.appendChild(
      toastContainer
    );
  }


  // ==========================================
  // CREATE TOAST
  // ==========================================

  const toast =
    document.createElement("div");


  toast.style.minWidth =
    "280px";

  toast.style.maxWidth =
    "380px";

  toast.style.padding =
    "15px 18px";

  toast.style.borderRadius =
    "14px";

  toast.style.display =
    "flex";

  toast.style.alignItems =
    "center";

  toast.style.gap =
    "10px";

  toast.style.fontFamily =
    "inherit";

  toast.style.fontSize =
    "14px";

  toast.style.fontWeight =
    "600";

  toast.style.boxShadow =
    "0 15px 40px rgba(0,0,0,0.18)";

  toast.style.pointerEvents =
    "auto";

  toast.style.transition =
    "0.3s ease";


  let icon =
    "fa-circle-exclamation";


  if (type === "success") {

    toast.style.background =
      "#39885a";

    toast.style.color =
      "#ffffff";

    icon =
      "fa-circle-check";

  } else {

    toast.style.background =
      "#c51a30";

    toast.style.color =
      "#ffffff";

  }


  toast.innerHTML = `

    <i class="fa-solid ${icon}"></i>

    <span>${message}</span>

  `;


  toastContainer.appendChild(
    toast
  );


  // ==========================================
  // REMOVE TOAST
  // ==========================================

  setTimeout(() => {

    toast.style.opacity =
      "0";

    toast.style.transform =
      "translateX(20px)";


    setTimeout(() => {

      toast.remove();

    }, 300);

  }, 3000);
}


// ============================================
// TOAST ANIMATION
// ============================================

if (
  !document.getElementById(
    "kwkmaToastStyle"
  )
) {

  const style =
    document.createElement("style");

  style.id =
    "kwkmaToastStyle";


  style.textContent = `

    @keyframes kwkmaToastIn {

      from {

        opacity: 0;
        transform: translateX(25px);

      }

      to {

        opacity: 1;
        transform: translateX(0);

      }

    }

    #kwkmaToastContainer > div {

      animation:
        kwkmaToastIn 0.3s ease;

    }

  `;


  document.head.appendChild(
    style
  );
}


// ============================================
// HIDE STUDENT ERROR
// ============================================

function hideStudentError() {

  if (!studentError) {
    return;
  }


  studentError.hidden =
    true;


  studentError.style.setProperty(
    "display",
    "none",
    "important"
  );
}


// ============================================
// SHOW STUDENT ERROR
// ============================================

function showStudentError(
  message
) {

  if (!studentError) {
    return;
  }


  const errorText =
    studentError.querySelector(
      "span"
    );


  if (errorText) {

    errorText.textContent =
      message;

  } else {

    studentError.textContent =
      message;

  }


  studentError.hidden =
    false;


  studentError.style.setProperty(
    "display",
    "flex",
    "important"
  );
}


// ============================================
// CLOUDINARY PHOTO URL
// ============================================

function getStudentPhotoUrl(
  student
) {

  if (!student) {
    return "";
  }


  const fields = [

    "cloudinaryUrl",
    "cloudinaryURL",
    "cloudinary_url",
    "cloudinary",
    "secure_url",
    "secureUrl",
    "photoURL",
    "photoUrl",
    "photo",
    "imageURL",
    "imageUrl",
    "image",
    "profileImageURL",
    "profileImageUrl",
    "profileImage",
    "studentImageURL",
    "studentImageUrl",
    "studentImage",
    "avatarURL",
    "avatarUrl",
    "avatar"

  ];


  for (const field of fields) {

    const value =
      student[field];


    // ========================================
    // STRING URL
    // ========================================

    if (
      typeof value === "string" &&
      value.trim()
    ) {

      return value.trim();

    }


    // ========================================
    // OBJECT
    // ========================================

    if (
      value &&
      typeof value === "object"
    ) {

      const nestedUrl =
        value.secure_url ||
        value.secureUrl ||
        value.url ||
        value.image_url ||
        value.imageUrl;


      if (
        typeof nestedUrl === "string" &&
        nestedUrl.trim()
      ) {

        return nestedUrl.trim();

      }
    }
  }


  return "";
}


// ============================================
// FIND STUDENT PHOTO ELEMENT
// ============================================

function getStudentPhotoElement() {

  if (studentPhoto) {
    return studentPhoto;
  }


  if (!studentInfoCard) {
    return null;
  }


  // ==========================================
  // EXISTING IMAGE
  // ==========================================

  const image =
    studentInfoCard.querySelector(
      "img#studentPhoto, " +
      "img#studentImage, " +
      "img.student-photo, " +
      "img.student-image, " +
      "img.student-avatar, " +
      "img[data-student-photo]"
    );


  if (image) {

    studentPhoto =
      image;

    return studentPhoto;

  }


  // ==========================================
  // EXISTING AVATAR
  // ==========================================

  const avatar =
    studentInfoCard.querySelector(
      ".student-avatar, " +
      ".student-photo, " +
      ".student-image, " +
      "[data-student-photo]"
    );


  if (avatar) {

    studentPhoto =
      avatar;

    return studentPhoto;

  }


  return null;
}


// ============================================
// SHOW STUDENT PHOTO
// ============================================

function setStudentPhoto(
  student
) {

  const photoUrl =
    getStudentPhotoUrl(
      student
    );


  const photoElement =
    getStudentPhotoElement();


  if (!photoElement) {
    return;
  }


  // ==========================================
  // NO PHOTO
  // ==========================================

  if (!photoUrl) {

    resetStudentPhoto();

    return;
  }


  // ==========================================
  // IMG ELEMENT
  // ==========================================

  if (
    photoElement.tagName &&
    photoElement.tagName.toLowerCase() ===
      "img"
  ) {

    photoElement.src =
      photoUrl;


    photoElement.alt =
      `${
        student.name ||
        student.fullName ||
        student.studentName ||
        "Student"
      } Photo`;


    photoElement.style.display =
      "block";


    photoElement.style.objectFit =
      "cover";


    // ========================================
    // CLOUDINARY LOAD ERROR
    // ========================================

    photoElement.onerror =
      () => {

        photoElement.removeAttribute(
          "src"
        );

        photoElement.style.display =
          "none";

      };


    return;
  }


  // ==========================================
  // AVATAR / DIV
  // ==========================================

  photoElement.style.backgroundImage =
    `url("${photoUrl.replace(
      /"/g,
      '\\"'
    )}")`;


  photoElement.style.backgroundSize =
    "cover";


  photoElement.style.backgroundPosition =
    "center";


  photoElement.style.backgroundRepeat =
    "no-repeat";


  const icon =
    photoElement.querySelector(
      "i, svg"
    );


  if (icon) {

    icon.style.display =
      "none";

  }
}


// ============================================
// RESET STUDENT PHOTO
// ============================================

function resetStudentPhoto() {

  if (!studentPhoto) {
    return;
  }


  // ==========================================
  // IMG
  // ==========================================

  if (
    studentPhoto.tagName &&
    studentPhoto.tagName.toLowerCase() ===
      "img"
  ) {

    studentPhoto.removeAttribute(
      "src"
    );


    studentPhoto.removeAttribute(
      "srcset"
    );


    studentPhoto.style.display =
      "none";


    studentPhoto.style.backgroundImage =
      "none";


    return;
  }


  // ==========================================
  // AVATAR / DIV
  // ==========================================

  studentPhoto.style.backgroundImage =
    "none";


  const icon =
    studentPhoto.querySelector(
      "i, svg"
    );


  if (icon) {

    icon.style.display =
      "";

  }
}


// ============================================
// RESET PAYMENT
// ============================================

function resetPayment() {

  selectedPaymentType =
    null;

  selectedPaymentDetails =
    null;

  selectedAmount =
    0;


  // ==========================================
  // REMOVE ACTIVE
  // ==========================================

  paymentTypeCards.forEach(
    (card) => {

      card.classList.remove(
        "active"
      );

    }
  );


  // ==========================================
  // HIDE DETAILS
  // ==========================================

  beltPaymentDetails.hidden =
    true;

  monthlyPaymentDetails.hidden =
    true;

  paymentAmountBox.hidden =
    true;


  // ==========================================
  // DISABLE PAY BUTTON
  // ==========================================

  payNowBtn.disabled =
    true;


  // ==========================================
  // RESET SELECT
  // ==========================================

  beltSelect.value =
    "";

  monthSelect.value =
    "";


  // ==========================================
  // SUMMARY
  // ==========================================

  summaryType.textContent =
    "—";

  summaryDetails.textContent =
    "—";

  summaryAmount.textContent =
    "৳ 0";


  // ==========================================
  // DISABLE PAYMENT DETAILS
  // ==========================================

  paymentDetailsSection.classList.add(
    "payment-disabled"
  );
}


// ============================================
// RESET STUDENT
// ============================================

function resetStudent() {

  // ==========================================
  // INVALIDATE ALL OLD SEARCH REQUESTS
  // ==========================================

  searchRequestId++;


  clearTimeout(
    searchTimer
  );


  // ==========================================
  // CLEAR CURRENT STUDENT
  // ==========================================

  currentStudent =
    null;


  // ==========================================
  // HIDE STUDENT CARD
  // ==========================================

  studentInfoCard.hidden =
    true;


  // ==========================================
  // HIDE ERROR
  // ==========================================

  hideStudentError();


  // ==========================================
  // CLEAR IMAGE
  // ==========================================

  resetStudentPhoto();


  // ==========================================
  // RESET STUDENT TEXT
  // ==========================================

  studentName.textContent =
    "Student Name";

  studentRegistration.textContent =
    "KWKMA-01";


  // ==========================================
  // DISABLE PAYMENT
  // ==========================================

  paymentTypeSection.classList.add(
    "payment-disabled"
  );

  paymentDetailsSection.classList.add(
    "payment-disabled"
  );


  // ==========================================
  // SUMMARY RESET
  // ==========================================

  summaryStudent.textContent =
    "—";

  summaryRegistration.textContent =
    "—";


  // ==========================================
  // RESET PAYMENT
  // ==========================================

  resetPayment();
}


// ============================================
// SHOW SEARCHING
// ============================================

function showSearching(
  registrationId
) {

  hideStudentError();


  // Old image hide
  resetStudentPhoto();


  studentInfoCard.hidden =
    false;


  studentName.textContent =
    "Searching...";


  studentRegistration.textContent =
    registrationId;


  paymentTypeSection.classList.add(
    "payment-disabled"
  );


  paymentDetailsSection.classList.add(
    "payment-disabled"
  );


  resetPayment();
}


// ============================================
// STUDENT NOT FOUND
// ============================================

function showStudentNotFound() {

  currentStudent =
    null;


  studentInfoCard.hidden =
    true;


  resetStudentPhoto();


  showStudentError(
    "Registration ID পাওয়া যায়নি"
  );


  paymentTypeSection.classList.add(
    "payment-disabled"
  );


  paymentDetailsSection.classList.add(
    "payment-disabled"
  );


  summaryStudent.textContent =
    "—";


  summaryRegistration.textContent =
    "—";


  resetPayment();
}


// ============================================
// FIREBASE SEARCH ERROR
// ============================================

function showSearchError() {

  currentStudent =
    null;


  studentInfoCard.hidden =
    true;


  resetStudentPhoto();


  showStudentError(
    "Student information load করা যায়নি"
  );


  paymentTypeSection.classList.add(
    "payment-disabled"
  );


  paymentDetailsSection.classList.add(
    "payment-disabled"
  );


  summaryStudent.textContent =
    "—";


  summaryRegistration.textContent =
    "—";


  resetPayment();
}


// ============================================
// SEARCH STUDENT
// Registration ID অথবা Roll
// ============================================

async function searchStudent() {

  const requestId =
    ++searchRequestId;


  let inputValue =
    registrationInput.value
      .trim()
      .toUpperCase();


  // ==========================================
  // EMPTY
  // ==========================================

  if (!inputValue) {

    resetStudent();

    return;
  }


  // ==========================================
  // REMOVE KWKMA-
  // ==========================================

  const cleanValue =
    inputValue
      .replace(
        /^KWKMA-/i,
        ""
      )
      .trim();


  if (!cleanValue) {

    resetStudent();

    return;
  }


  // ==========================================
  // REGISTRATION ID
  // ==========================================

  const registrationId =
    "KWKMA-" +
    cleanValue;


  // ==========================================
  // SHOW SEARCHING
  // ==========================================

  showSearching(
    registrationId
  );


  try {

    const studentsRef =
      collection(
        db,
        "students"
      );


    let snapshot =
      null;


    // ========================================
    // SEARCH BY REGISTRATION NO
    // ========================================

    const registrationQuery =
      query(
        studentsRef,
        where(
          "registrationNo",
          "==",
          registrationId
        )
      );


    snapshot =
      await getDocs(
        registrationQuery
      );


    // ========================================
    // SEARCH BY ROLL
    // ========================================

    if (snapshot.empty) {

      // --------------------------------------
      // ROLL STRING
      // --------------------------------------

      const rollStringQuery =
        query(
          studentsRef,
          where(
            "roll",
            "==",
            cleanValue
          )
        );


      snapshot =
        await getDocs(
          rollStringQuery
        );


      // --------------------------------------
      // ROLL NUMBER
      // --------------------------------------

      if (
        snapshot.empty &&
        !isNaN(cleanValue)
      ) {

        const numericRoll =
          Number(
            cleanValue
          );


        const rollNumberQuery =
          query(
            studentsRef,
            where(
              "roll",
              "==",
              numericRoll
            )
          );


        snapshot =
          await getDocs(
            rollNumberQuery
          );
      }
    }


    // ========================================
    // IMPORTANT REQUEST CHECK
    // ========================================

    if (
      requestId !==
      searchRequestId
    ) {

      return;
    }


    const currentInput =
      registrationInput.value
        .trim()
        .toUpperCase();


    if (
      currentInput !==
      inputValue
    ) {

      return;
    }


    // ========================================
    // STUDENT NOT FOUND
    // ========================================

    if (snapshot.empty) {

      showStudentNotFound();

      return;
    }


    // ========================================
    // GET STUDENT
    // ========================================

    const studentDoc =
      snapshot.docs[0];


    const student =
      studentDoc.data();


    // ========================================
    // STUDENT NAME
    // ========================================

    const name =
      student.name ||
      student.fullName ||
      student.studentName ||
      student.student_name ||
      "Student";


    // ========================================
    // ACTUAL REGISTRATION
    // ========================================

    const actualRegistration =
      student.registrationNo ||
      registrationId;


    // ========================================
    // SAVE STUDENT
    // ========================================

    currentStudent = {

      id:
        studentDoc.id,

      name:
        name,

      registrationId:
        actualRegistration,

      ...student

    };


    // ========================================
    // SHOW NAME
    // ========================================

    studentName.textContent =
      currentStudent.name;


    // ========================================
    // SHOW REGISTRATION ID
    // ========================================

    studentRegistration.textContent =
      currentStudent.registrationId;


    // ========================================
    // SHOW CLOUDINARY PHOTO
    // ========================================

    setStudentPhoto(
      currentStudent
    );


    // ========================================
    // STUDENT FOUND = ERROR HIDE
    // ========================================

    hideStudentError();


    // ========================================
    // SHOW STUDENT CARD
    // ========================================

    studentInfoCard.hidden =
      false;


    // ========================================
    // ENABLE PAYMENT TYPE
    // ========================================

    paymentTypeSection.classList.remove(
      "payment-disabled"
    );


    paymentDetailsSection.classList.add(
      "payment-disabled"
    );


    // ========================================
    // SUMMARY
    // ========================================

    summaryStudent.textContent =
      currentStudent.name;


    summaryRegistration.textContent =
      currentStudent.registrationId;


    summaryType.textContent =
      "—";


    summaryDetails.textContent =
      "—";


    summaryAmount.textContent =
      "৳ 0";


    // ========================================
    // RESET PAYMENT
    // ========================================

    resetPayment();


    // ========================================
    // ENABLE PAYMENT TYPE AGAIN
    // ========================================

    paymentTypeSection.classList.remove(
      "payment-disabled"
    );


    // ========================================
    // SUCCESS
    // ========================================

    showToast(
      "Registration ID পাওয়া গেছে",
      "success"
    );


  } catch (error) {

    // ========================================
    // REQUEST CHECK
    // ========================================

    if (
      requestId !==
      searchRequestId
    ) {

      return;
    }


    console.error(
      "KWKMA Student Search Error:",
      error
    );


    showSearchError();


    showToast(
      "Firebase থেকে Student data load করা যায়নি",
      "error"
    );
  }
}


// ============================================
// REGISTRATION INPUT
// ============================================

registrationInput.addEventListener(
  "input",
  () => {

    // ========================================
    // CANCEL OLD TIMER
    // ========================================

    clearTimeout(
      searchTimer
    );


    // ========================================
    // INVALIDATE OLD FIREBASE SEARCH
    // ========================================

    searchRequestId++;


    const value =
      registrationInput.value.trim();


    // ========================================
    // EMPTY = FULL RESET
    // ========================================

    if (!value) {

      resetStudent();

      return;
    }


    // ========================================
    // NEW ID TYPING
    // OLD STUDENT CLEAR
    // ========================================

    currentStudent =
      null;


    studentInfoCard.hidden =
      true;


    hideStudentError();


    resetStudentPhoto();


    paymentTypeSection.classList.add(
      "payment-disabled"
    );


    paymentDetailsSection.classList.add(
      "payment-disabled"
    );


    summaryStudent.textContent =
      "—";


    summaryRegistration.textContent =
      "—";


    resetPayment();


    // ========================================
    // SEARCH AFTER 500ms
    // ========================================

    searchTimer =
      setTimeout(
        () => {

          searchStudent();

        },
        500
      );
  }
);


// ============================================
// ENTER KEY SEARCH
// ============================================

registrationInput.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key ===
      "Enter"
    ) {

      event.preventDefault();


      clearTimeout(
        searchTimer
      );


      searchStudent();
    }
  }
);


// ============================================
// PAYMENT TYPE
// ============================================

paymentTypeCards.forEach(
  (card) => {

    card.addEventListener(
      "click",
      () => {

        // ====================================
        // STUDENT CHECK
        // ====================================

        if (!currentStudent) {

          showToast(
            "প্রথমে Registration ID অথবা Roll দিয়ে Student Verify করুন.",
            "error"
          );

          return;
        }


        // ====================================
        // SELECT PAYMENT TYPE
        // ====================================

        selectedPaymentType =
          card.dataset.type;


        // ====================================
        // ACTIVE CARD
        // ====================================

        paymentTypeCards.forEach(
          (item) => {

            item.classList.remove(
              "active"
            );

          }
        );


        card.classList.add(
          "active"
        );


        // ====================================
        // ENABLE DETAILS
        // ====================================

        paymentDetailsSection.classList.remove(
          "payment-disabled"
        );


        // ====================================
        // RESET DETAILS
        // ====================================

        selectedPaymentDetails =
          null;


        selectedAmount =
          0;


        beltSelect.value =
          "";

        monthSelect.value =
          "";


        paymentAmountBox.hidden =
          true;


        payNowBtn.disabled =
          true;


        summaryDetails.textContent =
          "—";


        summaryAmount.textContent =
          "৳ 0";


        // ====================================
        // BELT
        // ====================================

        if (
          selectedPaymentType ===
          "belt"
        ) {

          beltPaymentDetails.hidden =
            false;


          monthlyPaymentDetails.hidden =
            true;


          summaryType.textContent =
            "Belt Exam Fee";
        }


        // ====================================
        // MONTHLY
        // ====================================

        if (
          selectedPaymentType ===
          "monthly"
        ) {

          beltPaymentDetails.hidden =
            true;


          monthlyPaymentDetails.hidden =
            false;


          summaryType.textContent =
            "Monthly Fee";
        }

      }
    );
  }
);


// ============================================
// SHOW AMOUNT
// ============================================

function showAmount(
  amount,
  details
) {

  const numericAmount =
    Number(amount);


  if (
    !numericAmount ||
    numericAmount <= 0
  ) {

    paymentAmountBox.hidden =
      true;


    payNowBtn.disabled =
      true;


    return;
  }


  selectedAmount =
    numericAmount;


  selectedPaymentDetails =
    details;


  const formattedAmount =
    numericAmount.toLocaleString(
      "en-BD"
    );


  // ==========================================
  // MAIN AMOUNT
  // ==========================================

  paymentAmount.textContent =
    `৳ ${formattedAmount}`;


  // ==========================================
  // SUMMARY
  // ==========================================

  summaryDetails.textContent =
    details;


  summaryAmount.textContent =
    `৳ ${formattedAmount}`;


  // ==========================================
  // SHOW
  // ==========================================

  paymentAmountBox.hidden =
    false;


  payNowBtn.disabled =
    false;
}


// ============================================
// BELT SELECT
// ============================================

beltSelect.addEventListener(
  "change",
  () => {

    const belt =
      beltSelect.value;


    if (!belt) {

      paymentAmountBox.hidden =
        true;


      payNowBtn.disabled =
        true;


      selectedPaymentDetails =
        null;


      selectedAmount =
        0;


      summaryDetails.textContent =
        "—";


      summaryAmount.textContent =
        "৳ 0";


      return;
    }


    const amount =
      fees.belts[belt];


    showAmount(
      amount,
      belt
    );
  }
);


// ============================================
// MONTH SELECT
// ============================================

monthSelect.addEventListener(
  "change",
  () => {

    const month =
      monthSelect.value;


    if (!month) {

      paymentAmountBox.hidden =
        true;


      payNowBtn.disabled =
        true;


      selectedPaymentDetails =
        null;


      selectedAmount =
        0;


      summaryDetails.textContent =
        "—";


      summaryAmount.textContent =
        "৳ 0";


      return;
    }


    const amount =
      fees.monthly;


    showAmount(
      amount,
      month
    );
  }
);


// ============================================
// PAY NOW
// ============================================

payNowBtn.addEventListener(
  "click",
  async () => {

    // ========================================
    // VALIDATION
    // ========================================

    if (
      !currentStudent ||
      !selectedPaymentType ||
      !selectedPaymentDetails ||
      !selectedAmount
    ) {

      showToast(
        "Payment information সম্পূর্ণ করুন.",
        "error"
      );


      return;
    }


    // ========================================
    // PAYMENT DATA
    // ========================================
    // IMPORTANT:
    // Existing fields are kept.
    // Additional compatible fields are added
    // so Admin Panel can read Registration ID,
    // Fee Type and Month/Belt correctly.
    // ========================================

    const paymentData = {

      // --------------------------------------
      // STUDENT
      // --------------------------------------

      studentId:
        currentStudent.id,

      studentName:
        currentStudent.name,


      // --------------------------------------
      // REGISTRATION ID
      // --------------------------------------

      registrationId:
        currentStudent.registrationId,

      // Compatible field for Admin Panel
      registrationNo:
        currentStudent.registrationId,


      // --------------------------------------
      // PAYMENT TYPE
      // --------------------------------------

      paymentType:
        selectedPaymentType,

      // Compatible readable field
      feeType:
        selectedPaymentType === "monthly"
          ? "Monthly Fee"
          : selectedPaymentType === "belt"
            ? "Belt Exam Fee"
            : selectedPaymentType,


      // --------------------------------------
      // MONTH / BELT
      // --------------------------------------

      details:
        selectedPaymentDetails,


      // Monthly হলে month save হবে
      month:
        selectedPaymentType === "monthly"
          ? selectedPaymentDetails
          : "",


      // Belt হলে belt save হবে
      belt:
        selectedPaymentType === "belt"
          ? selectedPaymentDetails
          : "",


      // --------------------------------------
      // AMOUNT
      // --------------------------------------

      amount:
        selectedAmount,


      // --------------------------------------
      // STATUS
      // --------------------------------------

      status:
        "paid",


      // --------------------------------------
      // TRANSACTION ID
      // --------------------------------------
      // Online payment complete হওয়ার পরে
      // gateway থেকে এখানে আসবে.
      // --------------------------------------

      transactionId:
        "",


      // --------------------------------------
      // DATE
      // --------------------------------------

      paymentDate:
        serverTimestamp(),


      createdAt:
        serverTimestamp()

    };


    console.log(
      "Payment Data:",
      paymentData
    );


    try {

      // ======================================
      // BUTTON LOADING
      // ======================================

      payNowBtn.disabled =
        true;


      payNowBtn.innerHTML = `

        <i class="fa-solid fa-spinner fa-spin"></i>

        <span>Processing...</span>

      `;


      // ======================================
      // SAVE PAYMENT
      // ======================================

      const paymentsRef =
        collection(
          db,
          "payments"
        );


      const paymentDoc =
        await addDoc(
          paymentsRef,
          paymentData
        );


      console.log(
        "Payment Created:",
        paymentDoc.id
      );


      // ======================================
      // SUCCESS
      // ======================================

      showToast(
        "Payment request successfully created.",
        "success"
      );


    } catch (error) {

      console.error(
        "Payment Save Error:",
        error
      );


      showToast(
        "Payment process শুরু করতে সমস্যা হয়েছে.",
        "error"
      );


    } finally {

      payNowBtn.disabled =
        false;


      payNowBtn.innerHTML = `

        <span>Pay Now</span>

        <i class="fa-solid fa-arrow-right"></i>

      `;
    }
  }
);


// ============================================
// YEAR
// ============================================

const yearElement =
  document.getElementById(
    "year"
  );


if (yearElement) {

  yearElement.textContent =
    new Date().getFullYear();
}


// ============================================
// INITIAL STATE
// ============================================

hideStudentError();

resetStudentPhoto();

resetStudent();