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
    "where it all began ♡",
    "little moments",
    "keep this one",
    "days worth remembering",
    "somewhere between then & now",
    "halfway there",
    "where it all began",
    "closer with every day",
    "the month we became us",
    "I love you supder duper much bebu",
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

let ourFilmsMonth = START_MONTH;

let ourFilmsSlideIndex = 0;

let ourFilmsPlaying = false;

let ourFilmsTimer = null;

let ourFilmsRenderToken = 0;

let ourFilmsActiveVideo = null;

let ourFilmsVideoEndedHandler = null;

let ourFilmsVideoVolumeHandler = null;

let ourFilmsVideoVolume = 1;

let editingMemoryId = null;

let pendingDeleteMemoryId = null;

let isSavingMemory = false;

let isDeletingMemory = false;

const MAX_UPLOAD_FILES = 20;

const MAX_UPLOAD_FILE_SIZE = 100 * 1024 * 1024;

let selectedUploadFiles = [];

let uploadGroupId = null;

let uploadSharedDate = null;

let uploadSharedCaption = null;

let uploadSharedPrivateNote = null;

let viewerNoteExpanded = false;

let isUploadingMemories = false;

let draggedUploadItemId = null;

let nextUploadItemId = 0;

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

const viewerSetContext =
    document.getElementById("viewerSetContext");

const viewerSetLabel =
    document.getElementById("viewerSetLabel");

const viewerSetProgress =
    document.getElementById("viewerSetProgress");

const viewerNote =
    document.getElementById("viewerNote");

const viewerNoteToggle =
    document.getElementById("viewerNoteToggle");

const viewerNotePanel =
    document.getElementById("viewerNotePanel");

const viewerNoteText =
    document.getElementById("viewerNoteText");

const viewerFavoriteButton =
    document.getElementById("viewerFavoriteButton");

const viewerPrevious =
    document.getElementById("viewerPrevious");

const viewerNext =
    document.getElementById("viewerNext");

const closeViewerButton =
    document.getElementById("closeViewerButton");

const editMemoryButton =
    document.getElementById("editMemoryButton");

const deleteMemoryButton =
    document.getElementById("deleteMemoryButton");


/* EDIT MEMORY */

const editMemoryModal =
    document.getElementById("editMemoryModal");

const editMemoryForm =
    document.getElementById("editMemoryForm");

const editMemoryDate =
    document.getElementById("editMemoryDate");

const editMemoryCaption =
    document.getElementById("editMemoryCaption");

const editMemoryPrivateNote =
    document.getElementById("editMemoryPrivateNote");

const editMemorySetNotice =
    document.getElementById("editMemorySetNotice");

const editCalendarButton =
    document.getElementById("editCalendarButton");

const closeEditMemoryButton =
    document.getElementById("closeEditMemoryButton");

const cancelEditMemoryButton =
    document.getElementById("cancelEditMemoryButton");

const saveMemoryChangesButton =
    document.getElementById("saveMemoryChangesButton");


/* DELETE MEMORY */

const deleteMemoryModal =
    document.getElementById("deleteMemoryModal");

const deleteMemoryPreview =
    document.getElementById("deleteMemoryPreview");

const deleteMemoryCaption =
    document.getElementById("deleteMemoryCaption");

const deleteMemoryDate =
    document.getElementById("deleteMemoryDate");

const closeDeleteMemoryButton =
    document.getElementById("closeDeleteMemoryButton");

const cancelDeleteMemoryButton =
    document.getElementById("cancelDeleteMemoryButton");

const confirmDeleteMemoryButton =
    document.getElementById("confirmDeleteMemoryButton");


/* OUR FILMS */

const ourFilmsModal =
    document.getElementById("ourFilmsModal");

const ourFilmsCloseButton =
    document.getElementById("ourFilmsCloseButton");

const ourFilmsTitle =
    document.getElementById("ourFilmsTitle");

const ourFilmsNote =
    document.getElementById("ourFilmsNote");

const ourFilmsCounter =
    document.getElementById("ourFilmsCounter");

const ourFilmsStage =
    document.getElementById("ourFilmsStage");

const ourFilmsMedia =
    document.getElementById("ourFilmsMedia");

const ourFilmsEmpty =
    document.getElementById("ourFilmsEmpty");

const ourFilmsAddMemoryButton =
    document.getElementById("ourFilmsAddMemoryButton");

const ourFilmsCaption =
    document.getElementById("ourFilmsCaption");

const ourFilmsDate =
    document.getElementById("ourFilmsDate");

const ourFilmsPrevious =
    document.getElementById("ourFilmsPrevious");

const ourFilmsNext =
    document.getElementById("ourFilmsNext");

const ourFilmsPlayButton =
    document.getElementById("ourFilmsPlayButton");

const ourFilmsMonths =
    document.getElementById("ourFilmsMonths");


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

const memoryPrivateNote =
    document.getElementById("memoryPrivateNote");

const uploadPreview =
    document.getElementById("uploadPreview");

const uploadProgress =
    document.getElementById("uploadProgress");

const developButton =
    document.getElementById("developButton");

const developButtonLabel =
    document.getElementById("developButtonLabel");

const dropZone =
    document.getElementById("dropZone");

const closeUploadButton =
    document.getElementById("closeUploadButton");

const calendarButton =
    document.getElementById(
        "calendarButton"
    );


function openCalendarPicker(input) {

    if (
        typeof input.showPicker
        === "function"
    ) {

        input.showPicker();

    } else {

        input.focus();
        input.click();

    }
}

calendarButton.addEventListener(
    "click",
    () => openCalendarPicker(memoryDate)
);


editCalendarButton.addEventListener(
    "click",
    () => openCalendarPicker(editMemoryDate)
);


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

    const indexed = memories.map(
        (memory, index) => ({ memory, index })
    );

    const groupAnchors = new Map();

    indexed.forEach(({ memory, index }) => {
        if (memory.groupId) {
            groupAnchors.set(
                memory.groupId,
                Math.min(groupAnchors.get(memory.groupId) ?? index, index)
            );
        }
    });

    return indexed
        .sort((a, b) => {
            const dateDifference =
                new Date(a.memory.date) - new Date(b.memory.date);

            if (dateDifference) {
                return dateDifference;
            }

            if (
                a.memory.groupId &&
                a.memory.groupId === b.memory.groupId
            ) {
                return (
                    (Number.isInteger(a.memory.groupOrder) ? a.memory.groupOrder : a.index) -
                    (Number.isInteger(b.memory.groupOrder) ? b.memory.groupOrder : b.index)
                );
            }

            const aAnchor = a.memory.groupId
                ? groupAnchors.get(a.memory.groupId)
                : a.index;

            const bAnchor = b.memory.groupId
                ? groupAnchors.get(b.memory.groupId)
                : b.index;

            return aAnchor - bAnchor;
        })
        .map(({ memory }) => memory);
}


function normalizeMemory(memory) {

    return {
        ...memory,
        groupId: memory.groupId ?? memory.group_id ?? null,
        groupOrder: Number.isInteger(memory.groupOrder)
            ? memory.groupOrder
            : Number.isInteger(memory.group_order)
                ? memory.group_order
                : null,
        privateNote: memory.privateNote ?? memory.private_note ?? null
    };
}


function getMemorySetMembers(memory) {

    return memory.groupId
        ? sortedMemories().filter(item => item.groupId === memory.groupId)
        : [];
}


function getMemorySetInfo(memory) {

    if (!memory.groupId) {
        return null;
    }

    const members = getMemorySetMembers(memory);

    const index = members.findIndex(item => item.id === memory.id);

    return index === -1
        ? null
        : { position: index + 1, total: members.length };
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

                const setInfo =
                    getMemorySetInfo(memory);

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

                            ${
                                setInfo && setInfo.total > 1
                                    ? `<span class="memory-set-position">SET ${setInfo.position} / ${setInfo.total}</span>`
                                    : ""
                            }


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
                ? data.memories.map(normalizeMemory)
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


    let activeTimelineButton = null;


    document
        .querySelectorAll(
            ".timeline-month"
        )
        .forEach(button => {

            const isActive =
                Number(button.dataset.month) === activeMonth;

            const wasActive =
                button.classList.contains("active");


            button.classList.toggle(
                "active",
                isActive
            );


            if (isActive && !wasActive) {
                activeTimelineButton = button;
            }

        });


    if (activeTimelineButton) {

        const navBounds =
            monthsTimeline.getBoundingClientRect();

        const buttonBounds =
            activeTimelineButton.getBoundingClientRect();


        if (
            buttonBounds.left < navBounds.left ||
            buttonBounds.right > navBounds.right
        ) {

            const nextScrollLeft =
                monthsTimeline.scrollLeft +
                buttonBounds.left -
                navBounds.left -
                (monthsTimeline.clientWidth - buttonBounds.width) / 2;


            monthsTimeline.scrollTo({
                left: Math.max(
                    0,
                    Math.min(
                        monthsTimeline.scrollWidth -
                            monthsTimeline.clientWidth,
                        nextScrollLeft
                    )
                ),
                behavior: "smooth"
            });

        }

    }


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
    () => scrollToMonth(START_MONTH)
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
    openOurFilms
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

    viewerMedia.querySelectorAll("video").forEach(video => {
        video.pause();
        video.removeAttribute("src");
        video.load();
    });

    viewerNoteExpanded = false;


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

    renderViewerSetContext(memory);

    renderViewerPrivateNote(memory);


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


function renderViewerSetContext(memory) {

    const members = getMemorySetMembers(memory);
    const position = members.findIndex(item => item.id === memory.id);

    if (position === -1 || members.length < 2) {
        viewerSetContext.hidden = true;
        viewerSetProgress.innerHTML = "";
        return;
    }

    viewerSetContext.hidden = false;
    viewerSetLabel.textContent =
        `MEMORY SET · ${position + 1} OF ${members.length}`;

    if (members.length <= 10) {
        viewerSetProgress.className = "viewer-set-progress dots";
        viewerSetProgress.innerHTML = members.map((member, index) => `
            <button
                type="button"
                class="viewer-set-dot ${index === position ? "current" : index < position ? "passed" : ""}"
                data-set-memory-id="${member.id}"
                aria-label="Open memory ${index + 1} of ${members.length}"
                aria-current="${index === position ? "true" : "false"}"
            ><span></span></button>
        `).join("");
    } else {
        const progress = members.length === 1
            ? 0
            : position / (members.length - 1);

        viewerSetProgress.className = "viewer-set-progress bar";
        viewerSetProgress.innerHTML = `
            <div class="viewer-set-track" aria-hidden="true">
                <span style="width:${progress * 100}%"></span>
                <i style="left:${progress * 100}%"></i>
            </div>
        `;
    }
}


function renderViewerPrivateNote(memory) {

    const note = typeof memory.privateNote === "string"
        ? memory.privateNote.trim()
        : "";

    viewerNote.hidden = !note;
    viewerNotePanel.hidden = true;
    viewerNoteToggle.hidden = !note;
    viewerNoteToggle.textContent = "READ NOTE";
    viewerNoteToggle.setAttribute("aria-expanded", "false");
    viewerNoteText.textContent = note;
}


viewerSetProgress.addEventListener("click", event => {
    const target = event.target.closest("[data-set-memory-id]");

    if (!target) {
        return;
    }

    const ordered = sortedMemories();
    const index = ordered.findIndex(
        memory => memory.id === target.dataset.setMemoryId
    );

    if (index !== -1) {
        currentViewerIndex = index;
        renderViewer();
    }
});


viewerNoteToggle.addEventListener("click", () => {
    viewerNoteExpanded = !viewerNoteExpanded;
    viewerNotePanel.hidden = !viewerNoteExpanded;
    viewerNoteToggle.textContent = viewerNoteExpanded
        ? "HIDE NOTE"
        : "READ NOTE";
    viewerNoteToggle.setAttribute(
        "aria-expanded",
        String(viewerNoteExpanded)
    );
});


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
   OUR FILMS SLIDESHOW
   ========================================================= */

function getOurFilmsMemories() {

    return sortedMemories()
        .filter(
            memory =>
                getMonthIndex(memory.date) === ourFilmsMonth &&
                getYear(memory.date) === CURRENT_YEAR
        );
}


function buildOurFilmsMonthNav() {

    ourFilmsMonths.innerHTML = "";


    VISIBLE_MONTHS.forEach(
        ({ name, index }) => {

            const button =
                document.createElement("button");


            button.type = "button";

            button.className = "our-films-month";

            button.dataset.month = index;

            button.textContent =
                name.substring(0, 3).toUpperCase();

            button.setAttribute("aria-pressed", "false");

            ourFilmsMonths.appendChild(button);

        }
    );


    updateOurFilmsMonthNav();
}


function updateOurFilmsMonthNav(keepActiveVisible = false) {

    let activeButton = null;


    ourFilmsMonths
        .querySelectorAll(".our-films-month")
        .forEach(button => {

            const active =
                Number(button.dataset.month) === ourFilmsMonth;


            button.classList.toggle("active", active);

            button.setAttribute("aria-pressed", String(active));


            if (active) {
                activeButton = button;
            }

        });


    if (keepActiveVisible && activeButton) {
        activeButton.scrollIntoView({
            block: "nearest",
            inline: "center",
            behavior: "smooth"
        });
    }
}


function pauseGalleryVideoPreviews() {

    if (videoObserver) {
        videoObserver.disconnect();
    }


    document
        .querySelectorAll(".preview-video")
        .forEach(pausePreviewVideo);
}


function resumeGalleryVideoPreviews() {

    if (!document.querySelector(".modal.open")) {
        setupVideoAutoplay();
    }
}


function clearOurFilmsTimer() {

    clearTimeout(ourFilmsTimer);

    ourFilmsTimer = null;
}


function updateOurFilmsPlayButton() {

    ourFilmsPlayButton.textContent =
        ourFilmsPlaying
            ? "Ⅱ PAUSE"
            : "▶ PLAY";

    ourFilmsPlayButton.setAttribute(
        "aria-pressed",
        String(ourFilmsPlaying)
    );
}


function createOurFilmsMedia(memory) {

    if (
        memory.type === "image" ||
        memory.type === "gif"
    ) {

        return `

            <img
                src="${escapeHTML(memory.src)}"
                alt="${escapeHTML(memory.caption || "Memory")}"
                draggable="false"
            >

        `;
    }


    if (memory.type === "video") {

        return `

            <video
                src="${escapeHTML(memory.src)}"
                controls
                playsinline
                preload="metadata"
                aria-label="${escapeHTML(memory.caption || "Memory video")}"
            ></video>

        `;
    }


    return `

        <div class="placeholder-frame">
            <strong>${escapeHTML(memory.caption || "Memory")}</strong>
            <span>${formatDate(memory.date)}</span>
        </div>

    `;
}


function renderOurFilms(animate = true) {

    clearOurFilmsTimer();

    ourFilmsRenderToken += 1;

    pauseOurFilmsVideo();

    const renderToken = ourFilmsRenderToken;

    const monthMemories =
        getOurFilmsMemories();


    const hasMemories =
        monthMemories.length > 0;


    ourFilmsMedia.innerHTML = "";

    ourFilmsTitle.textContent =
        `${MONTHS[ourFilmsMonth].toUpperCase()} ${CURRENT_YEAR}`;

    ourFilmsNote.textContent =
        MONTH_NOTES[ourFilmsMonth] || "";

    ourFilmsCounter.textContent = "";

    ourFilmsCaption.textContent = "";

    ourFilmsDate.textContent = "";

    ourFilmsDate.removeAttribute("datetime");

    ourFilmsEmpty.hidden = hasMemories;

    ourFilmsPrevious.disabled = !hasMemories;

    ourFilmsNext.disabled = !hasMemories;

    ourFilmsPlayButton.disabled = !hasMemories;

    ourFilmsStage.classList.remove("is-changing");


    if (!hasMemories) {
        updateOurFilmsMonthNav();
        scheduleOurFilmsAdvance();
        return;
    }


    ourFilmsSlideIndex =
        ourFilmsSlideIndex % monthMemories.length;


    const memory =
        monthMemories[ourFilmsSlideIndex];


    ourFilmsCounter.textContent =
        `FRAME ${String(ourFilmsSlideIndex + 1).padStart(2, "0")} / ${String(monthMemories.length).padStart(2, "0")}`;

    ourFilmsCaption.textContent =
        memory.caption || "Untitled memory";

    ourFilmsDate.textContent =
        formatDate(memory.date).replace(", ", " '");

    ourFilmsDate.dateTime = memory.date;

    ourFilmsMedia.innerHTML =
        createOurFilmsMedia(memory);


    if (memory.type === "video") {

        const video =
            ourFilmsMedia.querySelector("video");


        video.controls = true;
        video.playsInline = true;
        video.preload = "metadata";

        ourFilmsActiveVideo = video;

        ourFilmsVideoEndedHandler = () => {

            if (
                renderToken !== ourFilmsRenderToken ||
                video !== ourFilmsActiveVideo ||
                !ourFilmsPlaying ||
                !ourFilmsModal.classList.contains("open")
            ) {
                return;
            }


            showNextOurFilmsMemory();
        };

        ourFilmsVideoVolumeHandler = () => {

            if (
                renderToken === ourFilmsRenderToken &&
                video === ourFilmsActiveVideo
            ) {
                ourFilmsVideoVolume = video.volume;
            }
        };

        video.addEventListener(
            "ended",
            ourFilmsVideoEndedHandler
        );

        video.addEventListener(
            "volumechange",
            ourFilmsVideoVolumeHandler
        );

    }


    updateOurFilmsMonthNav();


    if (animate) {
        void ourFilmsStage.offsetWidth;
        ourFilmsStage.classList.add("is-changing");
    }


    scheduleOurFilmsAdvance();
}


function scheduleOurFilmsAdvance() {

    clearOurFilmsTimer();


    if (
        !ourFilmsPlaying ||
        !ourFilmsModal.classList.contains("open") ||
        !getOurFilmsMemories().length
    ) {
        return;
    }


    const monthMemories =
        getOurFilmsMemories();

    const memory =
        monthMemories[ourFilmsSlideIndex];

    if (!memory) {
        return;
    }


    const renderToken = ourFilmsRenderToken;
    const memoryId = memory.id;


    if (memory.type === "video") {

        const video = ourFilmsActiveVideo;


        if (!video) {
            return;
        }


        if (video.ended) {
            video.currentTime = 0;
        }


        video.muted = false;

        video.volume = ourFilmsVideoVolume;

        video.playsInline = true;


        try {

            const playPromise = video.play();


            if (playPromise) {
                playPromise.catch(() => {});
            }

        }

        catch {
            // Keep the video visible and let native controls handle playback.
        }


        return;
    }


    ourFilmsTimer =
        setTimeout(() => {

            ourFilmsTimer = null;


            if (
                !ourFilmsPlaying ||
                !ourFilmsModal.classList.contains("open") ||
                renderToken !== ourFilmsRenderToken
            ) {
                return;
            }


            const currentMemory =
                getOurFilmsMemories()[ourFilmsSlideIndex];


            if (!currentMemory || currentMemory.id !== memoryId) {
                return;
            }


            showNextOurFilmsMemory();

        }, 5000);
}


function openOurFilms() {

    stopOurFilmsPlayback();

    pauseOurFilmsVideo();

    pauseGalleryVideoPreviews();

    ourFilmsMonth = START_MONTH;

    ourFilmsSlideIndex = 0;

    renderOurFilms(false);

    openModal(ourFilmsModal);

    filmsButton.classList.add("active");

    homeButton.classList.remove("active");

    updateOurFilmsMonthNav(true);
}


function closeOurFilms() {

    stopOurFilmsPlayback();

    pauseOurFilmsVideo();

    ourFilmsMedia.innerHTML = "";

    ourFilmsStage.classList.remove("is-changing");

    closeModal(ourFilmsModal);

    updateTimeline();

    resumeGalleryVideoPreviews();
}


function pauseOurFilmsVideo() {

    clearOurFilmsTimer();

    const video =
        ourFilmsActiveVideo ||
        ourFilmsMedia.querySelector("video");


    if (video) {

        if (ourFilmsVideoEndedHandler) {
            video.removeEventListener(
                "ended",
                ourFilmsVideoEndedHandler
            );
        }


        if (ourFilmsVideoVolumeHandler) {
            video.removeEventListener(
                "volumechange",
                ourFilmsVideoVolumeHandler
            );
        }


        video.pause();
    }


    ourFilmsActiveVideo = null;

    ourFilmsVideoEndedHandler = null;

    ourFilmsVideoVolumeHandler = null;
}


function setOurFilmsMonth(monthIndex) {

    const monthIsVisible =
        VISIBLE_MONTHS.some(
            month => month.index === monthIndex
        );


    if (!monthIsVisible) {
        return;
    }


    ourFilmsMonth = monthIndex;

    ourFilmsSlideIndex = 0;

    renderOurFilms();

    updateOurFilmsMonthNav(true);
}


function showNextOurFilmsMemory() {

    const count =
        getOurFilmsMemories().length;


    if (!count) {
        return;
    }


    ourFilmsSlideIndex =
        (ourFilmsSlideIndex + 1) % count;

    renderOurFilms();
}


function showPreviousOurFilmsMemory() {

    const count =
        getOurFilmsMemories().length;


    if (!count) {
        return;
    }


    ourFilmsSlideIndex =
        (ourFilmsSlideIndex - 1 + count) % count;

    renderOurFilms();
}


function startOurFilmsPlayback() {

    if (
        ourFilmsPlaying ||
        !getOurFilmsMemories().length
    ) {
        return;
    }


    ourFilmsPlaying = true;

    updateOurFilmsPlayButton();

    scheduleOurFilmsAdvance();
}


function stopOurFilmsPlayback() {

    clearOurFilmsTimer();

    ourFilmsPlaying = false;

    updateOurFilmsPlayButton();

    if (ourFilmsActiveVideo) {
        ourFilmsActiveVideo.pause();
    }
}


function toggleOurFilmsPlayback() {

    if (ourFilmsPlaying) {
        stopOurFilmsPlayback();
    } else {
        startOurFilmsPlayback();
    }
}


ourFilmsCloseButton.addEventListener(
    "click",
    closeOurFilms
);


document
    .querySelector("[data-close-our-films]")
    .addEventListener(
        "click",
        closeOurFilms
    );


ourFilmsPrevious.addEventListener(
    "click",
    showPreviousOurFilmsMemory
);


ourFilmsNext.addEventListener(
    "click",
    showNextOurFilmsMemory
);


ourFilmsPlayButton.addEventListener(
    "click",
    toggleOurFilmsPlayback
);


ourFilmsMonths.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(".our-films-month");


        if (button) {
            setOurFilmsMonth(
                Number(button.dataset.month)
            );
        }

    }
);


ourFilmsAddMemoryButton.addEventListener(
    "click",
    () => {

        const month = ourFilmsMonth;

        closeOurFilms();

        openUploadModal(month);

    }
);


/* =========================================================
   EDIT AND DELETE MEMORY
   ========================================================= */

function openEditMemoryModal(id) {

    const memory =
        getMemoryById(id);


    if (!memory) {
        showToast("Memory could not be found.");
        return;
    }


    editingMemoryId = id;

    editMemoryDate.value = memory.date;

    editMemoryCaption.value = memory.caption || "";

    editMemoryPrivateNote.value = memory.privateNote || "";

    const setSize = memory.groupId
        ? memories.filter(item => item.groupId === memory.groupId).length
        : 0;

    editMemorySetNotice.hidden = !memory.groupId;

    editMemorySetNotice.textContent = memory.groupId
        ? `EDITING MEMORY SET · Changes to the date, caption, and private note apply to all ${setSize} memories.`
        : "";

    openModal(editMemoryModal);
}


function closeEditMemoryModal() {

    if (isSavingMemory) {
        return;
    }


    const id = editingMemoryId;

    editingMemoryId = null;

    closeModal(editMemoryModal);


    if (id && getMemoryById(id)) {
        openViewerById(id);
    }
}


editMemoryButton.addEventListener(
    "click",
    () => openEditMemoryModal(
        viewerFavoriteButton.dataset.id
    )
);


closeEditMemoryButton.addEventListener(
    "click",
    closeEditMemoryModal
);


cancelEditMemoryButton.addEventListener(
    "click",
    closeEditMemoryModal
);


document
    .querySelector("[data-close-edit]")
    .addEventListener(
        "click",
        closeEditMemoryModal
    );


editMemoryForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        if (isSavingMemory || !editingMemoryId) {
            return;
        }


        const memoryId = editingMemoryId;

        const nextDate = editMemoryDate.value;

        const nextCaption = editMemoryCaption.value.trim();

        const nextPrivateNote = editMemoryPrivateNote.value.trim();


        if (!nextDate) {
            showToast("Choose a date.");
            return;
        }

        if (nextPrivateNote.length > 2000) {
            showToast("Private notes can contain up to 2000 characters.");
            return;
        }


        isSavingMemory = true;

        saveMemoryChangesButton.disabled = true;

        closeEditMemoryButton.disabled = true;

        cancelEditMemoryButton.disabled = true;

        saveMemoryChangesButton.textContent = "SAVING...";


        try {

            const response = await fetch(
                `${API_URL}/api/memories/${encodeURIComponent(memoryId)}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        caption: nextCaption,
                        date: nextDate,
                        private_note: nextPrivateNote || null
                    })
                }
            );


            const data = await response.json().catch(() => ({}));


            if (!response.ok) {
                throw new Error(
                    data.error || data.message || "Could not update memory."
                );
            }


            const memoryIndex = memories.findIndex(
                memory => memory.id === memoryId
            );


            if (memoryIndex === -1) {
                throw new Error("Memory could not be found.");
            }


            const currentMemory = memories[memoryIndex];

            const returnedMemory =
                data.memory || data.updatedMemory || data;

            const returnedMemories = Array.isArray(data.memories)
                ? data.memories.map(normalizeMemory)
                : null;

            if (returnedMemories) {
                const replacements = new Map(
                    returnedMemories.map(memory => [memory.id, memory])
                );

                memories = memories.map(memory =>
                    replacements.has(memory.id)
                        ? { ...memory, ...replacements.get(memory.id) }
                        : memory
                );
            } else if (currentMemory.groupId) {
                memories = memories.map(memory =>
                    memory.groupId === currentMemory.groupId
                        ? {
                            ...memory,
                            caption: returnedMemory.caption ?? nextCaption,
                            date: returnedMemory.date ?? nextDate,
                            privateNote: (returnedMemory.privateNote ?? nextPrivateNote) || null
                        }
                        : memory
                );
            } else {
                memories[memoryIndex] = normalizeMemory({
                    ...currentMemory,
                    ...returnedMemory,
                    id: memoryId,
                    caption: returnedMemory.caption ?? nextCaption,
                    date: returnedMemory.date ?? nextDate,
                    privateNote: (returnedMemory.privateNote ?? nextPrivateNote) || null
                });
            }


            buildGallery();

            updateTimeline();

            editingMemoryId = null;

            closeModal(editMemoryModal);

            openViewerById(memoryId);

            showToast(
                currentMemory.groupId
                    ? "Memory set updated"
                    : "Memory updated"
            );

        }

        catch (error) {

            console.error("Memory update failed:", error);

            showToast(error.message || "Could not update memory.");

        }

        finally {

            isSavingMemory = false;

            saveMemoryChangesButton.disabled = false;

            closeEditMemoryButton.disabled = false;

            cancelEditMemoryButton.disabled = false;

            saveMemoryChangesButton.textContent = "SAVE CHANGES";
        }

    }
);


function openDeleteMemoryModal(id) {

    const memory =
        getMemoryById(id);


    if (!memory) {
        showToast("Memory could not be found.");
        return;
    }


    pendingDeleteMemoryId = id;

    deleteMemoryPreview.innerHTML =
        createSmallPreview(memory, false);

    deleteMemoryCaption.textContent =
        memory.caption || "Untitled memory";

    deleteMemoryDate.textContent =
        formatDate(memory.date);

    openModal(deleteMemoryModal);
}


function closeDeleteMemoryModal() {

    if (isDeletingMemory) {
        return;
    }


    const id = pendingDeleteMemoryId;

    pendingDeleteMemoryId = null;

    closeModal(deleteMemoryModal);


    if (id && getMemoryById(id)) {
        openViewerById(id);
    }
}


deleteMemoryButton.addEventListener(
    "click",
    () => openDeleteMemoryModal(
        viewerFavoriteButton.dataset.id
    )
);


closeDeleteMemoryButton.addEventListener(
    "click",
    closeDeleteMemoryModal
);


cancelDeleteMemoryButton.addEventListener(
    "click",
    closeDeleteMemoryModal
);


document
    .querySelector("[data-close-delete]")
    .addEventListener(
        "click",
        closeDeleteMemoryModal
    );


confirmDeleteMemoryButton.addEventListener(
    "click",
    async () => {

        if (isDeletingMemory || !pendingDeleteMemoryId) {
            return;
        }


        const memoryId = pendingDeleteMemoryId;


        if (!getMemoryById(memoryId)) {
            pendingDeleteMemoryId = null;
            closeModal(deleteMemoryModal);
            showToast("Memory could not be found.");
            return;
        }


        isDeletingMemory = true;

        confirmDeleteMemoryButton.disabled = true;

        closeDeleteMemoryButton.disabled = true;

        cancelDeleteMemoryButton.disabled = true;

        confirmDeleteMemoryButton.textContent = "DELETING...";


        try {

            const response = await fetch(
                `${API_URL}/api/memories/${encodeURIComponent(memoryId)}`,
                { method: "DELETE" }
            );


            const data = await response.json().catch(() => ({}));


            if (!response.ok) {
                throw new Error(
                    data.error || data.message || "Could not delete memory."
                );
            }


            memories = memories.filter(
                memory => memory.id !== memoryId
            );

            saveFavoriteIds(
                getFavoriteIds().filter(id => id !== memoryId)
            );

            buildGallery();

            updateTimeline();

            pendingDeleteMemoryId = null;

            closeModal(deleteMemoryModal);

            closeModal(viewerModal);

            showToast("Memory deleted");

        }

        catch (error) {

            console.error("Memory deletion failed:", error);

            showToast(error.message || "Could not delete memory.");

        }

        finally {

            isDeletingMemory = false;

            confirmDeleteMemoryButton.disabled = false;

            closeDeleteMemoryButton.disabled = false;

            cancelDeleteMemoryButton.disabled = false;

            confirmDeleteMemoryButton.textContent = "DELETE MEMORY";
        }

    }
);


/* =========================================================
   UPLOAD
   ========================================================= */

function revokeUploadItem(item) {

    if (item?.previewUrl) {
        URL.revokeObjectURL(item.previewUrl);
    }
}


function updateDevelopButton() {

    const count = selectedUploadFiles.length;
    const failedCount = selectedUploadFiles.filter(
        item => item.status === "failed"
    ).length;

    developButtonLabel.textContent = uploadSharedDate !== null && failedCount
        ? `RETRY ${failedCount} FAILED`
        : count > 1
            ? `DEVELOP ${count} MEMORIES`
            : "DEVELOP MEMORY";
}


function resetUploadState() {

    selectedUploadFiles.forEach(revokeUploadItem);
    selectedUploadFiles = [];
    uploadGroupId = null;
    uploadSharedDate = null;
    uploadSharedCaption = null;
    uploadSharedPrivateNote = null;
    draggedUploadItemId = null;
    nextUploadItemId = 0;
    uploadProgress.hidden = true;
    uploadProgress.innerHTML = "";
    memoryFile.value = "";
    memoryDate.disabled = false;
    memoryCaption.disabled = false;
    memoryPrivateNote.disabled = false;
    updateDevelopButton();
}


function resetUploadPreview() {

    uploadPreview.innerHTML = `
        <div class="upload-plus">+</div>
        <strong>Choose memories</strong>
        <span>or drop them here</span>
        <small>JPG · PNG · WEBP · GIF · MP4 · WEBM</small>
    `;
}


function renderUploadPreview() {

    if (!selectedUploadFiles.length) {
        resetUploadPreview();
        updateDevelopButton();
        return;
    }

    const locked = uploadSharedDate !== null;

    uploadPreview.innerHTML = `
        <div class="selected-memories-heading">
            <strong>SELECTED MEMORIES</strong>
            <span>${selectedUploadFiles.length} EXPOSURE${selectedUploadFiles.length === 1 ? "" : "S"}</span>
        </div>
        <div class="selected-memories-grid">
            ${selectedUploadFiles.map((item, index) => `
                <article
                    class="selected-memory ${item.status}"
                    data-upload-id="${item.id}"
                    draggable="${!locked && !isUploadingMemories}"
                >
                    <div class="selected-memory-media">
                        ${item.file.type.startsWith("image/")
                            ? `<img src="${item.previewUrl}" alt="">`
                            : `<video src="${item.previewUrl}" muted playsinline preload="metadata"></video>`}
                        <span class="selected-memory-order">${index + 1}</span>
                        <span class="selected-memory-type">${item.file.type === "image/gif" ? "GIF" : item.file.type.startsWith("video/") ? "VIDEO" : "PHOTO"}</span>
                    </div>
                    <p title="${escapeHTML(item.file.name)}">${escapeHTML(item.file.name)}</p>
                    <div class="selected-memory-actions">
                        <button type="button" data-move="left" aria-label="Move ${escapeHTML(item.file.name)} left" ${locked || index === 0 ? "disabled" : ""}>←</button>
                        <button type="button" data-move="right" aria-label="Move ${escapeHTML(item.file.name)} right" ${locked || index === selectedUploadFiles.length - 1 ? "disabled" : ""}>→</button>
                        <button type="button" class="remove-selected-memory" data-remove aria-label="Remove ${escapeHTML(item.file.name)}" ${locked ? "disabled" : ""}>×</button>
                    </div>
                </article>
            `).join("")}
        </div>
        <small class="reorder-help">${locked ? "Upload order locked" : "Drag to reorder or use the arrow controls"}</small>
    `;

    updateDevelopButton();
}


function addSelectedFiles(files) {

    if (isUploadingMemories || uploadSharedDate !== null) {
        return;
    }

    const incoming = Array.from(files || []);

    if (selectedUploadFiles.length + incoming.length > MAX_UPLOAD_FILES) {
        showToast("A Memory Set can contain up to 20 files.");
        memoryFile.value = "";
        return;
    }

    let rejectedType = false;
    let rejectedSize = false;

    incoming.forEach(file => {
        const supported =
            file.type.startsWith("image/") ||
            file.type.startsWith("video/");

        if (!supported) {
            rejectedType = true;
            return;
        }

        if (file.size > MAX_UPLOAD_FILE_SIZE) {
            rejectedSize = true;
            return;
        }

        selectedUploadFiles.push({
            id: `upload-${++nextUploadItemId}`,
            file,
            previewUrl: URL.createObjectURL(file),
            status: "pending",
            error: null,
            order: null
        });
    });

    if (rejectedType) {
        showToast("Only images, GIFs and videos are supported.");
    } else if (rejectedSize) {
        showToast("Each file must be 100 MB or smaller.");
    }

    memoryFile.value = "";
    renderUploadPreview();
}


function openUploadModal(monthIndex = null) {

    resetUploadState();
    uploadForm.reset();
    resetUploadPreview();

    const date = monthIndex === null
        ? new Date()
        : new Date(CURRENT_YEAR, monthIndex, 1);

    memoryDate.value = dateToInputValue(date);
    openModal(uploadModal);
}


function closeUploadModal() {

    if (isUploadingMemories) {
        showToast("Please wait for the current upload to finish.");
        return;
    }

    resetUploadState();
    uploadForm.reset();
    resetUploadPreview();
    closeModal(uploadModal);
}


memoryFile.addEventListener("change", event => {
    addSelectedFiles(event.target.files);
});


["dragenter", "dragover"].forEach(name => {
    dropZone.addEventListener(name, event => {
        event.preventDefault();
        dropZone.classList.add("drag-over");
    });
});


dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("drag-over");
});


dropZone.addEventListener("drop", event => {
    event.preventDefault();
    dropZone.classList.remove("drag-over");
    addSelectedFiles(event.dataTransfer.files);
});


dropZone.addEventListener("click", event => {
    if (!event.target.closest("button") && !isUploadingMemories) {
        memoryFile.click();
    }
});


dropZone.addEventListener("keydown", event => {
    if (
        (event.key === "Enter" || event.key === " ") &&
        !event.target.closest("button")
    ) {
        event.preventDefault();
        memoryFile.click();
    }
});


uploadPreview.addEventListener("click", event => {
    const card = event.target.closest("[data-upload-id]");

    if (!card || isUploadingMemories || uploadSharedDate !== null) {
        return;
    }

    const index = selectedUploadFiles.findIndex(
        item => item.id === card.dataset.uploadId
    );

    if (index === -1) {
        return;
    }

    if (event.target.closest("[data-remove]")) {
        revokeUploadItem(selectedUploadFiles[index]);
        selectedUploadFiles.splice(index, 1);
    } else {
        const moveButton = event.target.closest("[data-move]");

        if (!moveButton) {
            return;
        }

        const destination = moveButton.dataset.move === "left"
            ? index - 1
            : index + 1;

        if (destination < 0 || destination >= selectedUploadFiles.length) {
            return;
        }

        const [item] = selectedUploadFiles.splice(index, 1);
        selectedUploadFiles.splice(destination, 0, item);
    }

    renderUploadPreview();
});


uploadPreview.addEventListener("dragstart", event => {
    if (uploadSharedDate !== null || isUploadingMemories) {
        event.preventDefault();
        return;
    }

    const card = event.target.closest("[data-upload-id]");
    draggedUploadItemId = card?.dataset.uploadId || null;

    if (draggedUploadItemId) {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", draggedUploadItemId);
    }
});


uploadPreview.addEventListener("dragover", event => {
    if (event.target.closest("[data-upload-id]") && draggedUploadItemId) {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }
});


uploadPreview.addEventListener("drop", event => {
    const target = event.target.closest("[data-upload-id]");

    if (!target || !draggedUploadItemId || uploadSharedDate !== null) {
        return;
    }

    event.preventDefault();

    const from = selectedUploadFiles.findIndex(
        item => item.id === draggedUploadItemId
    );
    const to = selectedUploadFiles.findIndex(
        item => item.id === target.dataset.uploadId
    );

    if (from !== -1 && to !== -1 && from !== to) {
        const [item] = selectedUploadFiles.splice(from, 1);
        selectedUploadFiles.splice(to, 0, item);
        renderUploadPreview();
    }

    draggedUploadItemId = null;
});


function renderUploadProgress(current = 0, total = 0) {

    uploadProgress.hidden = false;
    uploadProgress.innerHTML = `
        <strong>DEVELOPING MEMORIES</strong>
        <span>${current} of ${total}</span>
        <ul>
            ${selectedUploadFiles.map(item => `
                <li class="${item.status}">
                    <span>${item.status === "success" ? "✓" : item.status === "uploading" ? "↑" : item.status === "failed" ? "!" : "○"}</span>
                    <span>${escapeHTML(item.file.name)}</span>
                </li>
            `).join("")}
        </ul>
    `;
}


async function uploadMemoryItem(item, date, caption, privateNote) {

    const formData = new FormData();
    formData.append("file", item.file);
    formData.append("date", date);
    formData.append("caption", caption);
    formData.append("private_note", privateNote || "");

    if (uploadGroupId) {
        formData.append("group_id", uploadGroupId);
        formData.append("group_order", String(item.order));
    }

    const response = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        body: formData
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.error || data.message || "Upload failed.");
    }

    if (!data.memory) {
        throw new Error("Server did not return the memory.");
    }

    return normalizeMemory(data.memory);
}


uploadForm.addEventListener("submit", async event => {
    event.preventDefault();

    if (isUploadingMemories) {
        return;
    }

    if (!selectedUploadFiles.length) {
        showToast("Choose a memory first.");
        return;
    }

    if (!memoryDate.value) {
        showToast("Choose a date.");
        return;
    }

    if (uploadSharedDate === null) {
        const privateNote = memoryPrivateNote.value.trim();

        if (privateNote.length > 2000) {
            showToast("Private notes can contain up to 2000 characters.");
            return;
        }

        uploadSharedDate = memoryDate.value;
        uploadSharedCaption = memoryCaption.value.trim() || "Untitled memory";
        uploadSharedPrivateNote = privateNote || null;

        if (selectedUploadFiles.length > 1) {
            uploadGroupId = crypto.randomUUID();
        }

        selectedUploadFiles.forEach((item, index) => {
            item.order = uploadGroupId ? index : null;
        });
    }

    const targets = selectedUploadFiles.filter(
        item => item.status === "pending" || item.status === "failed"
    );

    if (!targets.length) {
        return;
    }

    isUploadingMemories = true;
    developButton.disabled = true;
    closeUploadButton.disabled = true;
    memoryDate.disabled = true;
    memoryCaption.disabled = true;
    memoryPrivateNote.disabled = true;
    renderUploadPreview();

    const date = uploadSharedDate;
    const caption = uploadSharedCaption;
    const privateNote = uploadSharedPrivateNote;
    let completed = 0;

    renderUploadProgress(completed, targets.length);

    for (const item of targets) {
        item.status = "uploading";
        item.error = null;
        renderUploadProgress(completed + 1, targets.length);

        try {
            const memory = await uploadMemoryItem(
                item,
                date,
                caption,
                privateNote
            );
            item.status = "success";
            memories.push(memory);
        } catch (error) {
            console.error(`Upload failed for ${item.file.name}:`, error);
            item.status = "failed";
            item.error = error.message || "Upload failed.";
        }

        completed += 1;
        renderUploadProgress(completed, targets.length);
    }

    isUploadingMemories = false;
    developButton.disabled = false;
    closeUploadButton.disabled = false;

    buildGallery();
    updateTimeline();

    const failures = selectedUploadFiles.filter(
        item => item.status === "failed"
    );
    const successCount = selectedUploadFiles.filter(
        item => item.status === "success"
    ).length;

    if (failures.length) {
        renderUploadPreview();
        showToast(
            `${successCount} of ${selectedUploadFiles.length} memories developed. ${failures.length} failed.`
        );
        return;
    }

    const month = getMonthIndex(date);
    const total = selectedUploadFiles.length;

    resetUploadState();
    uploadForm.reset();
    closeModal(uploadModal);

    showToast(
        total === 1
            ? "Exposure developed ♡"
            : `${total} memories developed ♡`
    );

    setTimeout(() => scrollToMonth(month), 150);
});


closeUploadButton.addEventListener("click", closeUploadModal);


/* =========================================================
   SEARCH
   ========================================================= */

function createSmallPreview(
    memory,
    autoplayVideo = true
) {

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
                ${autoplayVideo ? "autoplay loop" : ""}
                playsinline
                preload="metadata"
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
        closeUploadModal
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

        const target = event.target;

        const isEditingField =
            target instanceof Element &&
            (
                target.isContentEditable ||
                target.closest("input, textarea, select")
            );


        if (
            ourFilmsModal.classList
                .contains("open")
        ) {

            if (event.key === "Escape") {
                closeOurFilms();
                return;
            }


            if (!isEditingField && event.key === "ArrowRight") {
                event.preventDefault();
                showNextOurFilmsMemory();
            }


            if (!isEditingField && event.key === "ArrowLeft") {
                event.preventDefault();
                showPreviousOurFilmsMemory();
            }


            return;
        }


        const modal =
            document.querySelector(
                ".modal.open"
            );


        if (modal) {

            if (
                event.key === "Escape"
            ) {

                if (
                    editMemoryModal.classList
                        .contains("open")
                ) {

                    closeEditMemoryModal();

                } else if (
                    deleteMemoryModal.classList
                        .contains("open")
                ) {

                    closeDeleteMemoryModal();

                } else if (
                    uploadModal.classList
                        .contains("open")
                ) {

                    closeUploadModal();

                } else {

                    closeAllModals();

                }
            }


            if (
                viewerModal.classList
                    .contains("open") &&
                !isEditingField
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

    buildOurFilmsMonthNav();


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
