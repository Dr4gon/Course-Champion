<template>
  <div class="video-player-container">
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <span>Loading video...</span>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
      <button @click="retryLoading" class="retry-button">Retry</button>
    </div>

    <video
      ref="videoElement"
      class="video-element"
      :poster="posterSrc || ''"
      :class="{ hidden: loading || error }"
      @timeupdate="handleTimeUpdate"
      @ended="handleVideoEnded"
      @pause="handleVideoPause"
      @play="handleVideoPlay"
      @error="handleVideoError"
      @loadeddata="handleVideoLoaded"
      @click="togglePlay"
      crossorigin="anonymous"
    >
      <source
        :src="videoSrc"
        :type="sourceType"
        v-if="!isHlsStream && videoSrc"
      />
      <!-- HLS and other streaming formats are handled via plyr and hls.js -->
      <track
        v-for="(subtitle, index) in subtitles"
        :key="index"
        kind="subtitles"
        :src="subtitle.src"
        :srclang="subtitle.lang"
        :label="subtitle.label"
        :default="subtitle.default"
      />
    </video>

    <div class="video-controls" v-if="!loading && !error">
      <div class="progress-container" @click="seekVideo">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
          <div class="progress-marker" :style="{ left: `${progress}%` }"></div>
        </div>
      </div>

      <div class="controls-buttons">
        <button @click="togglePlay" class="control-button">
          <i :class="isPlaying ? 'fas fa-pause' : 'fas fa-play'"></i>
        </button>

        <div class="volume-container">
          <button @click="toggleMute" class="control-button">
            <i :class="isMuted ? 'fas fa-volume-mute' : 'fas fa-volume-up'"></i>
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            v-model="volume"
            @input="updateVolume"
            class="volume-slider"
          />
        </div>

        <div class="playback-time">
          {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
        </div>

        <div class="right-controls">
          <button @click="toggleFullscreen" class="control-button">
            <i class="fas fa-expand"></i>
          </button>

          <div class="playback-rate-container">
            <button @click="togglePlaybackRateMenu" class="control-button">
              {{ playbackRate }}x
            </button>
            <div class="playback-rate-menu" v-if="showPlaybackRateMenu">
              <button
                v-for="rate in playbackRates"
                :key="rate"
                @click="setPlaybackRate(rate)"
                :class="{ active: playbackRate === rate }"
              >
                {{ rate }}x
              </button>
            </div>
          </div>

          <div class="quality-container" v-if="availableQualities.length > 1">
            <button @click="toggleQualityMenu" class="control-button">
              {{ currentQuality }}
            </button>
            <div class="quality-menu" v-if="showQualityMenu">
              <button
                v-for="quality in availableQualities"
                :key="quality"
                @click="setQuality(quality)"
                :class="{ active: currentQuality === quality }"
              >
                {{ quality }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Hls from "hls.js";
import {
  saveVideoProgress,
  getVideoProgress,
} from "../services/progressService";

export default {
  name: "VideoPlayer",
  props: {
    videoSrc: {
      type: String,
      required: true,
    },
    posterSrc: {
      type: String,
      default: "",
    },
    courseId: {
      type: [Number, String],
      default: null,
    },
    lessonId: {
      type: [Number, String],
      default: null,
    },
    autoplay: {
      type: Boolean,
      default: false,
    },
    drmConfig: {
      type: Object,
      default: () => ({
        enabled: false,
        licenseUrl: "",
        headers: {},
      }),
    },
    subtitles: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      loading: true,
      error: null,
      isPlaying: false,
      isMuted: false,
      currentTime: 0,
      duration: 0,
      progress: 0,
      volume: 1,
      playbackRate: 1,
      playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
      showPlaybackRateMenu: false,
      showQualityMenu: false,
      hls: null,
      availableQualities: ["Auto"],
      currentQuality: "Auto",
      videoKey: null,
      progressSaveInterval: null,
      lastReportedProgress: 0,
    };
  },
  computed: {
    isHlsStream() {
      return (
        this.videoSrc &&
        (this.videoSrc.includes(".m3u8") ||
          this.videoSrc.includes("application/x-mpegURL") ||
          this.videoSrc.includes("application/vnd.apple.mpegurl"))
      );
    },
    sourceType() {
      if (this.videoSrc) {
        if (this.videoSrc.includes(".mp4")) return "video/mp4";
        if (this.videoSrc.includes(".webm")) return "video/webm";
        if (this.videoSrc.includes(".m3u8")) return "application/x-mpegURL";
        if (this.videoSrc.includes(".mpd")) return "application/dash+xml";
      }
      return "video/mp4"; // Default
    },
    videoIdentifier() {
      // Used to identify the video for progress tracking
      return `${this.courseId || "course"}_${this.lessonId || "lesson"}_${
        this.videoSrc
      }`;
    },
  },
  watch: {
    videoSrc: {
      handler(newSrc, oldSrc) {
        if (newSrc !== oldSrc) {
          this.resetPlayer();
          this.initializePlayer();
        }
      },
      immediate: true,
    },
  },
  methods: {
    initializePlayer() {
      this.loading = true;
      this.error = null;

      // Wait for the component to be mounted
      this.$nextTick(() => {
        const video = this.$refs.videoElement;
        if (!video) return;

        // Set initial volume
        video.volume = this.volume;

        // Check for HLS format
        if (this.isHlsStream && Hls.isSupported()) {
          this.initializeHls();
        } else {
          // For direct video sources or native HLS support
          video.src = this.videoSrc;

          // Load saved progress if available
          this.loadSavedProgress();
        }

        // Setup event handlers
        video.addEventListener("loadedmetadata", () => {
          this.duration = video.duration;
        });

        // Setup autosave interval
        this.setupProgressSaving();
      });
    },

    initializeHls() {
      const video = this.$refs.videoElement;
      if (!video) return;

      // Destroy previous HLS instance if exists
      if (this.hls) {
        this.hls.destroy();
      }

      // Create new HLS instance
      this.hls = new Hls({
        debug: false,
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
      });

      // Setup HLS
      this.hls.loadSource(this.videoSrc);
      this.hls.attachMedia(video);

      // Handle HLS events
      this.hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        this.handleManifestParsed(data);

        // Load saved progress if available
        this.loadSavedProgress();

        if (this.autoplay) {
          video.play().catch((error) => {
            console.warn("Autoplay prevented:", error);
          });
        }
      });

      this.hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              // Try to recover network error
              console.log("Network error, trying to recover...");
              this.hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log("Media error, trying to recover...");
              this.hls.recoverMediaError();
              break;
            default:
              // Cannot recover, destroy and recreate HLS
              this.error = `Fatal streaming error: ${data.details}`;
              this.hls.destroy();
              break;
          }
        }
      });
    },

    handleManifestParsed(data) {
      // Handle quality levels
      if (data.levels && data.levels.length > 1) {
        // Extract available qualities
        this.availableQualities = [
          "Auto",
          ...data.levels.map((level) => {
            const height = level.height;
            return height ? `${height}p` : "Unknown";
          }),
        ];
      }
    },

    loadSavedProgress() {
      if (this.courseId && this.lessonId) {
        const savedProgress = getVideoProgress(this.videoIdentifier);
        if (savedProgress && savedProgress.currentTime) {
          // Only restore if the saved position is less than 98% of the video
          const video = this.$refs.videoElement;
          if (
            video &&
            video.duration &&
            savedProgress.currentTime < video.duration * 0.98
          ) {
            video.currentTime = savedProgress.currentTime;
            this.currentTime = savedProgress.currentTime;
            this.updateProgress();
          }
        }
      }
    },

    setupProgressSaving() {
      // Clear previous interval if exists
      if (this.progressSaveInterval) {
        clearInterval(this.progressSaveInterval);
      }

      // Save progress every 5 seconds if video is playing
      this.progressSaveInterval = setInterval(() => {
        if (
          this.isPlaying &&
          this.currentTime > 0 &&
          this.courseId &&
          this.lessonId
        ) {
          // Only save if progress has changed by more than 1 second
          if (Math.abs(this.currentTime - this.lastReportedProgress) > 1) {
            saveVideoProgress(this.videoIdentifier, {
              currentTime: this.currentTime,
              duration: this.duration,
              progress: this.progress,
              timestamp: new Date().toISOString(),
            });

            this.lastReportedProgress = this.currentTime;

            // Emit progress event
            this.$emit("progress-updated", {
              currentTime: this.currentTime,
              duration: this.duration,
              progress: this.progress,
            });
          }
        }
      }, 5000);
    },

    resetPlayer() {
      const video = this.$refs.videoElement;
      if (video) {
        video.pause();
        video.currentTime = 0;
        video.src = "";
      }

      // Reset state
      this.isPlaying = false;
      this.currentTime = 0;
      this.duration = 0;
      this.progress = 0;
      this.loading = true;
      this.error = null;
      this.availableQualities = ["Auto"];
      this.currentQuality = "Auto";

      // Destroy HLS if exists
      if (this.hls) {
        this.hls.destroy();
        this.hls = null;
      }

      // Clear progress saving interval
      if (this.progressSaveInterval) {
        clearInterval(this.progressSaveInterval);
        this.progressSaveInterval = null;
      }
    },

    togglePlay() {
      const video = this.$refs.videoElement;
      if (video) {
        if (video.paused) {
          video
            .play()
            .then(() => {
              this.isPlaying = true;
            })
            .catch((error) => {
              console.error("Error playing video:", error);
              this.error = "Failed to play video. Please try again.";
            });
        } else {
          video.pause();
          this.isPlaying = false;
        }
      }
    },

    toggleMute() {
      const video = this.$refs.videoElement;
      if (video) {
        video.muted = !video.muted;
        this.isMuted = video.muted;
      }
    },

    updateVolume() {
      const video = this.$refs.videoElement;
      if (video) {
        video.volume = this.volume;
        video.muted = this.volume === 0;
        this.isMuted = video.muted;
      }
    },

    handleTimeUpdate() {
      const video = this.$refs.videoElement;
      if (video) {
        this.currentTime = video.currentTime;
        this.updateProgress();
      }
    },

    updateProgress() {
      if (this.duration > 0) {
        this.progress = (this.currentTime / this.duration) * 100;
      }
    },

    seekVideo(event) {
      const video = this.$refs.videoElement;
      if (video && this.duration > 0) {
        const progressBar = event.currentTarget;
        const clickPosition =
          (event.clientX - progressBar.getBoundingClientRect().left) /
          progressBar.offsetWidth;
        video.currentTime = clickPosition * this.duration;
        this.currentTime = video.currentTime;
        this.updateProgress();
      }
    },

    toggleFullscreen() {
      const container = this.$el;

      if (!document.fullscreenElement) {
        if (container.requestFullscreen) {
          container.requestFullscreen();
        } else if (container.mozRequestFullScreen) {
          container.mozRequestFullScreen();
        } else if (container.webkitRequestFullscreen) {
          container.webkitRequestFullscreen();
        } else if (container.msRequestFullscreen) {
          container.msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
    },

    togglePlaybackRateMenu() {
      this.showPlaybackRateMenu = !this.showPlaybackRateMenu;
      if (this.showPlaybackRateMenu) {
        this.showQualityMenu = false;
      }
    },

    toggleQualityMenu() {
      this.showQualityMenu = !this.showQualityMenu;
      if (this.showQualityMenu) {
        this.showPlaybackRateMenu = false;
      }
    },

    setPlaybackRate(rate) {
      const video = this.$refs.videoElement;
      if (video) {
        video.playbackRate = rate;
        this.playbackRate = rate;
        this.showPlaybackRateMenu = false;
      }
    },

    setQuality(quality) {
      if (this.hls && quality !== this.currentQuality) {
        if (quality === "Auto") {
          this.hls.currentLevel = -1; // Auto level
        } else {
          // Find the level index for the selected quality
          const levelIndex = this.availableQualities.indexOf(quality) - 1; // -1 to account for 'Auto'
          if (levelIndex >= 0) {
            this.hls.currentLevel = levelIndex;
          }
        }

        this.currentQuality = quality;
        this.showQualityMenu = false;
      }
    },

    formatTime(seconds) {
      if (isNaN(seconds) || seconds < 0) {
        return "0:00";
      }

      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    },

    handleVideoEnded() {
      this.isPlaying = false;
      this.$emit("video-ended");

      // Save completion status
      if (this.courseId && this.lessonId) {
        saveVideoProgress(this.videoIdentifier, {
          currentTime: this.duration,
          duration: this.duration,
          progress: 100,
          completed: true,
          timestamp: new Date().toISOString(),
        });
      }
    },

    handleVideoPause() {
      this.isPlaying = false;
      this.$emit("video-paused", {
        currentTime: this.currentTime,
        duration: this.duration,
        progress: this.progress,
      });
    },

    handleVideoPlay() {
      this.isPlaying = true;
      this.$emit("video-played");
    },

    handleVideoError(e) {
      console.error("Video error:", e);
      this.error =
        "An error occurred while loading the video. Please try again.";
      this.loading = false;
    },

    handleVideoLoaded() {
      this.loading = false;
      this.error = null;
      this.$emit("video-loaded");
    },

    retryLoading() {
      this.resetPlayer();
      this.initializePlayer();
    },
  },
  beforeDestroy() {
    // Clean up HLS instance
    if (this.hls) {
      this.hls.destroy();
    }

    // Clear progress saving interval
    if (this.progressSaveInterval) {
      clearInterval(this.progressSaveInterval);
    }

    // Close any open menus when component is destroyed
    document.removeEventListener("click", this.closeMenusOnClickOutside);
  },
  mounted() {
    // Initialize video player
    this.initializePlayer();

    // Close menus when clicking outside
    document.addEventListener("click", (event) => {
      if (!this.$el.contains(event.target)) {
        this.showPlaybackRateMenu = false;
        this.showQualityMenu = false;
      }
    });
  },
};
</script>

<style scoped>
.video-player-container {
  position: relative;
  width: 100%;
  background-color: #000;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.video-element {
  width: 100%;
  display: block;
  cursor: pointer;
}

.video-element.hidden {
  display: none;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
  z-index: 5;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-message {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 20px;
  text-align: center;
  z-index: 5;
}

.retry-button {
  margin-top: 15px;
  padding: 8px 16px;
  background-color: #4a89dc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.video-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 10;
}

.video-player-container:hover .video-controls {
  opacity: 1;
}

.progress-container {
  width: 100%;
  height: 10px;
  cursor: pointer;
  margin-bottom: 8px;
}

.progress-bar {
  position: relative;
  width: 100%;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  position: absolute;
  height: 100%;
  background-color: #4a89dc;
  border-radius: 2px;
  transition: width 0.1s;
}

.progress-marker {
  position: absolute;
  top: 50%;
  width: 12px;
  height: 12px;
  background-color: #4a89dc;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  display: none;
}

.progress-container:hover .progress-bar {
  height: 6px;
}

.progress-container:hover .progress-marker {
  display: block;
}

.controls-buttons {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.control-button {
  background: none;
  border: none;
  color: white;
  font-size: 16px;
  cursor: pointer;
  padding: 5px 10px;
}

.volume-container {
  display: flex;
  align-items: center;
}

.volume-slider {
  width: 60px;
  margin-left: 5px;
  cursor: pointer;
}

.playback-time {
  font-size: 14px;
  margin: 0 10px;
}

.right-controls {
  display: flex;
  align-items: center;
}

.playback-rate-container,
.quality-container {
  position: relative;
  margin-left: 10px;
}

.playback-rate-menu,
.quality-menu {
  position: absolute;
  bottom: 30px;
  right: 0;
  background-color: rgba(0, 0, 0, 0.9);
  border-radius: 4px;
  padding: 5px;
  display: flex;
  flex-direction: column;
  z-index: 20;
}

.playback-rate-menu button,
.quality-menu button {
  background: none;
  border: none;
  color: white;
  padding: 5px 10px;
  text-align: center;
  min-width: 60px;
  cursor: pointer;
}

.playback-rate-menu button:hover,
.quality-menu button:hover,
.playback-rate-menu button.active,
.quality-menu button.active {
  background-color: rgba(255, 255, 255, 0.2);
}

/* Responsive styles */
@media (max-width: 640px) {
  .playback-time {
    display: none;
  }

  .volume-slider {
    width: 40px;
  }
}
</style>
