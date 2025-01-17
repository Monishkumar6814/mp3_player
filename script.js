const folderBtn = document.getElementById("folder-btn");
const folderSelector = document.getElementById("folder-selector");
const playlist = document.getElementById("playlist");
const playPauseBtn = document.getElementById("play-pause-btn");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const repeatBtn = document.getElementById("repeat-btn");
const repeatFolderBtn = document.getElementById("repeat-folder-btn");
const noRepeatBtn = document.getElementById("no-repeat-btn");
const audio = new Audio();
const timeline = document.getElementById("timeline");
const startTime = document.getElementById("start-time");
const endTime = document.getElementById("end-time");
const prevPageBtn = document.getElementById("prev-page-btn");
const nextPageBtn = document.getElementById("next-page-btn");
const errorMessageElement = document.getElementById("error-message");
const songNameElement = document.getElementById("current-song-name");
const volumeSlider = document.getElementById("volume-slider");
const volumeDecreaseBtn = document.getElementById("volume-decrease-btn");
const volumeIncreaseBtn = document.getElementById("volume-increase-btn");
const volumeContainer = document.getElementById("volume-container");

let songs = [];
let currentTrackIndex = 0;
let currentPage = 0;
const songsPerPage = 10;
let repeatMode = 'none'; // 'none', 'repeat', 'repeat-folder'

// Event listeners for folder selection and song loading
folderBtn.addEventListener("click", () => {
  folderSelector.click();
});

folderSelector.addEventListener("change", (event) => {
  const files = Array.from(event.target.files);
  songs = files.filter((file) => file.type.startsWith("audio/"));

  if (songs.length > 0) {
    loadPage(0);
    loadTrack(0);
  } else {
    showErrorMessage("No audio files found in the selected folder.");
  }
});

function showErrorMessage(message) {
  errorMessageElement.textContent = message;
  errorMessageElement.style.display = "block";
}

function loadPage(page) {
  currentPage = page;
  const start = page * songsPerPage;
  const end = Math.min(start + songsPerPage, songs.length);
  playlist.innerHTML = "";

  for (let i = start; i < end; i++) {
    const li = document.createElement("li");
    li.textContent = songs[i].name;
    li.classList.add("playlist-item");
    li.addEventListener("click", () => loadTrack(i));
    playlist.appendChild(li);
  }

  prevPageBtn.disabled = page === 0;
  nextPageBtn.disabled = end >= songs.length;
}

function loadTrack(index) {
  currentTrackIndex = index;
  const song = songs[index];
  audio.src = URL.createObjectURL(song);
  audio.load();
  audio.play();

  // Update song name below the timeline
  songNameElement.textContent = song.name;

  const albumThumbnail = document.getElementById("album-thumbnail");
  const albumImage = document.getElementById("album-image");

  jsmediatags.read(song, {
    onSuccess: function (tag) {
      const picture = tag.tags.picture;
      if (picture) {
        const base64String = arrayBufferToBase64(picture.data);
        albumImage.src = `data:${picture.format};base64,${base64String}`;
        albumThumbnail.style.display = "block";
      } else {
        albumImage.src = "";
        albumThumbnail.style.display = "none";
      }
    },
    onError: function () {
      albumImage.src = "";
      albumThumbnail.style.display = "none";
    },
  });

  updateTimeline();
}

// Convert array buffer to base64 string
function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Update the timeline progress bar
function updateTimeline() {
  audio.addEventListener("timeupdate", () => {
    const currentTime = audio.currentTime;
    const duration = audio.duration;

    if (!isNaN(duration)) {
      const percentage = (currentTime / duration) * 100;
      timeline.value = percentage;
      startTime.textContent = formatTime(currentTime);
      endTime.textContent = formatTime(duration);
    }
  });

  timeline.addEventListener("input", () => {
    const newTime = (timeline.value / 100) * audio.duration;
    audio.currentTime = newTime;
  });
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

// Repeat button functionality
repeatBtn.addEventListener("click", () => {
  repeatMode = (repeatMode === 'repeat') ? 'none' : 'repeat';
  updateRepeatButton();
});

// Repeat folder button functionality
repeatFolderBtn.addEventListener("click", () => {
  repeatMode = (repeatMode === 'repeat-folder') ? 'none' : 'repeat-folder';
  updateRepeatButton();
});

// No repeat button functionality
noRepeatBtn.addEventListener("click", () => {
  repeatMode = 'none';
  updateRepeatButton();
});

function updateRepeatButton() {
  if (repeatMode === 'repeat') {
    repeatBtn.classList.add("active");
    repeatFolderBtn.classList.remove("active");
    noRepeatBtn.classList.remove("active");
  } else if (repeatMode === 'repeat-folder') {
    repeatFolderBtn.classList.add("active");
    repeatBtn.classList.remove("active");
    noRepeatBtn.classList.remove("active");
  } else {
    noRepeatBtn.classList.add("active");
    repeatBtn.classList.remove("active");
    repeatFolderBtn.classList.remove("active");
  }
}

// Autoplay Next functionality
audio.addEventListener("ended", () => {
  if (repeatMode === 'repeat') {
    audio.play();
  } else if (repeatMode === 'repeat-folder') {
    currentTrackIndex = (currentTrackIndex + 1) % songs.length;
    loadTrack(currentTrackIndex);
  } else if (repeatMode === 'none' && currentTrackIndex < songs.length - 1) {
    loadTrack(currentTrackIndex + 1);
  }
});

// Play and Pause toggle functionality
playPauseBtn.addEventListener("click", () => {
  if (audio.paused) {
    audio.play();
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>'; // Change icon to pause
  } else {
    audio.pause();
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>'; // Change icon to play
  }
});

// Update the button when audio is paused or played externally
audio.addEventListener("play", () => {
  playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
});

audio.addEventListener("pause", () => {
  playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
});

// Previous and Next song buttons
prevBtn.addEventListener("click", () => {
  if (currentTrackIndex > 0) {
    loadTrack(currentTrackIndex - 1);
  }
});

nextBtn.addEventListener("click", () => {
  if (currentTrackIndex < songs.length - 1) {
    loadTrack(currentTrackIndex + 1);
  }
});

// Page navigation
prevPageBtn.addEventListener("click", () => {
  if (currentPage > 0) {
    loadPage(currentPage - 1);
  }
});

nextPageBtn.addEventListener("click", () => {
  if (currentPage < Math.floor(songs.length / songsPerPage)) {
    loadPage(currentPage + 1);
  }
});

// Volume control functionality
volumeSlider.addEventListener("input", () => {
  audio.volume = volumeSlider.value;
});

// Show volume slider when clicked
volumeDecreaseBtn.addEventListener("click", () => {
  toggleVolumeSlider();
});

volumeIncreaseBtn.addEventListener("click", () => {
  toggleVolumeSlider();
});

function toggleVolumeSlider() {
  if (volumeContainer.style.display === "none" || volumeContainer.style.display === "") {
    volumeContainer.style.display = "block";
  } else {
    volumeContainer.style.display = "none";
  }
}

// Auto-hide volume slider after adjustment
volumeSlider.addEventListener("input", () => {
  setTimeout(() => {
    volumeContainer.style.display = "none";
  }, 2000); // Hide after 2 seconds of inactivity
});
