let player;
let audioElement;
let videoElement;
let isLocalAudio = false;
let isLocalVideo = false;
const display = document.querySelector('.display');
const playBtn = document.getElementById('play');
const pauseBtn = document.getElementById('pause');
const stopBtn = document.getElementById('stop');
const progress = document.getElementById('progress');
const volume = document.getElementById('volume');
const volumeLabel = document.getElementById('volume-label');
const fileInput = document.getElementById('fileInput');
const urlInput = document.getElementById('urlInput');
const loadUrlBtn = document.getElementById('loadUrl');

loadUrlBtn.addEventListener('click', () => {
    const url = urlInput.value.trim();
    if (url) {
        const videoId = extractYouTubeVideoId(url);
        if (videoId) {
            loadYouTubeVideo(videoId);
        } else {
            alert('Invalid YouTube URL.');
        }
    }
});

function extractYouTubeVideoId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(regex);
    return match ? match[1] : null;
}

function loadYouTubeVideo(videoId) {
    if (player) {
        player.loadVideoById(videoId);
    } else {
        player = new YT.Player('youtube-player', {
            height: '200',
            width: '400',
            videoId: videoId,
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
    }
    document.getElementById('youtube-player').style.display = 'block';
    if (audioElement) audioElement.pause();
    if (videoElement) videoElement.pause();
}

function onPlayerReady(event) {
    // This function is called when the YouTube player is ready
    document.getElementById('youtube-player').style.display = 'block';
    volume.value = player.getVolume();
    volumeLabel.textContent = `${volume.value}%`;
    updateProgress();
}

function onPlayerStateChange(event) {
    // This function is called when the player's state changes
    if (event.data === YT.PlayerState.ENDED) {
        stop(); // Stop the player when the video ends
    }
}

playBtn.addEventListener('click', () => {
    if (isLocalAudio && audioElement) {
        audioElement.play();
    } else if (isLocalVideo && videoElement) {
        videoElement.play();
    } else if (player && player.playVideo) {
        player.playVideo();
    }
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const fileType = file.type.split('/')[0];
        if (fileType === 'audio') {
            handleLocalAudio(file);
        } else if (fileType === 'video') {
            handleLocalVideo(file);
        }
    }
});

function handleLocalAudio(file) {
    isLocalAudio = true;
    isLocalVideo = false;
    if (audioElement) {
        audioElement.pause();
        audioElement.remove();
    }
    audioElement = new Audio(URL.createObjectURL(file));
    document.getElementById('youtube-player').style.display = 'none';
    audioElement.addEventListener('loadedmetadata', () => {
        display.textContent = `00:00 / ${formatTime(audioElement.duration)}`; // Display total duration
    });
    audioElement.addEventListener('canplaythrough', () => {
        audioElement.play(); // Ensure the audio is ready to play
    });
    audioElement.addEventListener('timeupdate', updateProgress);
    audioElement.addEventListener('ended', stop);
    volumeLabel.textContent = `${volume.value}%`;
    audioElement.volume = volume.value / 100; // Set initial volume
    volume.addEventListener('input', updateVolume); // Update volume on input change
}

function updateVolume() {
    if (isLocalAudio && audioElement) {
        audioElement.volume = volume.value / 100;
    } else if (isLocalVideo && videoElement) {
        videoElement.volume = volume.value / 100;
    } else if (player && player.setVolume) {
        player.setVolume(volume.value);
    }
    volumeLabel.textContent = `${volume.value}%`;
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}


function updateProgress() {
    let currentTime, duration;
    if (isLocalAudio && audioElement) {
        currentTime = audioElement.currentTime;
        duration = audioElement.duration;
    } else if (isLocalVideo && videoElement) {
        currentTime = videoElement.currentTime;
        duration = videoElement.duration;
    } else if (player && player.getCurrentTime) {
        currentTime = player.getCurrentTime();
        duration = player.getDuration();
    }
    if (duration) {
        const progressPercent = (currentTime / duration) * 100;
        progress.value = progressPercent;
        display.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
    }
}


function stop() {
    if (isLocalAudio && audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
    } else if (isLocalVideo && videoElement) {
        videoElement.pause();
        videoElement.currentTime = 0;
    } else if (player && player.stopVideo) {
        player.stopVideo();
    }
    display.textContent = '00:00 / 00:00';
    progress.value = 0;
}
