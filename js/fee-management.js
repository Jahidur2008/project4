import { db } from "./firebase.js";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

/* =====================================================
   DOM ELEMENTS
===================================================== */

const refreshBtn = document.getElementById("refreshBtn");

const collectMoneyBtn =
  document.getElementById("collectMoneyBtn");

const collectMoneyModal =
  document.getElementById("collectMoneyModal");

const collectModalClose =
  document.getElementById("collectModalClose");

const cancelCollectBtn =
  document.getElementById("cancelCollectBtn");

const confirmCollectBtn =
  document.getElementById("confirmCollectBtn");

const successModal =
  document.getElementById("successModal");

const successCloseBtn =
  document.getElementById("successCloseBtn");


/* =====================================================
   REGISTRATION
===================================================== */

const registrationNumber =
  document.getElementById("registrationNumber");


/* =====================================================
   SELECTED STUDENT
===================================================== */

const selectedStudentInfo =
  document.getElementById("selectedStudentInfo");

const selectedStudentName =
  document.getElementById("selectedStudentName");

const selectedStudentReg =
  document.getElementById("selectedStudentReg");


/* =====================================================
   FEE FORM
===================================================== */

const feeType =
  document.getElementById("feeType");

const monthField =
  document.getElementById("monthField");

const beltField =
  document.getElementById("beltField");

const paymentMonth =
  document.getElementById("paymentMonth");

const examBelt =
  document.getElementById("examBelt");

const amount =
  document.getElementById("amount");

const amountHint =
  document.getElementById("amountHint");

const paymentMethod =
  document.getElementById("paymentMethod");

const paymentNote =
  document.getElementById("paymentNote");


/* =====================================================
   TABLE
===================================================== */

const paymentTableBody =
  document.getElementById("paymentTableBody");

const loadingState =
  document.getElementById("loadingState");

const emptyState =
  document.getElementById("emptyState");

const tableStatus =
  document.getElementById("tableStatus");

const searchInput =
  document.getElementById("searchInput");


/* =====================================================
   STATISTICS
===================================================== */

const totalCollection =
  document.getElementById("totalCollection");

const admissionCollection =
  document.getElementById("admissionCollection");

const monthlyCollection =
  document.getElementById("monthlyCollection");

const beltCollection =
  document.getElementById("beltCollection");

const currentMonthLabel =
  document.getElementById("currentMonthLabel");


/* =====================================================
   SUCCESS
===================================================== */

const successMessage =
  document.getElementById("successMessage");

const successTransactionId =
  document.getElementById("successTransactionId");


/* =====================================================
   GLOBAL DATA
===================================================== */

let students = [];
let payments = [];


/* =====================================================
   CUSTOM TOAST SYSTEM
===================================================== */

function createToastStyles() {
  if (document.getElementById("feeToastStyles")) {
    return;
  }

  const style = document.createElement("style");

  style.id = "feeToastStyles";

  style.textContent = `
    .fee-toast-container {
      position: fixed;
      top: 22px;
      right: 22px;
      z-index: 999999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: min(380px, calc(100vw - 30px));
      pointer-events: none;
    }

    .fee-toast {
      position: relative;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 15px 16px;
      border-radius: 14px;
      background: #ffffff;
      border: 1px solid rgba(0,0,0,0.08);
      box-shadow: 0 15px 40px rgba(0,0,0,0.15);
      pointer-events: auto;
      animation: feeToastIn 0.3s ease forwards;
      overflow: hidden;
    }

    .fee-toast.hide {
      animation: feeToastOut 0.3s ease forwards;
    }

    .fee-toast-icon {
      width: 38px;
      height: 38px;
      min-width: 38px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    }

    .fee-toast.success .fee-toast-icon {
      background: rgba(25, 135, 84, 0.12);
      color: #198754;
    }

    .fee-toast.error .fee-toast-icon {
      background: rgba(197, 26, 48, 0.12);
      color: #c51a30;
    }

    .fee-toast.warning .fee-toast-icon {
      background: rgba(211, 160, 81, 0.16);
      color: #a56d13;
    }

    .fee-toast.info .fee-toast-icon {
      background: rgba(13, 110, 253, 0.12);
      color: #0d6efd;
    }

    .fee-toast-content {
      flex: 1;
      min-width: 0;
    }

    .fee-toast-title {
      display: block;
      font-size: 14px;
      font-weight: 800;
      color: #171717;
      margin-bottom: 3px;
    }

    .fee-toast-message {
      display: block;
      font-size: 13px;
      line-height: 1.45;
      color: #666;
      word-break: break-word;
    }

    .fee-toast-close {
      border: 0;
      background: transparent;
      color: #888;
      cursor: pointer;
      font-size: 15px;
      padding: 2px;
    }

    .fee-toast-close:hover {
      color: #222;
    }

    .fee-toast-progress {
      position: absolute;
      left: 0;
      bottom: 0;
      height: 3px;
      width: 100%;
      animation: feeToastProgress 4s linear forwards;
    }

    .fee-toast.success .fee-toast-progress {
      background: #198754;
    }

    .fee-toast.error .fee-toast-progress {
      background: #c51a30;
    }

    .fee-toast.warning .fee-toast-progress {
      background: #d3a051;
    }

    .fee-toast.info .fee-toast-progress {
      background: #0d6efd;
    }

    .fee-confirm-overlay {
      position: fixed;
      inset: 0;
      z-index: 999998;
      background: rgba(8, 9, 8, 0.58);
      backdrop-filter: blur(5px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 18px;
    }

    .fee-confirm-box {
      width: min(420px, 100%);
      background: #fff;
      border-radius: 20px;
      padding: 26px;
      box-shadow: 0 25px 70px rgba(0,0,0,0.25);
      animation: feeConfirmIn 0.25s ease;
    }

    .fee-confirm-icon {
      width: 55px;
      height: 55px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(197, 26, 48, 0.10);
      color: #c51a30;
      font-size: 22px;
      margin-bottom: 16px;
    }

    .fee-confirm-box h3 {
      margin: 0 0 8px;
      font-size: 20px;
      color: #171717;
    }

    .fee-confirm-box p {
      margin: 0;
      color: #666;
      font-size: 14px;
      line-height: 1.55;
    }

    .fee-confirm-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 22px;
    }

    .fee-confirm-cancel,
    .fee-confirm-delete {
      border: 0;
      padding: 11px 18px;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 700;
      font-size: 13px;
    }

    .fee-confirm-cancel {
      background: #f1f1f1;
      color: #333;
    }

    .fee-confirm-delete {
      background: #c51a30;
      color: #fff;
    }

    .fee-confirm-delete:hover {
      background: #a91529;
    }

    .payment-delete-btn {
      border: 0;
      width: 34px;
      height: 34px;
      border-radius: 9px;
      background: rgba(197, 26, 48, 0.09);
      color: #c51a30;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: 0.2s ease;
    }

    .payment-delete-btn:hover {
      background: #c51a30;
      color: #fff;
      transform: translateY(-1px);
    }

    .payment-delete-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .payment-action-cell {
      text-align: center;
      white-space: nowrap;
    }

    @keyframes feeToastIn {
      from {
        opacity: 0;
        transform: translateX(30px);
      }

      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes feeToastOut {
      from {
        opacity: 1;
        transform: translateX(0);
      }

      to {
        opacity: 0;
        transform: translateX(30px);
      }
    }

    @keyframes feeToastProgress {
      from {
        width: 100%;
      }

      to {
        width: 0%;
      }
    }

    @keyframes feeConfirmIn {
      from {
        opacity: 0;
        transform: translateY(10px) scale(0.97);
      }

      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @media (max-width: 600px) {
      .fee-toast-container {
        top: 12px;
        right: 12px;
        left: 12px;
        width: auto;
      }

      .fee-toast {
        padding: 13px;
      }

      .fee-confirm-box {
        padding: 21px;
      }

      .fee-confirm-actions {
        flex-direction: column-reverse;
      }

      .fee-confirm-cancel,
      .fee-confirm-delete {
        width: 100%;
      }
    }
  `;

  document.head.appendChild(style);
}


/* =====================================================
   TOAST
===================================================== */

function showToast(
  message,
  type = "info",
  title = ""
) {
  createToastStyles();

  let container =
    document.getElementById("feeToastContainer");

  if (!container) {
    container = document.createElement("div");

    container.id = "feeToastContainer";

    container.className =
      "fee-toast-container";

    document.body.appendChild(container);
  }

  const toast =
    document.createElement("div");

  toast.className =
    `fee-toast ${type}`;

  let icon = "fa-circle-info";
  let defaultTitle = "Information";

  if (type === "success") {
    icon = "fa-circle-check";
    defaultTitle = "Success";
  }

  if (type === "error") {
    icon = "fa-circle-xmark";
    defaultTitle = "Error";
  }

  if (type === "warning") {
    icon = "fa-triangle-exclamation";
    defaultTitle = "Warning";
  }

  toast.innerHTML = `
    <div class="fee-toast-icon">
      <i class="fa-solid ${icon}"></i>
    </div>

    <div class="fee-toast-content">
      <strong class="fee-toast-title">
        ${escapeHTML(title || defaultTitle)}
      </strong>

      <span class="fee-toast-message">
        ${escapeHTML(message)}
      </span>
    </div>

    <button
      type="button"
      class="fee-toast-close"
    >
      <i class="fa-solid fa-xmark"></i>
    </button>

    <div class="fee-toast-progress"></div>
  `;

  container.appendChild(toast);

  const closeToast = () => {
    if (!toast.parentNode) {
      return;
    }

    toast.classList.add("hide");

    setTimeout(() => {
      toast.remove();

      if (
        container &&
        container.children.length === 0
      ) {
        container.remove();
      }
    }, 300);
  };

  toast
    .querySelector(".fee-toast-close")
    .addEventListener(
      "click",
      closeToast
    );

  setTimeout(closeToast, 4000);
}


/* =====================================================
   CUSTOM CONFIRMATION
===================================================== */

function showDeleteConfirmation(payment) {
  return new Promise((resolve) => {
    createToastStyles();

    const overlay =
      document.createElement("div");

    overlay.className =
      "fee-confirm-overlay";

    overlay.innerHTML = `
      <div class="fee-confirm-box">

        <div class="fee-confirm-icon">
          <i class="fa-solid fa-trash"></i>
        </div>

        <h3>Delete Payment?</h3>

        <p>
          Are you sure you want to delete this payment
          record? This action cannot be undone.
        </p>

        <p
          style="
            margin-top:10px;
            font-weight:700;
            color:#333;
          "
        >
          ${escapeHTML(
            payment.transactionId || "-"
          )}
        </p>

        <div class="fee-confirm-actions">

          <button
            type="button"
            class="fee-confirm-cancel"
            id="feeConfirmCancel"
          >
            Cancel
          </button>

          <button
            type="button"
            class="fee-confirm-delete"
            id="feeConfirmDelete"
          >
            <i class="fa-solid fa-trash"></i>
            Delete
          </button>

        </div>

      </div>
    `;

    document.body.appendChild(overlay);

    const close = (result) => {
      overlay.remove();
      resolve(result);
    };

    overlay
      .querySelector("#feeConfirmCancel")
      .addEventListener(
        "click",
        () => close(false)
      );

    overlay
      .querySelector("#feeConfirmDelete")
      .addEventListener(
        "click",
        () => close(true)
      );

    overlay.addEventListener(
      "click",
      (event) => {
        if (event.target === overlay) {
          close(false);
        }
      }
    );

    const escapeHandler = (event) => {
      if (event.key === "Escape") {
        document.removeEventListener(
          "keydown",
          escapeHandler
        );

        close(false);
      }
    };

    document.addEventListener(
      "keydown",
      escapeHandler
    );
  });
}


/* =====================================================
   CURRENT MONTH
===================================================== */

function getCurrentMonthValue() {
  const now = new Date();

  const year =
    now.getFullYear();

  const month =
    String(
      now.getMonth() + 1
    ).padStart(2, "0");

  return `${year}-${month}`;
}


/* =====================================================
   NORMALIZE MONTH VALUE
   IMPORTANT FOR "THIS MONTH" BOX
===================================================== */

function normalizeMonthValue(value) {
  if (!value) {
    return "";
  }

  /* Firestore Timestamp */
  if (
    value &&
    typeof value.toDate === "function"
  ) {
    const date = value.toDate();

    return `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;
  }

  /* Timestamp-like */
  if (
    value &&
    typeof value.seconds === "number"
  ) {
    const date =
      new Date(value.seconds * 1000);

    return `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;
  }

  const text =
    String(value).trim();

  if (!text) {
    return "";
  }

  /* YYYY-MM */
  const yyyyMm =
    text.match(/^(\d{4})-(\d{1,2})$/);

  if (yyyyMm) {
    return `${yyyyMm[1]}-${String(
      Number(yyyyMm[2])
    ).padStart(2, "0")}`;
  }

  /* YYYY-MM-DD */
  const yyyyMmDd =
    text.match(
      /^(\d{4})-(\d{1,2})-(\d{1,2})/
    );

  if (yyyyMmDd) {
    return `${yyyyMmDd[1]}-${String(
      Number(yyyyMmDd[2])
    ).padStart(2, "0")}`;
  }

  /* Try normal date */
  const date =
    new Date(text);

  if (
    !Number.isNaN(
      date.getTime()
    )
  ) {
    return `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;
  }

  /* Month name handling */
  const monthNames = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];

  const lower =
    text.toLowerCase();

  for (
    let i = 0;
    i < monthNames.length;
    i++
  ) {
    if (lower.includes(monthNames[i])) {
      const yearMatch =
        text.match(/\b(20\d{2})\b/);

      if (yearMatch) {
        return `${yearMatch[1]}-${String(
          i + 1
        ).padStart(2, "0")}`;
      }
    }
  }

  return "";
}


/* =====================================================
   FORMAT MONTH
===================================================== */

function formatMonth(monthValue) {
  if (!monthValue) {
    return "-";
  }

  const normalized =
    normalizeMonthValue(
      monthValue
    );

  if (normalized) {
    const [year, month] =
      normalized.split("-");

    const date =
      new Date(
        Number(year),
        Number(month) - 1,
        1
      );

    if (
      !Number.isNaN(
        date.getTime()
      )
    ) {
      return date.toLocaleDateString(
        "en-US",
        {
          month: "long",
          year: "numeric",
        }
      );
    }
  }

  return String(monthValue);
}


/* =====================================================
   FORMAT MONEY
===================================================== */

function formatMoney(value) {
  const numericValue =
    Number(value ?? 0);

  return `৳ ${(
    Number.isFinite(numericValue)
      ? numericValue
      : 0
  ).toLocaleString("en-BD")}`;
}


/* =====================================================
   FORMAT DATE
===================================================== */

function formatDate(timestamp) {
  if (!timestamp) {
    return "-";
  }

  let date = null;

  try {

    /* Firestore Timestamp */
    if (
      timestamp &&
      typeof timestamp.toDate ===
        "function"
    ) {
      date =
        timestamp.toDate();
    }

    /* Firestore Timestamp-like */
    else if (
      timestamp &&
      typeof timestamp.seconds ===
        "number"
    ) {
      date =
        new Date(
          timestamp.seconds * 1000
        );
    }

    /* JavaScript Date */
    else if (
      timestamp instanceof Date
    ) {
      date = timestamp;
    }

    /* String / Number */
    else {
      date =
        new Date(timestamp);
    }

    if (
      !date ||
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "-";
    }

    return date.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

  } catch (error) {

    console.error(
      "Date formatting error:",
      error
    );

    return "-";
  }
}


/* =====================================================
   GET PAYMENT DATE
===================================================== */

function getPaymentDate(payment) {
  return (
    payment.createdAt ||
    payment.paymentDate ||
    payment.paidAt ||
    payment.date ||
    null
  );
}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(text = "") {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* =====================================================
   NORMALIZE PAYMENT DATA
===================================================== */

function normalizePayment(id, data) {

  const raw = data || {};


  /* ===================================================
     FEE TYPE
  =================================================== */

  let normalizedFeeType =
    raw.feeType ??
    raw.paymentType ??
    raw.type ??
    "";

  normalizedFeeType =
    String(normalizedFeeType)
      .trim()
      .toLowerCase();

  if (
    normalizedFeeType.includes(
      "admission"
    )
  ) {
    normalizedFeeType =
      "admission";
  }

  else if (
    normalizedFeeType.includes(
      "monthly"
    )
  ) {
    normalizedFeeType =
      "monthly";
  }

  else if (
    normalizedFeeType.includes(
      "belt"
    )
  ) {
    normalizedFeeType =
      "belt";
  }


  /* ===================================================
     REGISTRATION
  =================================================== */

  const registrationNo =
    raw.registrationNo ??
    raw.registrationNumber ??
    raw.registrationId ??
    raw.studentRegistration ??
    raw.regNo ??
    raw.registration ??
    "";


  /* ===================================================
     STUDENT NAME
  =================================================== */

  const studentName =
    raw.studentName ??
    raw.name ??
    raw.student?.name ??
    "";


  /* ===================================================
     STUDENT ID
  =================================================== */

  const studentId =
    raw.studentId ??
    raw.studentID ??
    raw.userId ??
    "";


  /* ===================================================
     TRANSACTION ID
  =================================================== */

  const transactionId =
    raw.transactionId ??
    raw.transactionID ??
    raw.txnId ??
    raw.txnID ??
    raw.paymentId ??
    id;


  /* ===================================================
     AMOUNT
  =================================================== */

  const paymentAmount =
    raw.amount ??
    raw.paymentAmount ??
    raw.totalAmount ??
    raw.price ??
    0;


  /* ===================================================
     PAYMENT METHOD
  =================================================== */

  const paymentMethodValue =
    raw.paymentMethod ??
    raw.method ??
    raw.payment_method ??
    "";


  /* ===================================================
     MONTH
     
     IMPORTANT:
     সব possible old/new field support করবে
  =================================================== */

  const month =
    raw.month ??
    raw.paymentMonth ??
    raw.monthValue ??
    raw.paidMonth ??
    raw.monthName ??
    "";


  /* ===================================================
     BELT
     
     IMPORTANT:
     সব possible old/new field support করবে
  =================================================== */

  const belt =
    raw.belt ??
    raw.examBelt ??
    raw.beltName ??
    raw.beltLevel ??
    raw.examLevel ??
    "";


  /* ===================================================
     NOTE
  =================================================== */

  const note =
    raw.note ??
    raw.paymentNote ??
    raw.notes ??
    "";


  /* ===================================================
     STATUS

     User wants payment status = PAID.
     তাই old pending/success/completed হলেও
     এখানে paid হিসেবে normalize করা হচ্ছে।
  =================================================== */

  const status = "paid";


  return {

    id,

    transactionId:
      String(
        transactionId || "-"
      ),

    studentId:
      String(
        studentId || ""
      ),

    registrationNo:
      String(
        registrationNo || ""
      ),

    studentName:
      String(
        studentName || ""
      ),

    feeType:
      normalizedFeeType,

    month:
      String(
        month || ""
      ),

    belt:
      String(
        belt || ""
      ),

    amount:
      Number(
        paymentAmount
      ) || 0,

    paymentMethod:
      String(
        paymentMethodValue || ""
      ),

    note:
      String(
        note || ""
      ),

    status,

    createdAt:
      getPaymentDate(raw),

    raw,
  };
}


/* =====================================================
   OPEN / CLOSE MODALS
===================================================== */

function openCollectModal() {
  resetForm();

  collectMoneyModal
    ?.classList
    .remove("hidden");
}


function closeCollectModal() {
  collectMoneyModal
    ?.classList
    .add("hidden");
}


function closeSuccessModal() {
  successModal
    ?.classList
    .add("hidden");
}


/* =====================================================
   RESET FORM
===================================================== */

function resetForm() {

  if (registrationNumber) {
    registrationNumber.value = "";
  }

  if (feeType) {
    feeType.value = "";
  }

  if (paymentMonth) {
    paymentMonth.value =
      getCurrentMonthValue();
  }

  if (examBelt) {
    examBelt.value = "";
  }

  if (amount) {
    amount.value = "";
  }

  if (paymentMethod) {
    paymentMethod.value = "cash";
  }

  if (paymentNote) {
    paymentNote.value = "";
  }

  monthField
    ?.classList
    .add("hidden");

  beltField
    ?.classList
    .add("hidden");

  selectedStudentInfo
    ?.classList
    .add("hidden");

  if (selectedStudentName) {
    selectedStudentName.textContent =
      "-";
  }

  if (selectedStudentReg) {
    selectedStudentReg.textContent =
      "-";
  }

  if (amountHint) {
    amountHint.textContent =
      "Select a fee type to set the amount.";
  }

  resetStudentBoxStyle();
}


/* =====================================================
   RESET STUDENT BOX STYLE
===================================================== */

function resetStudentBoxStyle() {

  if (!selectedStudentInfo) {
    return;
  }

  selectedStudentInfo.style.background =
    "";

  selectedStudentInfo.style.borderColor =
    "";

  const icon =
    selectedStudentInfo.querySelector(
      ".selected-student-icon"
    );

  if (icon) {

    icon.style.background =
      "";

    icon.innerHTML =
      '<i class="fa-solid fa-user"></i>';
  }
}


/* =====================================================
   LOAD APPROVED STUDENTS
===================================================== */

async function loadStudents() {

  try {

    const studentsRef =
      collection(
        db,
        "students"
      );

    const approvedQuery =
      query(
        studentsRef,
        where(
          "status",
          "==",
          "approved"
        )
      );

    const snapshot =
      await getDocs(
        approvedQuery
      );

    students =
      snapshot.docs.map(
        (studentDoc) => ({
          id: studentDoc.id,
          ...studentDoc.data(),
        })
      );

    students.sort(
      (a, b) =>
        String(
          a.registrationNo ??
          a.registrationNumber ??
          ""
        ).localeCompare(
          String(
            b.registrationNo ??
            b.registrationNumber ??
            ""
          ),
          undefined,
          {
            numeric: true,
          }
        )
    );

    console.log(
      "Approved students loaded:",
      students.length
    );

  } catch (error) {

    console.error(
      "Error loading students:",
      error
    );

    students = [];

    showToast(
      "Unable to load approved students.",
      "error",
      "Student Loading Failed"
    );
  }
}


/* =====================================================
   FIND STUDENT
===================================================== */

function findStudentByRegistration(number) {

  if (!number) {
    return null;
  }

  const cleanNumber =
    String(number)
      .trim()
      .replace(/\D/g, "");

  if (!cleanNumber) {
    return null;
  }

  const registrationId =
    `KWKMA-${cleanNumber}`;

  const student =
    students.find(
      (item) => {

        const reg =
          item.registrationNo ??
          item.registrationNumber ??
          item.registrationId ??
          "";

        const normalized =
          String(reg)
            .trim()
            .toUpperCase();

        return (
          normalized ===
            registrationId.toUpperCase() ||

          normalized ===
            cleanNumber.toUpperCase() ||

          normalized ===
            `KWKMA-${String(
              Number(cleanNumber)
            )}`
        );
      }
    );

  return student || null;
}


/* =====================================================
   REGISTRATION INPUT
===================================================== */

if (registrationNumber) {

  registrationNumber.addEventListener(
    "input",
    () => {

      const number =
        registrationNumber.value
          .replace(/\D/g, "");

      registrationNumber.value =
        number;

      selectedStudentInfo
        ?.classList
        .add("hidden");

      if (selectedStudentName) {
        selectedStudentName.textContent =
          "-";
      }

      if (selectedStudentReg) {
        selectedStudentReg.textContent =
          "-";
      }

      resetStudentBoxStyle();

      if (!number) {
        return;
      }

      const student =
        findStudentByRegistration(
          number
        );

      const registrationId =
        `KWKMA-${number}`;


      /* STUDENT NOT FOUND */

      if (!student) {

        selectedStudentName.textContent =
          "Student not found";

        selectedStudentReg.textContent =
          registrationId;

        selectedStudentInfo
          ?.classList
          .remove("hidden");

        if (selectedStudentInfo) {

          selectedStudentInfo.style.background =
            "rgba(197, 26, 48, 0.08)";

          selectedStudentInfo.style.borderColor =
            "rgba(197, 26, 48, 0.20)";
        }

        const icon =
          selectedStudentInfo?.querySelector(
            ".selected-student-icon"
          );

        if (icon) {

          icon.style.background =
            "#c51a30";

          icon.innerHTML =
            '<i class="fa-solid fa-xmark"></i>';
        }

        return;
      }


      /* STUDENT FOUND */

      selectedStudentName.textContent =
        student.name ||
        student.studentName ||
        "Unknown Student";

      selectedStudentReg.textContent =
        student.registrationNo ||
        student.registrationNumber ||
        registrationId;

      selectedStudentInfo
        ?.classList
        .remove("hidden");

      if (selectedStudentInfo) {

        selectedStudentInfo.style.background =
          "rgba(211, 160, 81, 0.10)";

        selectedStudentInfo.style.borderColor =
          "rgba(211, 160, 81, 0.25)";
      }

      const icon =
        selectedStudentInfo?.querySelector(
          ".selected-student-icon"
        );

      if (icon) {

        icon.style.background =
          "#d3a051";

        icon.innerHTML =
          '<i class="fa-solid fa-user"></i>';
      }
    }
  );
}


/* =====================================================
   FEE TYPE CHANGE
===================================================== */

if (feeType) {

  feeType.addEventListener(
    "change",
    () => {

      const type =
        feeType.value;

      monthField
        ?.classList
        .add("hidden");

      beltField
        ?.classList
        .add("hidden");


      /* ADMISSION */

      if (type === "admission") {

        amount.value = 1500;

        amountHint.textContent =
          "Default admission fee: ৳ 1,500";
      }


      /* MONTHLY */

      else if (type === "monthly") {

        monthField
          ?.classList
          .remove("hidden");

        if (
          paymentMonth &&
          !paymentMonth.value
        ) {
          paymentMonth.value =
            getCurrentMonthValue();
        }

        amount.value = 1000;

        amountHint.textContent =
          "Default monthly fee: ৳ 1,000";
      }


      /* BELT */

      else if (type === "belt") {

        beltField
          ?.classList
          .remove("hidden");

        amount.value = 800;

        amountHint.textContent =
          "Default belt exam fee: ৳ 800 (You can change it if needed)";
      }


      /* EMPTY */

      else {

        amount.value = "";

        amountHint.textContent =
          "Select a fee type to set the amount.";
      }
    }
  );
}


/* =====================================================
   GENERATE TRANSACTION ID
===================================================== */

function generateTransactionId() {

  const now =
    new Date();

  const date =
    now
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "");

  const random =
    Math.floor(
      100000 +
      Math.random() * 900000
    );

  return `KWKMA-TXN-${date}-${random}`;
}


/* =====================================================
   CHECK DUPLICATE MONTHLY PAYMENT
===================================================== */

function hasMonthlyPayment(
  studentId,
  month
) {

  const targetMonth =
    normalizeMonthValue(
      month
    );

  return payments.some(
    (payment) => {

      const paymentMonthValue =
        normalizeMonthValue(
          payment.month
        );

      return (
        String(
          payment.studentId
        ) ===
          String(studentId) &&

        payment.feeType ===
          "monthly" &&

        paymentMonthValue ===
          targetMonth &&

        payment.status ===
          "paid"
      );
    }
  );
}


/* =====================================================
   COLLECT PAYMENT
===================================================== */

if (confirmCollectBtn) {

  confirmCollectBtn.addEventListener(
    "click",
    async () => {

      /* REGISTRATION */

      const number =
        registrationNumber
          ? registrationNumber.value.trim()
          : "";

      if (!number) {

        showToast(
          "Please enter registration number.",
          "warning",
          "Registration Required"
        );

        registrationNumber?.focus();

        return;
      }


      /* FIND STUDENT */

      const student =
        findStudentByRegistration(
          number
        );

      if (!student) {

        showToast(
          `Student KWKMA-${number} was not found.`,
          "error",
          "Student Not Found"
        );

        registrationNumber?.focus();

        return;
      }


      /* STUDENT ID */

      const studentId =
        student.id;


      /* FEE TYPE */

      const type =
        feeType.value;

      if (!type) {

        showToast(
          "Please select a fee type.",
          "warning",
          "Fee Type Required"
        );

        feeType.focus();

        return;
      }


      /* AMOUNT */

      const paymentAmount =
        Number(
          amount.value
        );

      if (
        !Number.isFinite(
          paymentAmount
        ) ||
        paymentAmount <= 0
      ) {

        showToast(
          "Please enter a valid amount.",
          "warning",
          "Invalid Amount"
        );

        amount.focus();

        return;
      }


      /* PAYMENT METHOD */

      const method =
        paymentMethod.value;


      /* NOTE */

      const note =
        paymentNote.value.trim();


      /* MONTH */

      if (
        type === "monthly" &&
        !paymentMonth.value
      ) {

        showToast(
          "Please select a month.",
          "warning",
          "Month Required"
        );

        paymentMonth.focus();

        return;
      }


      /* BELT */

      if (
        type === "belt" &&
        !examBelt.value
      ) {

        showToast(
          "Please select a belt.",
          "warning",
          "Belt Required"
        );

        examBelt.focus();

        return;
      }


      /* DUPLICATE MONTHLY */

      if (
        type === "monthly" &&
        hasMonthlyPayment(
          studentId,
          paymentMonth.value
        )
      ) {

        showToast(
          "This student has already paid the monthly fee for this month.",
          "warning",
          "Already Paid"
        );

        return;
      }


      /* TRANSACTION ID */

      const transactionId =
        generateTransactionId();


      /* EXTRA DATA */

      let month = "";
      let belt = "";


      if (type === "monthly") {

        month =
          paymentMonth.value;
      }


      if (type === "belt") {

        belt =
          examBelt.value;
      }


      /* STUDENT REGISTRATION */

      const studentRegistration =
        student.registrationNo ||
        student.registrationNumber ||
        `KWKMA-${number}`;


      /* STUDENT NAME */

      const studentName =
        student.name ||
        student.studentName ||
        "";


      /* =================================================
         PAYMENT DATA

         IMPORTANT:
         Month + Belt both explicitly saved.
         Status explicitly paid.
      ================================================= */

      const paymentData = {

        transactionId,

        studentId,

        registrationNo:
          studentRegistration,

        studentName,

        feeType:
          type,

        /* MONTHLY PAYMENT */

        month:
          month,

        paymentMonth:
          month,

        monthValue:
          month,


        /* BELT PAYMENT */

        belt:
          belt,

        examBelt:
          belt,

        beltName:
          belt,


        /* AMOUNT */

        amount:
          paymentAmount,


        /* PAYMENT METHOD */

        paymentMethod:
          method,


        /* NOTE */

        note,


        /* STATUS */

        status:
          "paid",


        /* DATE */

        createdAt:
          serverTimestamp(),

        paymentDate:
          serverTimestamp(),

        paidAt:
          serverTimestamp(),


        /* CREATED BY */

        createdBy:
          "admin",
      };


      /* SAVE */

      try {

        confirmCollectBtn.disabled =
          true;

        confirmCollectBtn.innerHTML = `
          <i class="fa-solid fa-spinner fa-spin"></i>
          <span>Processing...</span>
        `;


        const paymentRef =
          await addDoc(
            collection(
              db,
              "payments"
            ),
            paymentData
          );


        console.log(
          "Payment successfully saved:",
          paymentRef.id
        );


        /* SUCCESS MESSAGE */

        successMessage.textContent =
          `${studentName || "Student"} has successfully paid ${formatMoney(paymentAmount)}.`;

        successTransactionId.textContent =
          transactionId;


        /* CLOSE COLLECT MODAL */

        closeCollectModal();


        /* OPEN SUCCESS MODAL */

        successModal
          ?.classList
          .remove("hidden");


        /* RELOAD PAYMENT DATA */

        await loadPayments();


        /* RESET */

        resetForm();


        /* TOAST */

        showToast(
          "Payment has been successfully recorded.",
          "success",
          "Payment Successful"
        );

      } catch (error) {

        console.error(
          "Payment error:",
          error
        );

        showToast(
          `Failed to collect payment: ${
            error.message ||
            "Please try again."
          }`,
          "error",
          "Payment Failed"
        );

      } finally {

        confirmCollectBtn.disabled =
          false;

        confirmCollectBtn.innerHTML = `
          <i class="fa-solid fa-check"></i>
          <span>Collect Money</span>
        `;
      }
    }
  );
}


/* =====================================================
   DELETE PAYMENT
===================================================== */

async function deletePayment(
  paymentId
) {

  const payment =
    payments.find(
      (item) =>
        item.id === paymentId
    );

  if (!payment) {

    showToast(
      "Payment record was not found.",
      "error"
    );

    return;
  }


  const confirmed =
    await showDeleteConfirmation(
      payment
    );

  if (!confirmed) {
    return;
  }


  const deleteButton =
    document.querySelector(
      `[data-payment-id="${CSS.escape(paymentId)}"]`
    );


  try {

    if (deleteButton) {

      deleteButton.disabled =
        true;

      deleteButton.innerHTML =
        `<i class="fa-solid fa-spinner fa-spin"></i>`;
    }


    await deleteDoc(
      doc(
        db,
        "payments",
        paymentId
      )
    );


    showToast(
      "Payment record has been deleted successfully.",
      "success",
      "Payment Deleted"
    );


    await loadPayments();

  } catch (error) {

    console.error(
      "Delete payment error:",
      error
    );

    showToast(
      "Failed to delete payment record. Please try again.",
      "error",
      "Delete Failed"
    );
  }
}


/* =====================================================
   LOAD PAYMENTS
===================================================== */

async function loadPayments() {

  try {

    if (loadingState) {
      loadingState.style.display =
        "flex";
    }

    emptyState
      ?.classList
      .add("hidden");

    if (paymentTableBody) {
      paymentTableBody.innerHTML =
        "";
    }

    if (tableStatus) {
      tableStatus.textContent =
        "Loading payment history...";
    }


    /* LOAD FROM FIRESTORE */

    const paymentsRef =
      collection(
        db,
        "payments"
      );

    const snapshot =
      await getDocs(
        paymentsRef
      );


    console.log(
      "PAYMENTS DOCUMENT COUNT:",
      snapshot.size
    );


    /* NORMALIZE */

    payments =
      snapshot.docs.map(
        (paymentDoc) =>
          normalizePayment(
            paymentDoc.id,
            paymentDoc.data()
          )
      );


    console.log(
      "ALL PAYMENT DATA:",
      payments
    );


    /* SORT NEWEST */

    payments.sort(
      (a, b) => {

        const getTime =
          (value) => {

            if (!value) {
              return 0;
            }

            try {

              if (
                typeof value.toMillis ===
                  "function"
              ) {
                return value.toMillis();
              }

              if (
                typeof value.toDate ===
                  "function"
              ) {
                return value
                  .toDate()
                  .getTime();
              }

              if (
                typeof value.seconds ===
                  "number"
              ) {
                return (
                  value.seconds *
                  1000
                );
              }

              const date =
                new Date(value);

              return Number.isNaN(
                date.getTime()
              )
                ? 0
                : date.getTime();

            } catch {
              return 0;
            }
          };


        return (
          getTime(b.createdAt) -
          getTime(a.createdAt)
        );
      }
    );


    /* RENDER */

    renderPayments(
      payments
    );


    /* UPDATE STATISTICS */

    updateStatistics();

  } catch (error) {

    console.error(
      "ERROR LOADING PAYMENTS:",
      error
    );

    if (paymentTableBody) {
      paymentTableBody.innerHTML =
        "";
    }

    if (tableStatus) {
      tableStatus.textContent =
        "Failed to load payment history.";
    }

    emptyState
      ?.classList
      .add("hidden");

    showToast(
      `Failed to load payment history: ${
        error.message ||
        "Unknown error"
      }`,
      "error",
      "Loading Failed"
    );

  } finally {

    if (loadingState) {
      loadingState.style.display =
        "none";
    }
  }
}


/* =====================================================
   GET FEE TYPE NAME
===================================================== */

function getFeeTypeName(
  feeTypeValue
) {

  const type =
    String(
      feeTypeValue || ""
    ).toLowerCase();


  if (type === "admission") {
    return "Admission Fee";
  }


  if (type === "monthly") {
    return "Monthly Fee";
  }


  if (type === "belt") {
    return "Belt Exam Fee";
  }


  return (
    feeTypeValue || "-"
  );
}


/* =====================================================
   GET PAYMENT STATUS
===================================================== */

function getPaymentStatus(
  payment
) {

  /*
    সব collected payment
    PAID হিসেবে দেখাবে।
  */

  return {
    text: "✓ PAID",
    className: "paid",
  };
}


/* =====================================================
   GET MONTH / BELT DISPLAY
===================================================== */

function getPaymentExtra(
  payment
) {

  /* MONTHLY */

  if (
    payment.feeType ===
    "monthly"
  ) {

    const monthValue =
      payment.month ||
      payment.raw?.month ||
      payment.raw?.paymentMonth ||
      payment.raw?.monthValue ||
      payment.raw?.paidMonth ||
      "";

    if (monthValue) {

      return formatMonth(
        monthValue
      );
    }

    return "-";
  }


  /* BELT */

  if (
    payment.feeType ===
    "belt"
  ) {

    const beltValue =
      payment.belt ||
      payment.raw?.belt ||
      payment.raw?.examBelt ||
      payment.raw?.beltName ||
      payment.raw?.beltLevel ||
      payment.raw?.examLevel ||
      "";

    return (
      String(
        beltValue || "-"
      ).trim()
    );
  }


  /* ADMISSION */

  return "-";
}


/* =====================================================
   RENDER PAYMENTS
===================================================== */

function renderPayments(data) {

  if (!paymentTableBody) {
    return;
  }

  paymentTableBody.innerHTML =
    "";


  if (!data.length) {

    emptyState
      ?.classList
      .remove("hidden");

    if (tableStatus) {
      tableStatus.textContent =
        "No payment records found.";
    }

    return;
  }


  emptyState
    ?.classList
    .add("hidden");


  data.forEach(
    (payment) => {

      const feeTypeName =
        getFeeTypeName(
          payment.feeType
        );


      /* =================================================
         MONTH / BELT
      ================================================= */

      const feeExtra =
        getPaymentExtra(
          payment
        );


      /* STATUS */

      const paymentStatus =
        getPaymentStatus(
          payment
        );


      /* ROW */

      const row =
        document.createElement(
          "tr"
        );


      row.innerHTML = `
        <td>
          <strong>
            ${escapeHTML(
              payment.transactionId ||
              "-"
            )}
          </strong>
        </td>

        <td>
          ${escapeHTML(
            payment.registrationNo ||
            "-"
          )}
        </td>

        <td>
          ${escapeHTML(
            payment.studentName ||
            "-"
          )}
        </td>

        <td>
          <span
            class="fee-type-badge ${escapeHTML(
              payment.feeType || ""
            )}"
          >
            ${escapeHTML(
              feeTypeName
            )}
          </span>
        </td>

        <td>
          <strong>
            ${escapeHTML(
              feeExtra
            )}
          </strong>
        </td>

        <td>
          <span class="payment-amount">
            ${formatMoney(
              payment.amount
            )}
          </span>
        </td>

        <td>
          ${escapeHTML(
            String(
              payment.paymentMethod ||
              "-"
            )
              .replace(
                /_/g,
                " "
              )
              .toUpperCase()
          )}
        </td>

        <td>
          ${formatDate(
            payment.createdAt
          )}
        </td>

        <td>
          <span
            class="payment-status ${escapeHTML(
              paymentStatus.className
            )}"
          >
            ${escapeHTML(
              paymentStatus.text
            )}
          </span>
        </td>

        <td class="payment-action-cell">

          <button
            type="button"
            class="payment-delete-btn"
            data-payment-id="${escapeHTML(
              payment.id
            )}"
            title="Delete Payment"
          >
            <i class="fa-solid fa-trash"></i>
          </button>

        </td>
      `;


      /* DELETE BUTTON */

      const deleteButton =
        row.querySelector(
          ".payment-delete-btn"
        );


      if (deleteButton) {

        deleteButton.addEventListener(
          "click",
          () => {

            deletePayment(
              payment.id
            );
          }
        );
      }


      paymentTableBody.appendChild(
        row
      );
    }
  );


  if (tableStatus) {

    tableStatus.textContent =
      `${data.length} payment record${
        data.length > 1
          ? "s"
          : ""
      } found.`;
  }
}


/* =====================================================
   UPDATE STATISTICS
===================================================== */

function updateStatistics() {

  let total = 0;
  let admission = 0;
  let monthly = 0;
  let belt = 0;


  /* CURRENT MONTH */

  const currentMonth =
    getCurrentMonthValue();


  payments.forEach(
    (payment) => {

      /*
        Status সবসময় paid.
        Failed/cancelled legacy record থাকলে
        safety-এর জন্য ignore করা হচ্ছে।
      */

      const status =
        String(
          payment.status ||
          "paid"
        ).toLowerCase();


      if (
        status === "failed" ||
        status === "cancelled" ||
        status === "canceled"
      ) {
        return;
      }


      const paymentAmount =
        Number(
          payment.amount || 0
        );


      /* TOTAL */

      total +=
        paymentAmount;


      /* ADMISSION */

      if (
        payment.feeType ===
        "admission"
      ) {

        admission +=
          paymentAmount;
      }


      /* =================================================
         MONTHLY

         এখানে normalized month ব্যবহার করছি।
         তাই:

         2026-08
         August 2026
         2026-08-01

         সব current month হিসেবে কাজ করবে।
      ================================================= */

      if (
        payment.feeType ===
        "monthly"
      ) {

        const paymentMonth =
          normalizeMonthValue(
            payment.month ||
            payment.raw?.month ||
            payment.raw?.paymentMonth ||
            payment.raw?.monthValue
          );


        if (
          paymentMonth ===
          currentMonth
        ) {

          monthly +=
            paymentAmount;
        }
      }


      /* BELT */

      if (
        payment.feeType ===
        "belt"
      ) {

        belt +=
          paymentAmount;
      }
    }
  );


  /* =================================================
     UPDATE TOTAL BOX
  ================================================= */

  if (totalCollection) {

    totalCollection.textContent =
      formatMoney(total);
  }


  /* =================================================
     UPDATE ADMISSION BOX
  ================================================= */

  if (admissionCollection) {

    admissionCollection.textContent =
      formatMoney(
        admission
      );
  }


  /* =================================================
     UPDATE MONTHLY / THIS MONTH BOX
  ================================================= */

  if (monthlyCollection) {

    monthlyCollection.textContent =
      formatMoney(
        monthly
      );
  }


  /* =================================================
     UPDATE BELT BOX
  ================================================= */

  if (beltCollection) {

    beltCollection.textContent =
      formatMoney(
        belt
      );
  }


  /* =================================================
     CURRENT MONTH LABEL
  ================================================= */

  if (currentMonthLabel) {

    currentMonthLabel.textContent =
      `${formatMonth(
        currentMonth
      )} collection`;
  }


  console.log(
    "STATISTICS:",
    {
      total,
      admission,
      monthly,
      belt,
      currentMonth,
    }
  );
}


/* =====================================================
   SEARCH PAYMENT
===================================================== */

if (searchInput) {

  searchInput.addEventListener(
    "input",
    () => {

      const keyword =
        searchInput.value
          .trim()
          .toLowerCase();


      const filtered =
        payments.filter(
          (payment) => {

            const searchableText =
              `
              ${payment.transactionId || ""}
              ${payment.registrationNo || ""}
              ${payment.studentName || ""}
              ${payment.feeType || ""}
              ${payment.month || ""}
              ${formatMonth(payment.month) || ""}
              ${payment.belt || ""}
              ${payment.paymentMethod || ""}
              ${payment.status || ""}
              ${payment.note || ""}
              `
                .toLowerCase();


            return searchableText.includes(
              keyword
            );
          }
        );


      renderPayments(
        filtered
      );
    }
  );
}


/* =====================================================
   BUTTON EVENTS
===================================================== */

if (collectMoneyBtn) {

  collectMoneyBtn.addEventListener(
    "click",
    openCollectModal
  );
}


if (collectModalClose) {

  collectModalClose.addEventListener(
    "click",
    closeCollectModal
  );
}


if (cancelCollectBtn) {

  cancelCollectBtn.addEventListener(
    "click",
    closeCollectModal
  );
}


if (successCloseBtn) {

  successCloseBtn.addEventListener(
    "click",
    closeSuccessModal
  );
}


/* =====================================================
   REFRESH
===================================================== */

if (refreshBtn) {

  refreshBtn.addEventListener(
    "click",
    async () => {

      refreshBtn.disabled =
        true;

      refreshBtn.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Refreshing...
      `;


      try {

        await loadStudents();

        await loadPayments();


        showToast(
          "Payment data has been refreshed.",
          "success",
          "Refreshed"
        );

      } catch (error) {

        console.error(
          "Refresh error:",
          error
        );

        showToast(
          "Unable to refresh payment data.",
          "error"
        );

      } finally {

        refreshBtn.disabled =
          false;

        refreshBtn.innerHTML = `
          <i class="fa-solid fa-rotate-right"></i>
          Refresh
        `;
      }
    }
  );
}


/* =====================================================
   CLICK OUTSIDE COLLECT MODAL
===================================================== */

if (collectMoneyModal) {

  collectMoneyModal.addEventListener(
    "click",
    (event) => {

      if (
        event.target ===
        collectMoneyModal
      ) {

        closeCollectModal();
      }
    }
  );
}


/* =====================================================
   CLICK OUTSIDE SUCCESS MODAL
===================================================== */

if (successModal) {

  successModal.addEventListener(
    "click",
    (event) => {

      if (
        event.target ===
        successModal
      ) {

        closeSuccessModal();
      }
    }
  );
}


/* =====================================================
   ESC KEY
===================================================== */

document.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key !==
      "Escape"
    ) {
      return;
    }


    if (
      collectMoneyModal &&
      !collectMoneyModal.classList.contains(
        "hidden"
      )
    ) {

      closeCollectModal();
    }


    if (
      successModal &&
      !successModal.classList.contains(
        "hidden"
      )
    ) {

      closeSuccessModal();
    }
  }
);


/* =====================================================
   INITIALIZE
===================================================== */

async function initializeFeeManagement() {

  console.log(
    "KWKMA Fee Management initializing..."
  );


  createToastStyles();


  /* Set current month */

  if (paymentMonth) {

    paymentMonth.value =
      getCurrentMonthValue();
  }


  /* Load students */

  await loadStudents();


  /* Load payments */

  await loadPayments();


  console.log(
    "KWKMA Fee Management initialized."
  );
}


/* =====================================================
   START
===================================================== */

initializeFeeManagement();