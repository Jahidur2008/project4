import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    orderBy,
    query
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// =====================================================
// ELEMENTS
// =====================================================

const galleryGrid =
    document.getElementById("homeGalleryGrid");

const galleryLoading =
    document.getElementById("homeGalleryLoading");

const galleryEmpty =
    document.getElementById("homeGalleryEmpty");


// =====================================================
// VIEW MORE BUTTON
// =====================================================

let viewMoreButton =
    document.getElementById("galleryViewMore") ||
    document.getElementById("viewAllGallery") ||
    document.getElementById("viewGalleryBtn");


// =====================================================
// LIGHTBOX ELEMENTS
// =====================================================

const lightbox =
    document.getElementById("galleryLightbox");

const lightboxImage =
    document.getElementById("galleryLightboxImage");

const lightboxClose =
    document.getElementById("galleryLightboxClose");

const lightboxPrev =
    document.getElementById("galleryLightboxPrev");

const lightboxNext =
    document.getElementById("galleryLightboxNext");

const lightboxCounter =
    document.getElementById("galleryLightboxCounter");


// =====================================================
// ZOOM ELEMENTS
// =====================================================

const galleryZoomIn =
    document.getElementById("galleryZoomIn");

const galleryZoomOut =
    document.getElementById("galleryZoomOut");

const galleryZoomReset =
    document.getElementById("galleryZoomReset");

const galleryZoomLevel =
    document.getElementById("galleryZoomLevel");


// =====================================================
// GALLERY DATA
// =====================================================

let galleryImages = [];

let currentImageIndex = 0;

let galleryExpanded = false;


// =====================================================
// ZOOM DATA
// =====================================================

let zoomScale = 1;

const zoomMin = 0.5;

const zoomMax = 5;

const zoomStep = 0.20;


// =====================================================
// CREATE VIEW MORE BUTTON IF NOT FOUND
// =====================================================

function createViewMoreButton() {

    if (viewMoreButton || !galleryGrid) {
        return;
    }

    viewMoreButton =
        document.createElement("button");

    viewMoreButton.id =
        "galleryViewMore";

    viewMoreButton.className =
        "gallery-view-more";

    viewMoreButton.type =
        "button";

    viewMoreButton.innerHTML = `
        <span class="view-more-text">
            View More Gallery
        </span>

        <i class="fa-solid fa-arrow-down"></i>
    `;

    galleryGrid.insertAdjacentElement(
        "afterend",
        viewMoreButton
    );

    viewMoreButton.addEventListener(
        "click",
        toggleGallery
    );
}


// =====================================================
// VIEW MORE BUTTON EVENT
// =====================================================

if (viewMoreButton) {

    viewMoreButton.addEventListener(
        "click",
        toggleGallery
    );
}


// =====================================================
// TOGGLE GALLERY
// =====================================================

function toggleGallery() {

    if (!galleryGrid) {
        return;
    }

    galleryExpanded =
        !galleryExpanded;

    renderGallery();


    // =================================================
    // VIEW LESS
    // =================================================

    if (galleryExpanded) {

        if (viewMoreButton) {

            viewMoreButton.innerHTML = `
                <span class="view-more-text">
                    View Less Gallery
                </span>

                <i class="fa-solid fa-arrow-up"></i>
            `;
        }


        // Scroll to first extra image
        setTimeout(() => {

            const firstExtraImage =
                galleryGrid.querySelector(
                    ".gallery-item:nth-child(7)"
                );

            if (firstExtraImage) {

                firstExtraImage.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            }

        }, 100);

    }

    // =================================================
    // VIEW MORE
    // =================================================

    else {

        if (viewMoreButton) {

            viewMoreButton.innerHTML = `
                <span class="view-more-text">
                    View More Gallery
                </span>

                <i class="fa-solid fa-arrow-down"></i>
            `;
        }


        galleryGrid.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}


// =====================================================
// LOAD GALLERY
// =====================================================

async function loadHomeGallery() {

    if (!galleryGrid) {

        console.error(
            "❌ #homeGalleryGrid not found."
        );

        return;
    }


    try {

        // =================================================
        // LOADING
        // =================================================

        galleryLoading?.removeAttribute(
            "hidden"
        );

        galleryEmpty?.setAttribute(
            "hidden",
            ""
        );


        // =================================================
        // FIRESTORE COLLECTION
        // =================================================

        const galleryRef =
            collection(
                db,
                "gallery"
            );


        // =================================================
        // IMPORTANT
        // OLD IMAGE FIRST
        // NEW IMAGE LAST
        // =================================================

        const galleryQuery =
            query(
                galleryRef,
                orderBy(
                    "createdAt",
                    "asc"
                )
            );


        // =================================================
        // GET DATA
        // =================================================

        const snapshot =
            await getDocs(
                galleryQuery
            );


        // =================================================
        // CLEAR GRID
        // =================================================

        galleryGrid.innerHTML = "";


        // =================================================
        // HIDE LOADING
        // =================================================

        galleryLoading?.setAttribute(
            "hidden",
            ""
        );


        // =================================================
        // EMPTY
        // =================================================

        if (snapshot.empty) {

            galleryEmpty?.removeAttribute(
                "hidden"
            );

            hideViewMoreButton();

            return;
        }


        // =================================================
        // COLLECT ALL IMAGES
        // =================================================

        galleryImages = [];


        snapshot.docs.forEach(
            (doc) => {

                const data =
                    doc.data();


                const imageUrl =
                    data.imageUrl ||
                    data.url ||
                    data.image ||
                    "";


                if (!imageUrl) {
                    return;
                }


                galleryImages.push({

                    id:
                        doc.id,

                    url:
                        imageUrl,

                    title:
                        data.title ||
                        "KWKMA Gallery",

                    createdAt:
                        data.createdAt || null
                });
            }
        );


        // =================================================
        // NO VALID IMAGE
        // =================================================

        if (
            galleryImages.length === 0
        ) {

            galleryEmpty?.removeAttribute(
                "hidden"
            );

            hideViewMoreButton();

            return;
        }


        // =================================================
        // RESET EXPANDED STATE
        // =================================================

        galleryExpanded = false;


        // =================================================
        // CREATE VIEW MORE BUTTON
        // =================================================

        createViewMoreButton();


        // =================================================
        // SHOW / HIDE VIEW MORE
        // =================================================

        if (
            galleryImages.length > 6
        ) {

            showViewMoreButton();

        } else {

            hideViewMoreButton();
        }


        // =================================================
        // RENDER
        // =================================================

        renderGallery();

    }

    catch (error) {

        console.error(
            "❌ Gallery Load Error:",
            error
        );


        galleryLoading?.setAttribute(
            "hidden",
            ""
        );


        galleryGrid.innerHTML = "";


        galleryEmpty?.removeAttribute(
            "hidden"
        );


        hideViewMoreButton();
    }
}


// =====================================================
// RENDER GALLERY
// =====================================================

function renderGallery() {

    if (!galleryGrid) {
        return;
    }


    galleryGrid.innerHTML = "";


    // =================================================
    // SHOW FIRST 6
    // OR ALL WHEN EXPANDED
    // =================================================

    const imagesToShow =
        galleryExpanded
            ? galleryImages
            : galleryImages.slice(
                0,
                6
            );


    // =================================================
    // CREATE EACH IMAGE
    // =================================================

    imagesToShow.forEach(
        (imageData, index) => {

            const item =
                document.createElement(
                    "article"
                );


            item.className =
                "gallery-item";


            // =================================================
            // EXTRA IMAGE CLASS
            // =================================================

            if (index >= 6) {

                item.classList.add(
                    "gallery-extra-item"
                );
            }


            // =================================================
            // IMAGE HTML
            // =================================================

            item.innerHTML = `
                <img
                    src="${escapeHtml(
                        imageData.url
                    )}"
                    alt="${escapeHtml(
                        imageData.title
                    )}"
                    loading="lazy"
                >

                <div class="gallery-overlay">
                    <i class="fa-solid fa-expand"></i>
                </div>
            `;


            // =================================================
            // CLICK IMAGE
            // =================================================

            item.addEventListener(
                "click",
                () => {

                    const realIndex =
                        galleryImages.findIndex(
                            image =>
                                image.id ===
                                imageData.id
                        );


                    openLightbox(
                        realIndex >= 0
                            ? realIndex
                            : index
                    );
                }
            );


            // =================================================
            // IMAGE ERROR
            // =================================================

            const image =
                item.querySelector(
                    "img"
                );


            image?.addEventListener(
                "error",
                () => {

                    item.remove();
                }
            );


            // =================================================
            // ADD TO GRID
            // =================================================

            galleryGrid.appendChild(
                item
            );
        }
    );
}


// =====================================================
// SHOW VIEW MORE BUTTON
// =====================================================

function showViewMoreButton() {

    if (!viewMoreButton) {
        return;
    }


    viewMoreButton.hidden =
        false;


    viewMoreButton.style.display =
        "inline-flex";
}


// =====================================================
// HIDE VIEW MORE BUTTON
// =====================================================

function hideViewMoreButton() {

    if (!viewMoreButton) {
        return;
    }


    viewMoreButton.hidden =
        true;


    viewMoreButton.style.display =
        "none";
}


// =====================================================
// OPEN LIGHTBOX
// =====================================================

function openLightbox(index) {

    if (
        !galleryImages.length ||
        !lightbox ||
        !lightboxImage
    ) {

        return;
    }


    // =================================================
    // KEEP INDEX VALID
    // =================================================

    currentImageIndex =
        Math.max(
            0,
            Math.min(
                galleryImages.length - 1,
                index
            )
        );


    // =================================================
    // RESET ZOOM
    // =================================================

    resetZoom();


    // =================================================
    // UPDATE IMAGE
    // =================================================

    updateLightbox();


    // =================================================
    // SHOW LIGHTBOX
    // =================================================

    lightbox.classList.add(
        "show"
    );


    lightbox.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.classList.add(
        "gallery-lightbox-open"
    );


    lightboxImage.style.pointerEvents =
        "auto";
}


// =====================================================
// CLOSE LIGHTBOX
// =====================================================

function closeLightbox() {

    if (!lightbox) {
        return;
    }


    lightbox.classList.remove(
        "show"
    );


    lightbox.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.classList.remove(
        "gallery-lightbox-open"
    );


    resetZoom();
}


// =====================================================
// UPDATE LIGHTBOX
// =====================================================

function updateLightbox() {

    const currentImage =
        galleryImages[
            currentImageIndex
        ];


    if (
        !currentImage ||
        !lightboxImage
    ) {

        return;
    }


    // =================================================
    // RESET ZOOM BEFORE NEW IMAGE
    // =================================================

    resetZoom();


    // =================================================
    // UPDATE SOURCE
    // =================================================

    lightboxImage.src =
        currentImage.url;


    lightboxImage.alt =
        currentImage.title;


    // =================================================
    // COUNTER
    // =================================================

    if (lightboxCounter) {

        lightboxCounter.textContent =
            `${currentImageIndex + 1} / ${galleryImages.length}`;
    }
}


// =====================================================
// NEXT IMAGE
// =====================================================

function showNextImage() {

    if (!galleryImages.length) {
        return;
    }


    currentImageIndex =
        (
            currentImageIndex + 1
        ) %
        galleryImages.length;


    updateLightbox();
}


// =====================================================
// PREVIOUS IMAGE
// =====================================================

function showPreviousImage() {

    if (!galleryImages.length) {
        return;
    }


    currentImageIndex =
        (
            currentImageIndex -
            1 +
            galleryImages.length
        ) %
        galleryImages.length;


    updateLightbox();
}


// =====================================================
// LIGHTBOX CLOSE
// =====================================================

lightboxClose?.addEventListener(
    "click",
    closeLightbox
);


// =====================================================
// NEXT BUTTON
// =====================================================

lightboxNext?.addEventListener(
    "click",
    (event) => {

        event.preventDefault();

        event.stopPropagation();

        showNextImage();
    }
);


// =====================================================
// PREVIOUS BUTTON
// =====================================================

lightboxPrev?.addEventListener(
    "click",
    (event) => {

        event.preventDefault();

        event.stopPropagation();

        showPreviousImage();
    }
);


// =====================================================
// BACKDROP CLICK
// =====================================================

lightbox?.addEventListener(
    "click",
    (event) => {

        if (
            event.target ===
            lightbox
        ) {

            closeLightbox();
        }
    }
);


// =====================================================
// KEYBOARD
// =====================================================

document.addEventListener(
    "keydown",
    (event) => {

        if (
            !lightbox?.classList.contains(
                "show"
            )
        ) {

            return;
        }


        // =================================================
        // ESC
        // =================================================

        if (
            event.key ===
            "Escape"
        ) {

            closeLightbox();

            return;
        }


        // =================================================
        // NEXT
        // =================================================

        if (
            event.key ===
            "ArrowRight"
        ) {

            showNextImage();

            return;
        }


        // =================================================
        // PREVIOUS
        // =================================================

        if (
            event.key ===
            "ArrowLeft"
        ) {

            showPreviousImage();

            return;
        }


        // =================================================
        // ZOOM IN
        // =================================================

        if (
            event.key === "+" ||
            event.key === "="
        ) {

            event.preventDefault();

            setZoom(
                zoomScale +
                zoomStep
            );

            return;
        }


        // =================================================
        // ZOOM OUT
        // =================================================

        if (
            event.key === "-"
        ) {

            event.preventDefault();

            setZoom(
                zoomScale -
                zoomStep
            );

            return;
        }


        // =================================================
        // RESET
        // =================================================

        if (
            event.key === "0"
        ) {

            event.preventDefault();

            resetZoom();
        }
    }
);


// =====================================================
// UPDATE ZOOM
// =====================================================

function updateZoom() {

    if (!lightboxImage) {
        return;
    }


    lightboxImage.style.transform =
        `scale(${zoomScale})`;


    lightboxImage.style.transformOrigin =
        "center center";


    // =================================================
    // ZOOM LEVEL
    // =================================================

    if (galleryZoomLevel) {

        galleryZoomLevel.textContent =
            `${Math.round(
                zoomScale * 100
            )}%`;
    }


    // =================================================
    // CURSOR
    // =================================================

    if (
        zoomScale > 1
    ) {

        lightboxImage.style.cursor =
            "zoom-out";

    } else {

        lightboxImage.style.cursor =
            "zoom-in";
    }
}


// =====================================================
// SET ZOOM
// =====================================================

function setZoom(value) {

    zoomScale =
        Math.max(
            zoomMin,
            Math.min(
                zoomMax,
                value
            )
        );


    updateZoom();
}


// =====================================================
// RESET ZOOM
// =====================================================

function resetZoom() {

    zoomScale = 1;


    if (lightboxImage) {

        lightboxImage.style.transform =
            "scale(1)";


        lightboxImage.style.transformOrigin =
            "center center";


        lightboxImage.style.cursor =
            "zoom-in";
    }


    if (galleryZoomLevel) {

        galleryZoomLevel.textContent =
            "100%";
    }
}


// =====================================================
// ZOOM IN BUTTON
// =====================================================

galleryZoomIn?.addEventListener(
    "click",
    (event) => {

        event.preventDefault();

        event.stopPropagation();

        setZoom(
            zoomScale +
            zoomStep
        );
    }
);


// =====================================================
// ZOOM OUT BUTTON
// =====================================================

galleryZoomOut?.addEventListener(
    "click",
    (event) => {

        event.preventDefault();

        event.stopPropagation();

        setZoom(
            zoomScale -
            zoomStep
        );
    }
);


// =====================================================
// RESET ZOOM BUTTON
// =====================================================

galleryZoomReset?.addEventListener(
    "click",
    (event) => {

        event.preventDefault();

        event.stopPropagation();

        resetZoom();
    }
);


// =====================================================
// MOUSE WHEEL ZOOM
// =====================================================

lightbox?.addEventListener(
    "wheel",
    (event) => {

        if (
            !lightbox.classList.contains(
                "show"
            )
        ) {

            return;
        }


        event.preventDefault();

        event.stopPropagation();


        // =================================================
        // SCROLL UP = ZOOM IN
        // SCROLL DOWN = ZOOM OUT
        // =================================================

        if (
            event.deltaY < 0
        ) {

            setZoom(
                zoomScale +
                zoomStep
            );

        } else {

            setZoom(
                zoomScale -
                zoomStep
            );
        }
    },
    {
        passive: false
    }
);


// =====================================================
// MOUSE WHEEL DIRECTLY ON IMAGE
// =====================================================

lightboxImage?.addEventListener(
    "wheel",
    (event) => {

        if (
            !lightbox?.classList.contains(
                "show"
            )
        ) {

            return;
        }


        event.preventDefault();

        event.stopPropagation();


        if (
            event.deltaY < 0
        ) {

            setZoom(
                zoomScale +
                zoomStep
            );

        } else {

            setZoom(
                zoomScale -
                zoomStep
            );
        }
    },
    {
        passive: false
    }
);


// =====================================================
// HTML ESCAPE
// =====================================================

function escapeHtml(value) {

    return String(value)

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
// INITIAL ZOOM
// =====================================================

resetZoom();


// =====================================================
// START
// =====================================================

loadHomeGallery();