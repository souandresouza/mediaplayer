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