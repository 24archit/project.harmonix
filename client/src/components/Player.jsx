import React, { useState, useRef, useEffect, Suspense } from "react";
import prettyMilliseconds from "pretty-ms";
import ReactPlayer from "react-player/youtube";
import TrackLogo from "../assets/media/Animated-Track-Logo.webm";
import musicWave from "../assets/media/wave.webm";
import "../assets/styles/Player.css";

const Player = ({ url, setPlayerMeta }) => {
  const [volume, setVolume] = useState(0.8);
  const [playing, setPlaying] = useState(false); // Start with "not playing"
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volumeIcon, setVolumeIcon] = useState("fa-volume-high");
  const playerRef = useRef(null);
  const intervalRef = useRef(null);
  const volumeSliderRef = useRef(null); // Reference for volume slider

  // Handle spacebar play/pause functionality
  useEffect(() => {
    const handleSpacebar = (e) => {
      if ((e.code === "Space" || e.key === " ") && !isInputFocused()) {
        e.preventDefault(); // Prevent space from scrolling the page
        if (url) {
          togglePlayPause(); // Call the play/pause toggle
        }
      }
    };

    window.addEventListener("keydown", handleSpacebar);

    return () => window.removeEventListener("keydown", handleSpacebar);
  }, [url, playing]);

  // Function to check if an input field is focused
  const isInputFocused = () => {
    return (
      document.activeElement.tagName === "INPUT" ||
      document.activeElement.tagName === "TEXTAREA"
    );
  };

  // Handle mouse wheel volume control
  useEffect(() => {
    const handleVolumeScroll = (e) => {
      e.preventDefault(); // Prevent page scrolling
      const delta = e.deltaY > 0 ? -0.05 : 0.05; // Scroll up increases volume, scroll down decreases volume
      let newVolume = Math.min(1, Math.max(0, volume + delta));
      setVolume(newVolume);
      updateVolumeIcon(newVolume);
    };

    // Attach scroll listener to the volume slider only
    const slider = volumeSliderRef.current;
    if (slider) {
      slider.addEventListener("wheel", handleVolumeScroll);
    }

    return () => {
      if (slider) {
        slider.removeEventListener("wheel", handleVolumeScroll);
      }
    };
  }, [volume]);

  useEffect(() => {
    if (url) {
      setPlaying(true);
      setProgress(0); // Reset progress to 0 when a new URL is set
      setDuration(0); // Reset duration to 0 when a new URL is set
      if (playerRef.current) {
        playerRef.current.seekTo(0, "seconds"); // Seek to the beginning of the new song
      }
    } else {
      setPlaying(false); // Ensure it stops playing if URL is empty
    }
  }, [url]);

  useEffect(() => {
    updateVolumeIcon(volume);
  }, [volume]);

  useEffect(() => {
    if (progress >= 1) {
      setPlaying(false); // Stop playing when the progress reaches the end (1 or 100%)
    }
  }, [progress]);

  useEffect(() => {
    // Clear previous interval when URL changes or when playback is stopped
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (playing && duration > 0) {
      intervalRef.current = setInterval(() => {
        if (playerRef.current) {
          const currentTime = playerRef.current.getCurrentTime();
          if (duration > 0 && !isNaN(currentTime)) {
            const currentProgress = currentTime / duration;
            setProgress(currentProgress);
          }
        }
      }, 1000); // Check every second
    }

    return () => clearInterval(intervalRef.current); // Cleanup on unmount
  }, [playing, duration]);

  const handleVolumeChange = (event) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
    updateVolumeIcon(newVolume);
  };

  const togglePlayPause = () => {
    // Only toggle play/pause if a URL is set
    if (url) {
      setPlaying((prev) => !prev);
      if (playerRef.current) {
        if (playing) {
          playerRef.current.getInternalPlayer().pauseVideo(); // Pause video
        } else {
          playerRef.current.getInternalPlayer().playVideo(); // Play video
        }
      }
    }
  };

  const handleDuration = (duration) => {
    if (!isNaN(duration)) {
      setDuration(duration); // Set the duration when it's available
    }
  };

  const handleSeekChange = (e) => {
    const newProgress = parseFloat(e.target.value);
    if (!isNaN(newProgress) && duration > 0) {
      setProgress(newProgress);
      playerRef.current.seekTo(newProgress * duration, "seconds");
    }
  };

  const handlePlayerError = (error) => {
    console.error("Error playing video:", error);
    setPlaying(false);
    setPlayerMeta("");
    setProgress(0);
    alert("This audio is not available right now 55");
  };

  const updateVolumeIcon = (volume) => {
    const icon =
      volume === 0
        ? "fa-volume-xmark"
        : volume <= 0.5
        ? "fa-volume-low"
        : "fa-volume-high";
    setVolumeIcon(icon);
  };

  // Handle when video ends
  const handleEnded = () => {
    setProgress(1); // Set progress to 100% (1.0)
    setPlaying(false); // Pause the player when the video ends
  };

  return (
    <>
      <div className="player">
        <div className="thumbnail">
          <video autoPlay loop muted src={TrackLogo} />
        </div>
        <button
          className="play-pause-btn"
          onClick={togglePlayPause}
          disabled={!url} // Disable button if URL is not set
        >
          {playing ? (
            <i className="fa-solid fa-pause icon"></i>
          ) : (
            <i className="fa-solid fa-play icon"></i>
          )}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step="0.01"
          value={isNaN(progress) ? 0 : progress}
          onChange={handleSeekChange}
          disabled={!url} // Disable seek bar if URL is not set
        />
        <span className="duration-board">
          {prettyMilliseconds(Math.round(progress * duration) * 1000, {
            colonNotation: true,
            secondsDecimalDigits: 0,
          })}{" "}
          |{" "}
          {prettyMilliseconds(duration * 1000, {
            colonNotation: true,
            secondsDecimalDigits: 0,
          })}
        </span>
        <i className={`fa-solid ${volumeIcon} volume-icon`}></i>
        <input
          type="range"
          min={0}
          max={1}
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          ref={volumeSliderRef} // Reference for volume slider
          id="volumeSlider"
        />
         (
          <div className="music-wave">
           {playing && <video autoPlay loop muted  src={musicWave} />}
         </div>
        )
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        {url && (
          <ReactPlayer
            key={url} // Force ReactPlayer to reinitialize on URL change
            ref={playerRef}
            url={url}
            playing={playing}
            volume={volume}
            muted={false}
            width="0px"
            height="0px"
            config={{
              youtube: {
                playerVars: {
                  autoplay: 1,
                  controls: 0,
                  modestbranding: 1,
                  origin: window.location.origin,
                  disableRemotePlayback: 1,
                },
              },
            }}
            onDuration={handleDuration} // Ensure this triggers on each video load
            onEnded={handleEnded} // Trigger when video ends
            onError={handlePlayerError}
          />
        )}
      </Suspense>
      
    </>
  );
};

export default Player;
