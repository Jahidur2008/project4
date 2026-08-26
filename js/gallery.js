import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// =====================================================
// CLOUDINARY CONFIG
// =====================================================

const CLOUDINARY_CLOUD_NAME = "dcaloytg";
const CLOUDINARY_UPLOAD_PRESET = "KWKMA_ST_image";


// =====================================================
// FIRESTORE COLLECTION
// =====================================================

const GALLERY_COLLECTION = "gallery";


// =====================================================
// DOM
// =====================================================

const addPhotoBtn =
    document.getElementById("addPhotoBtn");

const emptyAddBtn =
    document.getElementById("emptyAddBtn");

const photoModal =
    document.getElementById("photoModal");

const closeModalBtn =
    document.getElementById("closeModalBtn");

const cancelUploadBtn =
    document.getElementById("cancelUploadBtn");

const choosePhotoBtn =
    document.getElementById("choosePhotoBtn");

const photoInput =
    document.getElementById("photoInput");

const uploadPhotoBtn =
    document.getElementById("uploadPhotoBtn");

const uploadArea =
    document.getElementById("uploadArea");

const selectedPreview =
    document.getElementById("selectedPreview");

const previewImage =
    document.getElementById("previewImage");

const selectedFileName =
    document.getElementById("selectedFileName");

const selectedFileSize =
    document.getElementById("selectedFileSize");

const removeSelectedBtn =
    document.getElementById("removeSelectedBtn");

const uploadStatus =
    document.getElementById("uploadStatus");

const uploadStatusText =
    document.getElementById("uploadStatusText");

const galleryGrid =
    document.getElementById("galleryGrid");

const galleryLoading =
    document.getElementById("galleryLoading");

const galleryEmpty =
    document.getElementById("galleryEmpty");

const photoCount =
    document.getElementById("photoCount");

const imageViewer =
    document.getElementById("imageViewer");

const viewerImage =
    document.getElementById("viewerImage");

const viewerCloseBtn =
    document.getElementById("viewerCloseBtn");


// =====================================================
// SELECTED FILE
// =====================================================

let selectedFile = null;


// =====================================================
// AUTH CHECK
// =====================================================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.replace("admin.html");

        return;

    }

    loadGallery();

});


// =====================================================
// OPEN PHOTO MODAL
// =====================================================

function openPhotoModal() {

    if (!photoModal) return;

    photoModal.hidden = false;

    document.body.style.overflow = "hidden";

}


// =====================================================
// CLOSE PHOTO MODAL
// =====================================================

function closePhotoModal() {

    if (!photoModal) return;

    photoModal.hidden = true;

    document.body.style.overflow = "";

    resetUploadForm();

}


// =====================================================
// ADD PHOTO BUTTONS
// =====================================================

if (addPhotoBtn) {

    addPhotoBtn.addEventListener(
        "click",
        openPhotoModal
    );

}

if (emptyAddBtn) {

    emptyAddBtn.addEventListener(
        "click",
        openPhotoModal
    );

}


// =====================================================
// CLOSE MODAL BUTTONS
// =====================================================

if (closeModalBtn) {

    closeModalBtn.addEventListener(
        "click",
        closePhotoModal
    );

}

if (cancelUploadBtn) {

    cancelUploadBtn.addEventListener(
        "click",
        closePhotoModal
    );

}


// =====================================================
// CLICK OUTSIDE PHOTO MODAL
// =====================================================

if (photoModal) {

    photoModal.addEventListener(
        "click",
        (event) => {

            if (event.target === photoModal) {

                closePhotoModal();

            }

        }
    );

}


// =====================================================
// CHOOSE PHOTO
// =====================================================

if (choosePhotoBtn) {

    choosePhotoBtn.addEventListener(
        "click",
        () => {

            photoInput?.click();

        }
    );

}


// =====================================================
// UPLOAD AREA CLICK
// =====================================================

if (uploadArea) {

    uploadArea.addEventListener(
        "click",
        (event) => {

            if (
                event.target.closest(
                    "#choosePhotoBtn"
                )
            ) {

                return;

            }

            photoInput?.click();

        }
    );

}


// =====================================================
// FILE SELECT
// =====================================================

if (photoInput) {

    photoInput.addEventListener(
        "change",
        () => {

            const file =
                photoInput.files?.[0];

            if (!file) return;

            handleSelectedFile(file);

        }
    );

}


// =====================================================
// HANDLE SELECTED FILE
// =====================================================

function handleSelectedFile(file) {

    const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
    ];


    if (!allowedTypes.includes(file.type)) {

        showGalleryToast(
            "Please select a JPG, PNG or WEBP image.",
            "error"
        );

        resetSelectedFile();

        return;

    }


    const maxSize =
        10 * 1024 * 1024;


    if (file.size > maxSize) {

        showGalleryToast(
            "Image size must be less than 10 MB.",
            "error"
        );

        resetSelectedFile();

        return;

    }


    selectedFile = file;


    if (selectedFileName) {

        selectedFileName.textContent =
            file.name;

    }


    if (selectedFileSize) {

        selectedFileSize.textContent =
            formatFileSize(file.size);

    }


    const objectUrl =
        URL.createObjectURL(file);


    if (previewImage) {

        previewImage.src =
            objectUrl;

    }


    if (selectedPreview) {

        selectedPreview.hidden =
            false;

    }


    if (uploadArea) {

        uploadArea.hidden =
            true;

    }


    if (uploadPhotoBtn) {

        uploadPhotoBtn.disabled =
            false;

    }

}


// =====================================================
// FORMAT FILE SIZE
// =====================================================

function formatFileSize(bytes) {

    if (!bytes) {

        return "0 KB";

    }


    const kb =
        bytes / 1024;


    if (kb < 1024) {

        return `${kb.toFixed(1)} KB`;

    }


    const mb =
        kb / 1024;


    return `${mb.toFixed(2)} MB`;

}


// =====================================================
// REMOVE SELECTED FILE
// =====================================================

if (removeSelectedBtn) {

    removeSelectedBtn.addEventListener(
        "click",
        resetSelectedFile
    );

}


function resetSelectedFile() {

    selectedFile = null;


    if (photoInput) {

        photoInput.value = "";

    }


    if (previewImage) {

        previewImage.src = "";

    }


    if (selectedPreview) {

        selectedPreview.hidden =
            true;

    }


    if (uploadArea) {

        uploadArea.hidden =
            false;

    }


    if (uploadPhotoBtn) {

        uploadPhotoBtn.disabled =
            true;

    }

}


// =====================================================
// RESET UPLOAD FORM
// =====================================================

function resetUploadForm() {

    resetSelectedFile();

    hideUploadStatus();

}


// =====================================================
// UPLOAD STATUS
// =====================================================

function showUploadStatus(message) {

    if (!uploadStatus) return;

    uploadStatus.hidden = false;


    if (uploadStatusText) {

        uploadStatusText.textContent =
            message;

    }

}


function hideUploadStatus() {

    if (!uploadStatus) return;

    uploadStatus.hidden = true;

}


// =====================================================
// UPLOAD PHOTO BUTTON
// =====================================================

if (uploadPhotoBtn) {

    uploadPhotoBtn.addEventListener(
        "click",
        uploadPhoto
    );

}


// =====================================================
// CLOUDINARY UPLOAD
// =====================================================

async function uploadPhoto() {

    if (!selectedFile) {

        showGalleryToast(
            "Please select a photo first.",
            "error"
        );

        return;

    }


    if (
        !CLOUDINARY_CLOUD_NAME ||
        !CLOUDINARY_UPLOAD_PRESET
    ) {

        showGalleryToast(
            "Cloudinary configuration is missing.",
            "error"
        );

        return;

    }


    try {

        if (uploadPhotoBtn) {

            uploadPhotoBtn.disabled =
                true;

        }


        showUploadStatus(
            "Uploading photo..."
        );


        const formData =
            new FormData();


        formData.append(
            "file",
            selectedFile
        );


        formData.append(
            "upload_preset",
            CLOUDINARY_UPLOAD_PRESET
        );


        const cloudinaryUrl =
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;


        const response =
            await fetch(
                cloudinaryUrl,
                {
                    method: "POST",
                    body: formData
                }
            );


        if (!response.ok) {

            throw new Error(
                "Cloudinary upload failed."
            );

        }


        const cloudinaryData =
            await response.json();


        const imageUrl =
            cloudinaryData.secure_url;


        const publicId =
            cloudinaryData.public_id;


        if (!imageUrl) {

            throw new Error(
                "Cloudinary did not return an image URL."
            );

        }


        showUploadStatus(
            "Saving photo..."
        );


        // =================================================
        // SAVE FIRESTORE
        // =================================================

        await addDoc(
            collection(
                db,
                GALLERY_COLLECTION
            ),
            {

                imageUrl:
                    imageUrl,

                cloudinaryPublicId:
                    publicId || "",

                fileName:
                    selectedFile.name,

                createdAt:
                    serverTimestamp()

            }
        );


        showUploadStatus(
            "Photo uploaded successfully."
        );


        await loadGallery();


        showGalleryToast(
            "Photo uploaded successfully.",
            "success"
        );


        setTimeout(() => {

            closePhotoModal();

        }, 700);


    } catch (error) {

        console.error(
            "Gallery Upload Error:",
            error
        );


        if (uploadPhotoBtn) {

            uploadPhotoBtn.disabled =
                false;

        }


        showUploadStatus(
            "Upload failed. Please try again."
        );


        showGalleryToast(
            error.message ||
            "Something went wrong while uploading the photo.",
            "error"
        );

    }

}


// =====================================================
// LOAD GALLERY
// =====================================================

async function loadGallery() {

    if (!galleryGrid) return;


    showGalleryLoading();


    try {

        const galleryRef =
            collection(
                db,
                GALLERY_COLLECTION
            );


        let snapshot;


        try {

            const galleryQuery =
                query(
                    galleryRef,
                    orderBy(
                        "createdAt",
                        "asc"
                    )
                );


            snapshot =
                await getDocs(
                    galleryQuery
                );


        } catch (orderError) {

            console.warn(
                "Ordered gallery query failed. Loading without order.",
                orderError
            );


            snapshot =
                await getDocs(
                    galleryRef
                );

        }


        galleryGrid.innerHTML =
            "";


        const photos = [];


        snapshot.forEach(
            (docSnapshot) => {

                const data =
                    docSnapshot.data();


                if (data.imageUrl) {

                    photos.push({

                        id:
                            docSnapshot.id,

                        ...data

                    });

                }

            }
        );


        // =================================================
        // SORT OLDEST → NEWEST
        // =================================================

        photos.sort(
            (a, b) => {

                const aTime =
                    getTimestampValue(
                        a.createdAt
                    );


                const bTime =
                    getTimestampValue(
                        b.createdAt
                    );


                return aTime - bTime;

            }
        );


        updatePhotoCount(
            photos.length
        );


        hideGalleryLoading();


        // =================================================
        // EMPTY
        // =================================================

        if (!photos.length) {

            showGalleryEmpty();

            return;

        }


        hideGalleryEmpty();


        // =================================================
        // RENDER
        // =================================================

        photos.forEach(
            (photo, index) => {

                renderPhoto(
                    photo,
                    index
                );

            }
        );


    } catch (error) {

        console.error(
            "Gallery Load Error:",
            error
        );


        hideGalleryLoading();


        galleryGrid.innerHTML = `

            <div class="gallery-error">

                <div class="error-icon">

                    <i class="fa-solid fa-triangle-exclamation"></i>

                </div>

                <h4>
                    Unable to load photos
                </h4>

                <p>
                    Please check your Firebase connection
                    and try again.
                </p>

                <button
                    class="error-retry-btn"
                    id="retryGalleryBtn"
                    type="button"
                >

                    <i class="fa-solid fa-rotate-right"></i>

                    Try Again

                </button>

            </div>

        `;


        const retryBtn =
            document.getElementById(
                "retryGalleryBtn"
            );


        if (retryBtn) {

            retryBtn.addEventListener(
                "click",
                loadGallery
            );

        }

    }

}


// =====================================================
// GET TIMESTAMP VALUE
// =====================================================

function getTimestampValue(timestamp) {

    if (!timestamp) {

        return 0;

    }


    if (
        typeof timestamp.toMillis ===
        "function"
    ) {

        return timestamp.toMillis();

    }


    if (
        typeof timestamp.toDate ===
        "function"
    ) {

        return timestamp.toDate().getTime();

    }


    if (
        timestamp instanceof Date
    ) {

        return timestamp.getTime();

    }


    return 0;

}


// =====================================================
// RENDER PHOTO
// =====================================================

function renderPhoto(photo, index) {

    if (!galleryGrid) return;


    const card =
        document.createElement(
            "div"
        );


    card.className =
        "gallery-card";


    // =================================================
    // IMAGE
    // =================================================

    const image =
        document.createElement(
            "img"
        );


    image.src =
        photo.imageUrl;


    image.alt =
        photo.fileName ||
        "KWKMA Academy Photo";


    image.loading =
        "lazy";


    image.onerror =
        () => {

            image.src =
                "./images/logo.png";

            image.style.objectFit =
                "contain";

            image.style.padding =
                "25px";

        };


    // =================================================
    // SERIAL NUMBER
    // =================================================

    const serial =
        document.createElement(
            "span"
        );


    serial.className =
        "gallery-serial";


    serial.textContent =
        index + 1;


    // =================================================
    // OVERLAY
    // =================================================

    const overlay =
        document.createElement(
            "div"
        );


    overlay.className =
        "gallery-overlay";


    // =================================================
    // VIEW BUTTON
    // =================================================

    const viewButton =
        document.createElement(
            "button"
        );


    viewButton.className =
        "view-image-btn";


    viewButton.type =
        "button";


    viewButton.title =
        "View Photo";


    viewButton.innerHTML =
        '<i class="fa-solid fa-expand"></i>';


    viewButton.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            event.stopPropagation();


            openImageViewer(
                photo.imageUrl
            );

        }
    );


    // =================================================
    // DELETE BUTTON
    // =================================================

    const deleteButton =
        document.createElement(
            "button"
        );


    deleteButton.className =
        "delete-image-btn";


    deleteButton.type =
        "button";


    deleteButton.title =
        "Delete Photo";


    deleteButton.setAttribute(
        "aria-label",
        "Delete Photo"
    );


    deleteButton.innerHTML =
        '<i class="fa-solid fa-trash"></i>';


    deleteButton.addEventListener(
        "click",
        async (event) => {

            event.preventDefault();

            event.stopPropagation();


            if (
                deleteButton.disabled
            ) {

                return;

            }


            await deleteGalleryPhoto(
                photo,
                card,
                deleteButton
            );

        }
    );


    // =================================================
    // OVERLAY BUTTONS
    // =================================================

    overlay.appendChild(
        viewButton
    );


    overlay.appendChild(
        deleteButton
    );


    // =================================================
    // CARD
    // =================================================

    card.appendChild(
        image
    );


    card.appendChild(
        serial
    );


    card.appendChild(
        overlay
    );


    // =================================================
    // CARD CLICK
    // =================================================

    card.addEventListener(
        "click",
        () => {

            openImageViewer(
                photo.imageUrl
            );

        }
    );


    galleryGrid.appendChild(
        card
    );

}


// =====================================================
// DELETE GALLERY PHOTO
// =====================================================
//
// IMPORTANT:
// এখানে Cloudinary DELETE নেই.
//
// শুধু Firestore document delete হবে.
// Firestore থেকে document delete হলে
// main website-এও image আর load হবে না.
//
// =====================================================

async function deleteGalleryPhoto(
    photo,
    card,
    deleteButton
) {

    if (!photo?.id) {

        showGalleryToast(
            "Invalid photo.",
            "error"
        );

        return;

    }


    // =================================================
    // CUSTOM CONFIRMATION
    // =================================================

    const confirmed =
        await showDeleteConfirm();


    if (!confirmed) {

        return;

    }


    try {

        // =================================================
        // DISABLE DELETE BUTTON
        // =================================================

        if (deleteButton) {

            deleteButton.disabled =
                true;

        }


        if (card) {

            card.classList.add(
                "deleting"
            );

        }


        // =================================================
        // DELETE FIRESTORE ONLY
        // =================================================
        //
        // Cloudinary delete intentionally removed.
        //
        // =================================================

        await deleteDoc(
            doc(
                db,
                GALLERY_COLLECTION,
                photo.id
            )
        );


        // =================================================
        // REMOVE CARD IMMEDIATELY
        // =================================================

        if (card) {

            card.remove();

        }


        // =================================================
        // RELOAD GALLERY
        // =================================================

        await loadGallery();


        // =================================================
        // SUCCESS TOAST
        // =================================================

        showGalleryToast(
            "Photo deleted successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "Gallery Delete Error:",
            error
        );


        if (card) {

            card.classList.remove(
                "deleting"
            );

        }


        if (deleteButton) {

            deleteButton.disabled =
                false;

        }


        showGalleryToast(
            error.message ||
            "Unable to delete photo.",
            "error"
        );

    }

}


// =====================================================
// DELETE CONFIRMATION MODAL
// =====================================================

function showDeleteConfirm() {

    return new Promise(
        (resolve) => {

            const existing =
                document.getElementById(
                    "galleryDeleteConfirm"
                );


            if (existing) {

                existing.remove();

            }


            const modal =
                document.createElement(
                    "div"
                );


            modal.id =
                "galleryDeleteConfirm";


            modal.className =
                "gallery-delete-modal";


            modal.innerHTML = `

                <div class="gallery-delete-box">

                    <div class="gallery-delete-icon">

                        <i class="fa-solid fa-trash"></i>

                    </div>

                    <h3>
                        Delete Photo?
                    </h3>

                    <p>
                        This photo will be removed
                        from the gallery.
                    </p>

                    <div class="gallery-delete-actions">

                        <button
                            type="button"
                            class="gallery-delete-cancel"
                            id="galleryDeleteCancel"
                        >

                            Cancel

                        </button>


                        <button
                            type="button"
                            class="gallery-delete-confirm"
                            id="galleryDeleteConfirmBtn"
                        >

                            <i class="fa-solid fa-trash"></i>

                            Delete

                        </button>

                    </div>

                </div>

            `;


            document.body.appendChild(
                modal
            );


            const cancelBtn =
                document.getElementById(
                    "galleryDeleteCancel"
                );


            const confirmBtn =
                document.getElementById(
                    "galleryDeleteConfirmBtn"
                );


            let finished =
                false;


            const escHandler =
                (event) => {

                    if (
                        event.key ===
                        "Escape"
                    ) {

                        document.removeEventListener(
                            "keydown",
                            escHandler
                        );


                        close(false);

                    }

                };


            const close =
                (result) => {

                    if (finished) {

                        return;

                    }


                    finished =
                        true;


                    document.removeEventListener(
                        "keydown",
                        escHandler
                    );


                    modal.remove();


                    resolve(result);

                };


            cancelBtn?.addEventListener(
                "click",
                () => {

                    close(false);

                }
            );


            confirmBtn?.addEventListener(
                "click",
                () => {

                    close(true);

                }
            );


            modal.addEventListener(
                "click",
                (event) => {

                    if (
                        event.target ===
                        modal
                    ) {

                        close(false);

                    }

                }
            );


            document.addEventListener(
                "keydown",
                escHandler
            );

        }
    );

}


// =====================================================
// CUSTOM TOAST
// =====================================================
//
// Browser alert() completely removed.
// =====================================================

function showGalleryToast(
    message,
    type = "success"
) {

    const oldToast =
        document.querySelector(
            ".gallery-custom-toast"
        );


    if (oldToast) {

        oldToast.remove();

    }


    const toast =
        document.createElement(
            "div"
        );


    toast.className =
        `gallery-custom-toast ${type}`;


    const icon =
        type === "success"
            ? "fa-circle-check"
            : "fa-circle-exclamation";


    toast.innerHTML = `

        <div class="gallery-toast-icon">

            <i class="fa-solid ${icon}"></i>

        </div>

        <div class="gallery-toast-text">

            ${message}

        </div>

        <button
            type="button"
            class="gallery-toast-close"
            aria-label="Close"
        >

            <i class="fa-solid fa-xmark"></i>

        </button>

    `;


    document.body.appendChild(
        toast
    );


    const closeBtn =
        toast.querySelector(
            ".gallery-toast-close"
        );


    closeBtn?.addEventListener(
        "click",
        () => {

            removeToast();

        }
    );


    const removeToast =
        () => {

            toast.classList.add(
                "hide"
            );


            setTimeout(
                () => {

                    if (toast) {

                        toast.remove();

                    }

                },
                300
            );

        };


    setTimeout(
        removeToast,
        3000
    );

}


// =====================================================
// PHOTO COUNT
// =====================================================

function updatePhotoCount(count) {

    if (!photoCount) return;


    photoCount.textContent =
        `${count} ${
            count === 1
                ? "Photo"
                : "Photos"
        }`;

}


// =====================================================
// SHOW LOADING
// =====================================================

function showGalleryLoading() {

    if (galleryLoading) {

        galleryLoading.hidden =
            false;

    }


    if (galleryEmpty) {

        galleryEmpty.hidden =
            true;

    }

}


// =====================================================
// HIDE LOADING
// =====================================================

function hideGalleryLoading() {

    if (galleryLoading) {

        galleryLoading.hidden =
            true;

    }

}


// =====================================================
// SHOW EMPTY
// =====================================================

function showGalleryEmpty() {

    if (galleryEmpty) {

        galleryEmpty.hidden =
            false;

    }

}


// =====================================================
// HIDE EMPTY
// =====================================================

function hideGalleryEmpty() {

    if (galleryEmpty) {

        galleryEmpty.hidden =
            true;

    }

}


// =====================================================
// IMAGE VIEWER
// =====================================================

function openImageViewer(
    imageUrl
) {

    if (!imageViewer) return;


    viewerImage.src =
        imageUrl;


    imageViewer.hidden =
        false;


    document.body.style.overflow =
        "hidden";

}


// =====================================================
// CLOSE IMAGE VIEWER
// =====================================================

function closeImageViewer() {

    if (!imageViewer) return;


    imageViewer.hidden =
        true;


    viewerImage.src =
        "";


    document.body.style.overflow =
        "";

}


if (viewerCloseBtn) {

    viewerCloseBtn.addEventListener(
        "click",
        closeImageViewer
    );

}


if (imageViewer) {

    imageViewer.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                imageViewer
            ) {

                closeImageViewer();

            }

        }
    );

}


// =====================================================
// ESC KEY
// =====================================================

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
            imageViewer &&
            !imageViewer.hidden
        ) {

            closeImageViewer();

            return;

        }


        if (
            photoModal &&
            !photoModal.hidden
        ) {

            closePhotoModal();

        }

    }
);