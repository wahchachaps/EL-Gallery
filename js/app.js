/* =========================================================
   EL GALLERY
   ========================================================= */


const API_URL =
    "https://el-gallery-api.elvincemaranan.workers.dev";
    
const CURRENT_YEAR = 2026;
const START_MONTH = 6;

const MONTHS = [
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

const VISIBLE_MONTHS =
    MONTHS
        .map((name, index) => ({
            name,
            index
        }))
        .filter(month =>
            month.index >= START_MONTH
        );

const MONTH_NOTES = [
    "where the year began ♡",
    "little moments",
    "keep this one",
    "days worth remembering",
    "somewhere between then & now",
    "halfway there",
    "summer frames",
    "another roll",
    "our little archive",
    "caught on film",
    "almost another year",
    "end of this chapter"
];


/* =========================================================
   MEMORIES

   REAL IMAGE EXAMPLE:

   {
       id: "photo-1",
       type: "image",
       src: "assets/images/photo1.jpg",
       date: "2026-01-15",
       caption: "Our day ♡"
   }

   REAL GIF EXAMPLE:

   {
       id: "gif-1",
       type: "gif",
       src: "assets/images/cute.gif",
       date: "2026-02-14",
       caption: "Us ♡"
   }

   REAL VIDEO EXAMPLE:

   {
       id: "video-1",
       type: "video",
       src: "assets/videos/movie-night.mp4",
       date: "2026-03-10",
       caption: "Movie night"
   }
   ========================================================= */

let memories = [];


/* =========================================================
   STATE
   ========================================================= */

let currentViewerIndex = 0;

let selectedUploadFile = null;

let videoObserver = null;

let isPointerDragging = false;

let pointerStartX = 0;

let pointerStartScrollLeft = 0;

let toastTimer = null;


/* =========================================================
   DOM
   ========================================================= */

const galleryTrack =
    document.getElementById("galleryTrack");

const monthsContainer =
    document.getElementById("monthsContainer");

const monthsTimeline =
    document.getElementById("monthsTimeline");

const timelineProgress =
    document.getElementById("timelineProgress");

const progressNumber =
    document.getElementById("progressNumber");

const introMemoryCount =
    document.getElementById("introMemoryCount");


const startRollButton =
    document.getElementById("startRollButton");

const brandButton =
    document.getElementById("brandButton");

const homeButton =
    document.getElementById("homeButton");

const filmsButton =
    document.getElementById("filmsButton");

const favoritesButton =
    document.getElementById("favoritesButton");

const searchButton =
    document.getElementById("searchButton");

const addMemoryButton =
    document.getElementById("addMemoryButton");

const endAddMemoryButton =
    document.getElementById("endAddMemoryButton");

const previousButton =
    document.getElementById("previousButton");

const nextButton =
    document.getElementById("nextButton");


/* VIEWER */

const viewerModal =
    document.getElementById("viewerModal");

const viewerMedia =
    document.getElementById("viewerMedia");

const viewerFrame =
    document.getElementById("viewerFrame");

const viewerDate =
    document.getElementById("viewerDate");

const viewerCaption =
    document.getElementById("viewerCaption");

const viewerMonth =
    document.getElementById("viewerMonth");

const viewerFavoriteButton =
    document.getElementById("viewerFavoriteButton");

const viewerPrevious =
    document.getElementById("viewerPrevious");

const viewerNext =
    document.getElementById("viewerNext");

const closeViewerButton =
    document.getElementById("closeViewerButton");


/* UPLOAD */

const uploadModal =
    document.getElementById("uploadModal");

const uploadForm =
    document.getElementById("uploadForm");

const memoryFile =
    document.getElementById("memoryFile");

const memoryDate =
    document.getElementById("memoryDate");

const memoryCaption =
    document.getElementById("memoryCaption");

const uploadPreview =
    document.getElementById("uploadPreview");

const dropZone =
    document.getElementById("dropZone");

const closeUploadButton =
    document.getElementById("closeUploadButton");


/* SEARCH */

const searchModal =
    document.getElementById("searchModal");

const searchInput =
    document.getElementById("searchInput");

const searchResults =
    document.getElementById("searchResults");

const closeSearchButton =
    document.getElementById("closeSearchButton");


/* FAVORITES */

const favoritesModal =
    document.getElementById("favoritesModal");

const favoritesGrid =
    document.getElementById("favoritesGrid");

const closeFavoritesButton =
    document.getElementById("closeFavoritesButton");


const toast =
    document.getElementById("toast");


/* =========================================================
   HELPERS
   ========================================================= */

function escapeHTML(value) {

    return String(value)

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");
}


function sortedMemories() {

    return [...memories].sort(
        (a, b) =>
            new Date(a.date) -
            new Date(b.date)
    );
}


function getMonthIndex(date) {

    return new Date(
        `${date}T12:00:00`
    ).getMonth();
}


function getYear(date) {

    return new Date(
        `${date}T12:00:00`
    ).getFullYear();
}


function getMemoryMonthName(memory) {

    return MONTHS[
        getMonthIndex(memory.date)
    ];
}


function getMemoryById(id) {

    return memories.find(
        memory =>
            memory.id === id
    );
}


function formatDate(date) {

    return new Date(
        `${date}T12:00:00`
    )
        .toLocaleDateString(
            "en-US",
            {
                month: "short",
                day: "2-digit",
                year: "2-digit"
            }
        )
        .toUpperCase();
}


function dateToInputValue(date) {

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;
}


function showToast(message) {

    clearTimeout(toastTimer);

    toast.textContent =
        message;

    toast.classList.add(
        "show"
    );


    toastTimer =
        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 2200);
}


/* =========================================================
   FAVORITES
   ========================================================= */

function getFavoriteIds() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "el-gallery-favorites"
            )
        ) || [];

    } catch {

        return [];
    }
}


function saveFavoriteIds(ids) {

    localStorage.setItem(
        "el-gallery-favorites",
        JSON.stringify(ids)
    );
}


function isFavorite(id) {

    return getFavoriteIds()
        .includes(id);
}


function toggleFavorite(id) {

    const favorites =
        getFavoriteIds();

    const index =
        favorites.indexOf(id);


    if (index === -1) {

        favorites.push(id);

        showToast(
            "Added to favorites ♡"
        );

    } else {

        favorites.splice(
            index,
            1
        );

        showToast(
            "Removed from favorites"
        );
    }


    saveFavoriteIds(
        favorites
    );

    updateFavoriteButtons();
}


/* =========================================================
   TIMELINE
   ========================================================= */

function buildTimeline() {

    monthsTimeline.innerHTML =
        "";


    VISIBLE_MONTHS.forEach(
    ({ name: month, index: monthIndex }, rollIndex) => {


            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "timeline-month";

            button.dataset.month =
                monthIndex;

            button.textContent =
                month
                    .substring(0, 3)
                    .toUpperCase();


            button.addEventListener(
                "click",
                () => {

                    scrollToMonth(
                        monthIndex
                    );

                }
            );


            monthsTimeline.appendChild(
                button
            );

        }
    );
}


/* =========================================================
   MEDIA
   ========================================================= */

function createMemoryMedia(memory) {

    /*
        GIF files automatically animate
        through normal IMG elements.
    */

    if (
        memory.type === "image" ||
        memory.type === "gif"
    ) {

        return `

            <img
                class="memory-media"
                src="${memory.src}"
                alt="${escapeHTML(
                    memory.caption ||
                    "Memory"
                )}"
                loading="lazy"
                draggable="false"
            >

        `;
    }


    /*
        Videos are muted previews.

        JavaScript automatically plays them
        when visible and pauses them when
        they leave the screen.
    */

    if (memory.type === "video") {

        return `

            <video
                class="
                    memory-media
                    memory-video
                    preview-video
                "

                src="${memory.src}"

                muted
                loop
                playsinline

                preload="metadata"

                disablepictureinpicture
            ></video>

        `;
    }


    return `

        <div class="placeholder-frame">

            <strong>
                ${escapeHTML(
                    memory.caption ||
                    "Memory"
                )}
            </strong>

            <span>
                ${formatDate(memory.date)}
            </span>

        </div>

    `;
}


/* =========================================================
   VIDEO AUTOPLAY
   ========================================================= */

function setupVideoAutoplay() {

    if (videoObserver) {

        videoObserver.disconnect();
    }


    videoObserver =
        new IntersectionObserver(

            entries => {

                entries.forEach(
                    entry => {

                        const video =
                            entry.target;


                        if (
                            entry.isIntersecting &&
                            entry.intersectionRatio >= 0.55
                        ) {

                            playPreviewVideo(
                                video
                            );

                        } else {

                            pausePreviewVideo(
                                video
                            );
                        }

                    }
                );

            },

            {
                root:
                    galleryTrack,

                threshold: [
                    0,
                    0.25,
                    0.55,
                    0.75,
                    1
                ]
            }

        );


    document
        .querySelectorAll(
            ".preview-video"
        )
        .forEach(video => {

            videoObserver.observe(
                video
            );

        });
}


function playPreviewVideo(video) {

    video.muted = true;

    video.loop = true;

    video.playsInline = true;


    const promise =
        video.play();


    if (promise) {

        promise.catch(
            () => {}
        );
    }
}


function pausePreviewVideo(video) {

    video.pause();
}


/* =========================================================
   FRAME LAYOUT
   ========================================================= */

function getFrameLayout(index) {

    const layouts = [
        "",
        "wide",
        "portrait",
        "",
        "wide",
        "",
        "portrait"
    ];


    return layouts[
        index % layouts.length
    ];
}


/* =========================================================
   CREATE FRAMES
   ========================================================= */

function createMonthFrames(
    monthMemories,
    monthIndex
) {

    if (!monthMemories.length) {

        return `

            <button
                class="empty-film"
                data-empty-month="${monthIndex}"
            >

                <strong>
                    No film yet.
                </strong>

                <span>
                    + ADD A MEMORY
                </span>

            </button>

        `;
    }


    return monthMemories
        .map(
            (memory, index) => {

                const frame =
                    String(
                        index + 1
                    ).padStart(
                        2,
                        "0"
                    );


                return `

                    <article
                        class="
                            memory-frame
                            ${getFrameLayout(index)}
                        "

                        data-memory-id="${memory.id}"
                    >

                        ${createMemoryMedia(memory)}


                        ${
                            memory.type === "video"

                            ? `
                                <div class="video-indicator">
                                    ● LIVE
                                </div>
                            `

                            : ""
                        }


                        <div class="memory-overlay">

                            <span class="memory-frame-number">
                                ${frame}
                            </span>


                            <div class="memory-overlay-bottom">

                                <div>

                                    <p class="memory-caption">
                                        ${escapeHTML(
                                            memory.caption ||
                                            "Untitled memory"
                                        )}
                                    </p>

                                    <p class="memory-date">
                                        ${formatDate(
                                            memory.date
                                        )}
                                    </p>

                                </div>


                                <button
                                    class="
                                        frame-favorite
                                        ${
                                            isFavorite(
                                                memory.id
                                            )
                                            ? "favorite"
                                            : ""
                                        }
                                    "

                                    data-favorite-id="${memory.id}"
                                >

                                    ${
                                        isFavorite(
                                            memory.id
                                        )
                                        ? "♥"
                                        : "♡"
                                    }

                                </button>

                            </div>

                        </div>

                    </article>

                `;
            }
        )
        .join("");
}

async function loadMemories() {

    try {

        const response =
            await fetch(
                `${API_URL}/api/memories`
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Could not load memories."
            );

        }


        memories =
            Array.isArray(data.memories)
                ? data.memories
                : [];


        buildGallery();

        updateTimeline();


        console.log(
            `Loaded ${memories.length} memories from Supabase.`
        );

    }

    catch (error) {

        console.error(
            "Failed to load memories:",
            error
        );


        memories = [];


        buildGallery();

        updateTimeline();


        showToast(
            "Couldn't load memories."
        );

    }

}

/* =========================================================
   BUILD GALLERY
   ========================================================= */

function buildGallery() {

    monthsContainer.innerHTML =
        "";


    const ordered =
        sortedMemories();


    introMemoryCount.textContent =
        `${ordered.length} ${
            ordered.length === 1
                ? "EXPOSURE"
                : "EXPOSURES"
        }`;


    VISIBLE_MONTHS.forEach(
    ({ name: month, index: monthIndex }, rollIndex) => {

            const monthMemories =
                ordered.filter(
                    memory =>

                        getMonthIndex(
                            memory.date
                        ) === monthIndex

                        &&

                        getYear(
                            memory.date
                        ) === CURRENT_YEAR
                );


            const section =
                document.createElement(
                    "section"
                );


            section.className =
                "month-section";

            section.id =
                `month-${monthIndex}`;

            section.dataset.month =
                monthIndex;


            section.innerHTML = `

                <div class="month-heading">

                    <div class="month-title-wrap">

                        <h2 class="month-title">
                            ${month}
                        </h2>

                        <span class="month-year">
                            '${String(
                                CURRENT_YEAR
                            ).slice(-2)}
                        </span>

                    </div>


                    <div class="month-roll-info">

                        <span>
                            ROLL
                            ${String(
                                rollIndex + 1
                            ).padStart(
                                2,
                                "0"
                            )}
                        </span>

                        <strong>

                            ${monthMemories.length}

                            ${
                                monthMemories.length === 1
                                    ? "exposure"
                                    : "exposures"
                            }

                        </strong>

                    </div>

                </div>


                <div class="month-note">

                    ${
                        MONTH_NOTES[
                            monthIndex
                        ]
                    }

                </div>


                <div class="film-shell">

                    <div class="film-strip">

                        <span
                            class="
                                film-edge-label
                                left
                            "
                        >
                            EL FILM 400
                        </span>


                        ${createMonthFrames(
                            monthMemories,
                            monthIndex
                        )}


                        <span
                            class="
                                film-edge-label
                                right
                            "
                        >

                            ${month.toUpperCase()}
                            ${CURRENT_YEAR}

                        </span>

                    </div>

                </div>

            `;


            monthsContainer
                .appendChild(
                    section
                );
        }
    );


    attachFrameEvents();

    updateFavoriteButtons();

    /*
        Important:
        start watching all video previews
        after frames are created.
    */

    setupVideoAutoplay();
}


/* =========================================================
   FRAME EVENTS
   ========================================================= */

function attachFrameEvents() {

    document
        .querySelectorAll(
            ".memory-frame"
        )
        .forEach(frame => {

            frame.addEventListener(
                "click",
                event => {

                    if (
                        event.target.closest(
                            ".frame-favorite"
                        )
                    ) {
                        return;
                    }


                    openViewerById(
                        frame.dataset.memoryId
                    );

                }
            );

        });


    document
        .querySelectorAll(
            ".frame-favorite"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.stopPropagation();


                    toggleFavorite(
                        button.dataset
                            .favoriteId
                    );

                }
            );

        });


    document
        .querySelectorAll(
            "[data-empty-month]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    openUploadModal(
                        Number(
                            button.dataset
                                .emptyMonth
                        )
                    );

                }
            );

        });
}


/* =========================================================
   HORIZONTAL SCROLL
   ========================================================= */

galleryTrack.addEventListener(
    "wheel",
    event => {

        if (
            document.querySelector(
                ".modal.open"
            )
        ) {
            return;
        }


        if (
            Math.abs(event.deltaY) >
            Math.abs(event.deltaX)
        ) {

            event.preventDefault();


            galleryTrack.scrollLeft +=
                event.deltaY * 1.15;
        }

    },
    {
        passive: false
    }
);


/* DRAG */

galleryTrack.addEventListener(
    "pointerdown",
    event => {

        if (
            event.pointerType === "mouse"
            &&
            event.button !== 0
        ) {
            return;
        }


        if (
            event.target.closest(
                "button, .memory-frame"
            )
        ) {
            return;
        }


        isPointerDragging =
            true;

        pointerStartX =
            event.clientX;

        pointerStartScrollLeft =
            galleryTrack.scrollLeft;
    }
);


galleryTrack.addEventListener(
    "pointermove",
    event => {

        if (!isPointerDragging) {
            return;
        }


        galleryTrack.scrollLeft =
            pointerStartScrollLeft -
            (
                event.clientX -
                pointerStartX
            );
    }
);


galleryTrack.addEventListener(
    "pointerup",
    () => {

        isPointerDragging =
            false;
    }
);


galleryTrack.addEventListener(
    "pointercancel",
    () => {

        isPointerDragging =
            false;
    }
);


/* =========================================================
   NAVIGATION
   ========================================================= */

function scrollToIntro() {

    galleryTrack.scrollTo({
        left: 0,
        behavior: "smooth"
    });
}


function scrollToMonth(index) {

    const section =
        document.getElementById(
            `month-${index}`
        );


    if (!section) {
        return;
    }


    galleryTrack.scrollTo({
        left:
            section.offsetLeft,

        behavior:
            "smooth"
    });
}


function getSections() {

    return [

        document.getElementById(
            "introSection"
        ),

        ...document.querySelectorAll(
            ".month-section"
        ),

        document.getElementById(
            "endSection"
        )

    ];
}


function getNearestSectionIndex() {

    const sections =
        getSections();

    let nearest = 0;

    let distance =
        Infinity;


    sections.forEach(
        (section, index) => {

            const currentDistance =
                Math.abs(
                    section.offsetLeft -
                    galleryTrack.scrollLeft
                );


            if (
                currentDistance <
                distance
            ) {

                distance =
                    currentDistance;

                nearest =
                    index;
            }

        }
    );


    return nearest;
}


function moveSection(direction) {

    const sections =
        getSections();

    const current =
        getNearestSectionIndex();


    const next =
        Math.max(
            0,

            Math.min(
                sections.length - 1,
                current + direction
            )
        );


    galleryTrack.scrollTo({

        left:
            sections[next]
                .offsetLeft,

        behavior:
            "smooth"

    });
}


/* =========================================================
   TIMELINE UPDATE
   ========================================================= */

function updateTimeline() {

    const maxScroll =
        galleryTrack.scrollWidth -
        galleryTrack.clientWidth;


    const progress =
        maxScroll > 0

        ? galleryTrack.scrollLeft /
          maxScroll

        : 0;


    const percent =
        Math.round(
            progress * 100
        );


    timelineProgress.style.width =
        `${percent}%`;


    progressNumber.textContent =
        String(percent)
            .padStart(
                2,
                "0"
            );


    const center =
        galleryTrack.scrollLeft +
        galleryTrack.clientWidth / 2;


    let activeMonth = -1;


    document
        .querySelectorAll(
            ".month-section"
        )
        .forEach(section => {

            if (
                center >=
                    section.offsetLeft

                &&

                center <
                    section.offsetLeft +
                    section.offsetWidth
            ) {

                activeMonth =
                    Number(
                        section.dataset
                            .month
                    );
            }

        });


    document
        .querySelectorAll(
            ".timeline-month"
        )
        .forEach(button => {

            button.classList.toggle(
                "active",

                Number(
                    button.dataset.month
                ) === activeMonth
            );

        });


    homeButton.classList.toggle(
        "active",

        activeMonth === -1 &&
        galleryTrack.scrollLeft <
        window.innerWidth * 0.5
    );


    filmsButton.classList.toggle(
        "active",
        activeMonth >= 0
    );
}


galleryTrack.addEventListener(
    "scroll",
    updateTimeline,
    {
        passive: true
    }
);


/* =========================================================
   NAV BUTTON EVENTS
   ========================================================= */

startRollButton.addEventListener(
    "click",
    () => scrollToMonth(0)
);


brandButton.addEventListener(
    "click",
    scrollToIntro
);


homeButton.addEventListener(
    "click",
    scrollToIntro
);


filmsButton.addEventListener(
    "click",
    () => scrollToMonth(0)
);


favoritesButton.addEventListener(
    "click",
    openFavoritesModal
);


searchButton.addEventListener(
    "click",
    openSearchModal
);


addMemoryButton.addEventListener(
    "click",
    () => openUploadModal()
);


endAddMemoryButton.addEventListener(
    "click",
    () => openUploadModal()
);


previousButton.addEventListener(
    "click",
    () => moveSection(-1)
);


nextButton.addEventListener(
    "click",
    () => moveSection(1)
);


/* =========================================================
   VIEWER
   ========================================================= */

function openViewerById(id) {

    const ordered =
        sortedMemories();


    const index =
        ordered.findIndex(
            memory =>
                memory.id === id
        );


    if (index === -1) {
        return;
    }


    currentViewerIndex =
        index;


    renderViewer();

    openModal(
        viewerModal
    );
}


function renderViewer() {

    const ordered =
        sortedMemories();

    const memory =
        ordered[
            currentViewerIndex
        ];


    if (!memory) {
        return;
    }


    viewerFrame.textContent =
        `FRAME ${
            String(
                currentViewerIndex + 1
            ).padStart(
                2,
                "0"
            )
        }`;


    viewerDate.textContent =
        formatDate(
            memory.date
        );


    viewerCaption.textContent =
        memory.caption ||
        "Untitled memory";


    viewerMonth.textContent =
        `${
            getMemoryMonthName(
                memory
            )
        } ${
            getYear(
                memory.date
            )
        }`.toUpperCase();


    viewerFavoriteButton.dataset.id =
        memory.id;


    updateViewerFavoriteButton();


    if (
        memory.type === "image" ||
        memory.type === "gif"
    ) {

        viewerMedia.innerHTML = `

            <img
                src="${memory.src}"
                alt="${escapeHTML(
                    memory.caption ||
                    "Memory"
                )}"
            >

        `;

    }

    else if (
        memory.type === "video"
    ) {

        viewerMedia.innerHTML = `

            <video
                src="${memory.src}"

                controls
                autoplay
                playsinline
            ></video>

        `;

    }

    else {

        viewerMedia.innerHTML = `

            <div class="placeholder-frame">

                <strong>
                    ${escapeHTML(
                        memory.caption ||
                        "Memory"
                    )}
                </strong>

                <span>
                    ${formatDate(
                        memory.date
                    )}
                </span>

            </div>

        `;
    }
}


function showNextViewerMemory() {

    const ordered =
        sortedMemories();


    currentViewerIndex =
        (
            currentViewerIndex + 1
        ) % ordered.length;


    renderViewer();
}


function showPreviousViewerMemory() {

    const ordered =
        sortedMemories();


    currentViewerIndex =
        (
            currentViewerIndex -
            1 +
            ordered.length
        ) % ordered.length;


    renderViewer();
}


viewerNext.addEventListener(
    "click",
    showNextViewerMemory
);


viewerPrevious.addEventListener(
    "click",
    showPreviousViewerMemory
);


viewerFavoriteButton.addEventListener(
    "click",
    () => {

        const id =
            viewerFavoriteButton
                .dataset.id;


        if (id) {

            toggleFavorite(id);

            updateViewerFavoriteButton();
        }

    }
);


function updateViewerFavoriteButton() {

    const id =
        viewerFavoriteButton
            .dataset.id;


    const favorite =
        isFavorite(id);


    viewerFavoriteButton
        .classList.toggle(
            "favorite",
            favorite
        );


    viewerFavoriteButton.textContent =
        favorite
            ? "♥"
            : "♡";
}


closeViewerButton.addEventListener(
    "click",
    () =>
        closeModal(
            viewerModal
        )
);


/* =========================================================
   UPLOAD
   ========================================================= */

function openUploadModal(
    monthIndex = null
) {

    selectedUploadFile =
        null;


    uploadForm.reset();

    resetUploadPreview();


    let date =
        new Date();


    if (
        monthIndex !== null
    ) {

        date =
            new Date(
                CURRENT_YEAR,
                monthIndex,
                1
            );
    }


    memoryDate.value =
        dateToInputValue(
            date
        );


    openModal(
        uploadModal
    );
}


function resetUploadPreview() {

    uploadPreview.innerHTML = `

        <div class="upload-plus">
            +
        </div>

        <strong>
            Choose a memory
        </strong>

        <span>
            or drop it here
        </span>

        <small>
            JPG · PNG · WEBP · GIF · MP4 · WEBM
        </small>

    `;
}


function handleSelectedFile(file) {

    if (!file) {
        return;
    }


    const image =
        file.type.startsWith(
            "image/"
        );

    const video =
        file.type.startsWith(
            "video/"
        );


    if (
        !image &&
        !video
    ) {

        showToast(
            "Choose an image, GIF or video."
        );

        return;
    }


    selectedUploadFile =
        file;


    const url =
        URL.createObjectURL(
            file
        );


    if (image) {

        uploadPreview.innerHTML = `

            <img
                src="${url}"
                alt="Preview"
            >

        `;

    } else {

        uploadPreview.innerHTML = `

            <video
                src="${url}"

                autoplay
                muted
                loop
                playsinline
                controls
            ></video>

        `;
    }
}


memoryFile.addEventListener(
    "change",
    event => {

        handleSelectedFile(
            event.target.files[0]
        );

    }
);


[
    "dragenter",
    "dragover"
]
.forEach(name => {

    dropZone.addEventListener(
        name,
        event => {

            event.preventDefault();

        }
    );

});


dropZone.addEventListener(
    "drop",
    event => {

        event.preventDefault();


        handleSelectedFile(
            event.dataTransfer
                .files[0]
        );

    }
);


uploadForm.addEventListener(
    "submit",

    async event => {

        event.preventDefault();


        if (!selectedUploadFile) {

            showToast(
                "Choose a memory first."
            );

            return;

        }


        if (!memoryDate.value) {

            showToast(
                "Choose a date."
            );

            return;

        }


        const submitButton =
            uploadForm.querySelector(
                'button[type="submit"]'
            );


        const originalHTML =
            submitButton
                ? submitButton.innerHTML
                : "";


        if (submitButton) {

            submitButton.disabled = true;

            submitButton.textContent =
                "DEVELOPING...";

        }


        try {

            const formData =
                new FormData();


            formData.append(
                "file",
                selectedUploadFile
            );


            formData.append(
                "date",
                memoryDate.value
            );


            formData.append(
                "caption",
                memoryCaption.value.trim()
                ||
                "Untitled memory"
            );


            const response =
                await fetch(
                    `${API_URL}/api/upload`,
                    {
                        method: "POST",
                        body: formData
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Upload failed."
                );

            }


            const memory =
                data.memory;


            if (!memory) {

                throw new Error(
                    "Server did not return the memory."
                );

            }


            memories.push(
                memory
            );


            const month =
                getMonthIndex(
                    memory.date
                );


            buildGallery();

            updateTimeline();


            closeModal(
                uploadModal
            );


            selectedUploadFile =
                null;


            showToast(
                "Exposure developed ♡"
            );


            setTimeout(
                () => {

                    scrollToMonth(
                        month
                    );

                },
                150
            );

        }

        catch (error) {

            console.error(
                "Upload failed:",
                error
            );


            showToast(
                error.message ||
                "Upload failed."
            );

        }

        finally {

            if (submitButton) {

                submitButton.disabled =
                    false;

                submitButton.innerHTML =
                    originalHTML;

            }

        }

    }
);


closeUploadButton.addEventListener(
    "click",
    () =>
        closeModal(
            uploadModal
        )
);


/* =========================================================
   SEARCH
   ========================================================= */

function createSmallPreview(memory) {

    if (
        memory.type === "image" ||
        memory.type === "gif"
    ) {

        return `

            <img
                src="${memory.src}"
                alt=""
            >

        `;
    }


    if (
        memory.type === "video"
    ) {

        return `

            <video
                src="${memory.src}"
                muted
                autoplay
                loop
                playsinline
            ></video>

        `;
    }


    return `

        <div class="placeholder-frame">
            <span>EL</span>
        </div>

    `;
}


function openSearchModal() {

    searchInput.value =
        "";


    renderSearchResults(
        sortedMemories()
    );


    openModal(
        searchModal
    );


    setTimeout(
        () =>
            searchInput.focus(),

        50
    );
}


function renderSearchResults(items) {

    if (!items.length) {

        searchResults.innerHTML = `

            <div class="no-results">
                No memories found.
            </div>

        `;

        return;
    }


    searchResults.innerHTML =
        items
            .slice(0,20)
            .map(memory => `

                <button
                    class="search-result"

                    data-search-id="${memory.id}"
                >

                    <div class="search-result-preview">

                        ${createSmallPreview(
                            memory
                        )}

                    </div>


                    <div>

                        <strong>
                            ${escapeHTML(
                                memory.caption ||
                                "Untitled"
                            )}
                        </strong>

                        <small>

                            ${
                                getMemoryMonthName(
                                    memory
                                ).toUpperCase()
                            }

                            ·

                            ${formatDate(
                                memory.date
                            )}

                        </small>

                    </div>


                    <span>→</span>

                </button>

            `)
            .join("");


    document
        .querySelectorAll(
            "[data-search-id]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        button.dataset
                            .searchId;


                    closeModal(
                        searchModal
                    );


                    openViewerById(
                        id
                    );

                }
            );

        });
}


searchInput.addEventListener(
    "input",
    () => {

        const query =
            searchInput.value
                .trim()
                .toLowerCase();


        const results =
            sortedMemories()
                .filter(
                    memory => {

                        const text = `

                            ${
                                memory.caption ||
                                ""
                            }

                            ${
                                memory.date
                            }

                            ${
                                getMemoryMonthName(
                                    memory
                                )
                            }

                        `.toLowerCase();


                        return text.includes(
                            query
                        );

                    }
                );


        renderSearchResults(
            results
        );

    }
);


closeSearchButton.addEventListener(
    "click",
    () =>
        closeModal(
            searchModal
        )
);


/* =========================================================
   FAVORITES MODAL
   ========================================================= */

function openFavoritesModal() {

    renderFavorites();

    openModal(
        favoritesModal
    );
}


function renderFavorites() {

    const ids =
        getFavoriteIds();


    const items =
        sortedMemories()
            .filter(
                memory =>
                    ids.includes(
                        memory.id
                    )
            );


    if (!items.length) {

        favoritesGrid.innerHTML = `

            <div
                class="no-results"
                style="
                    grid-column:1/-1
                "
            >
                No favorites yet.
                <br><br>
                Tap ♡ on a memory.
            </div>

        `;

        return;
    }


    favoritesGrid.innerHTML =
        items
            .map(memory => `

                <button
                    class="favorite-card"

                    data-favorite-card="${memory.id}"
                >

                    ${createSmallPreview(
                        memory
                    )}

                </button>

            `)
            .join("");


    document
        .querySelectorAll(
            "[data-favorite-card]"
        )
        .forEach(card => {

            card.addEventListener(
                "click",
                () => {

                    closeModal(
                        favoritesModal
                    );


                    openViewerById(
                        card.dataset
                            .favoriteCard
                    );

                }
            );

        });
}


function updateFavoriteButtons() {

    document
        .querySelectorAll(
            ".frame-favorite"
        )
        .forEach(button => {

            const favorite =
                isFavorite(
                    button.dataset
                        .favoriteId
                );


            button.classList.toggle(
                "favorite",
                favorite
            );


            button.textContent =
                favorite
                    ? "♥"
                    : "♡";

        });


    if (
        viewerModal.classList
            .contains("open")
    ) {

        updateViewerFavoriteButton();
    }


    if (
        favoritesModal.classList
            .contains("open")
    ) {

        renderFavorites();
    }
}


closeFavoritesButton.addEventListener(
    "click",
    () =>
        closeModal(
            favoritesModal
        )
);


/* =========================================================
   MODALS
   ========================================================= */

function openModal(modal) {

    closeAllModals();


    modal.classList.add(
        "open"
    );


    modal.setAttribute(
        "aria-hidden",
        "false"
    );
}


function closeModal(modal) {

    modal
        .querySelectorAll(
            "video"
        )
        .forEach(
            video =>
                video.pause()
        );


    modal.classList.remove(
        "open"
    );


    modal.setAttribute(
        "aria-hidden",
        "true"
    );
}


function closeAllModals() {

    document
        .querySelectorAll(
            ".modal.open"
        )
        .forEach(
            closeModal
        );
}


document
    .querySelectorAll(
        "[data-close-viewer]"
    )
    .forEach(element => {

        element.addEventListener(
            "click",
            () =>
                closeModal(
                    viewerModal
                )
        );

    });


document
    .querySelectorAll(
        "[data-close-upload]"
    )
    .forEach(element => {

        element.addEventListener(
            "click",
            () =>
                closeModal(
                    uploadModal
                )
        );

    });


document
    .querySelectorAll(
        "[data-close-search]"
    )
    .forEach(element => {

        element.addEventListener(
            "click",
            () =>
                closeModal(
                    searchModal
                )
        );

    });


document
    .querySelectorAll(
        "[data-close-favorites]"
    )
    .forEach(element => {

        element.addEventListener(
            "click",
            () =>
                closeModal(
                    favoritesModal
                )
        );

    });


/* =========================================================
   KEYBOARD
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        const modal =
            document.querySelector(
                ".modal.open"
            );


        if (modal) {

            if (
                event.key === "Escape"
            ) {

                closeAllModals();
            }


            if (
                viewerModal.classList
                    .contains("open")
            ) {

                if (
                    event.key ===
                    "ArrowRight"
                ) {

                    showNextViewerMemory();
                }


                if (
                    event.key ===
                    "ArrowLeft"
                ) {

                    showPreviousViewerMemory();
                }
            }


            return;
        }


        if (
            event.key ===
            "ArrowRight"
        ) {

            moveSection(1);
        }


        if (
            event.key ===
            "ArrowLeft"
        ) {

            moveSection(-1);
        }

    }
);


/* =========================================================
   INITIALIZE
   ========================================================= */

async function initializeGallery() {

    buildTimeline();


    memoryDate.value =
        dateToInputValue(
            new Date()
        );


    await loadMemories();

}


window.addEventListener(
    "resize",
    updateTimeline
);


initializeGallery();