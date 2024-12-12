import { reducerCases } from "@/context/constants";
import { useStateProvider } from "@/context/StateContext";
import { ADD_AUDIO_MESSAGE_ROUTE } from "@/utils/ApiRoutes";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import {
  FaMicrophone,
  FaPauseCircle,
  FaPlay,
  FaStop,
  FaTrash,
} from "react-icons/fa";
import { MdSend } from "react-icons/md";
import WaveSurfer from "wavesurfer.js";

function CaptureAudio({ hide }) {
  const { state, dispatch } = useStateProvider();
  const { userInfo, currentChatUser, socket } = state;

  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [waveform, setWaveform] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [renderedAudio, setRenderedAudio] = useState(null);

  const audioRef = useRef(null);
  const mediaRecorderRed = useRef(null);
  const waveFormref = useRef(null);

  // Timer for recording duration
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration((prevDuration) => prevDuration + 1);
      }, 1000);
    }
    return () => {
      clearInterval(interval);
    };
  }, [isRecording]);

  // Initialize WaveSurfer
  useEffect(() => {
    const wavesurfer = WaveSurfer.create({
      container: waveFormref.current,
      waveColor: "#ccc",
      progressColor: "#4a9eff",
      cursorColor: "#7ae3c3",
      height: 40,
      barWidth: 2,
    });
    setWaveform(wavesurfer);
    wavesurfer.on("finish", () => {
      setIsPlaying(false);
    });
    return () => {
      wavesurfer.destroy();
    };
  }, []);

  // Start recording when the waveform is ready
  useEffect(() => {
    if (waveform) handleStartRecording();
  }, [waveform]);

  // Start recording and update the waveform in real-time
  const handleStartRecording = () => {
    setRecordingDuration(0);
    setCurrentPlaybackTime(0);
    setIsRecording(true);
    setTotalDuration(0);
    setRecordedAudio(null);

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRed.current = mediaRecorder;
        audioRef.current.srcObject = stream;

        const chunks = [];
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
          const audioURL = URL.createObjectURL(blob);
          const audio = new Audio(audioURL);
          setRecordedAudio(audio);

          waveform.load(audioURL); // Load the waveform after the recording is complete
        };

        mediaRecorder.start();
      })
      .catch((error) => {
        console.log("Error accessing microphone:", error);
      });
  };

  // Stop the recording and update the waveform
  const handleStopRecording = () => {
    if (mediaRecorderRed.current && isRecording) {
      mediaRecorderRed.current.stop();
      setIsRecording(false);
      waveform.stop();
    }

    const audioChunks = [];
    mediaRecorderRed.current.addEventListener("dataavailable", (event) => {
      audioChunks.push(event.data);
    });

    mediaRecorderRed.current.addEventListener("stop", () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/mp3" });
      const audioFile = new File([audioBlob], "recording.mp3");
      setRenderedAudio(audioFile);
    });
  };

  // Update playback time
  useEffect(() => {
    if (recordedAudio) {
      const updatePlaybackTime = () => {
        setCurrentPlaybackTime(recordedAudio.currentTime);
      };
      recordedAudio.addEventListener("timeupdate", updatePlaybackTime);
      return () => {
        recordedAudio.removeEventListener("timeupdate", updatePlaybackTime);
      };
    }
  }, [recordedAudio]);

  // Play the recording
  const handlePlayRecording = () => {
    if (renderedAudio) {
      waveform.stop();
      waveform.play();
      recordedAudio.play();
      setIsPlaying(true);
    }
  };

  // Pause the recording
  const handlePauseRecording = () => {
    waveform.stop();
    recordedAudio.pause();
    setIsPlaying(false);
  };

  // Send recording to backend
  const sendRecording = async () => {
    if (!renderedAudio) {
      console.error("No audio file available to send");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("audio", renderedAudio);

      const response = await axios.post(ADD_AUDIO_MESSAGE_ROUTE, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        params: {
          from: userInfo.id,
          to: currentChatUser.id,
        },
      });

      if (response.status === 201) {
        socket.current.emit("send-msg", {
          to: currentChatUser?.id,
          from: userInfo?.id,
          message: response.data.message,
        });

        dispatch({
          type: reducerCases.ADD_MESSAGE,
          newMessage: {
            ...response.data.message,
          },
          fromSelf: true,
        });

        // Reset the state after sending the message
        resetState();

        // Close the CaptureAudio component and show the message bar
        hide(); // This will hide the audio recorder and return to the message bar
      }
    } catch (err) {
      console.log(err);
    }
  };

  // Function to reset the component state
  const resetState = () => {
    setIsRecording(false);
    setRecordedAudio(null);
    setRenderedAudio(null);
    setIsPlaying(false);
    setRecordingDuration(0);
    setCurrentPlaybackTime(0);
    setTotalDuration(0);
    if (waveform) {
      waveform.stop();
      waveform.clear();
    }
  };

  // Format time as mm:ss
  const formatTime = (time) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Handle key press for sending message on "Enter"
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendRecording();
    }
  };

  // Add event listener for "Enter" key
  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [renderedAudio]);

  return (
    <div className="flex text-2xl w-full justify-end items-center">
      <div className="pt-1">
        <FaTrash className="text-panel-header-icon" onClick={() => hide()} />
      </div>
      <div className="mx-4 py-2 px-4 text-white text-lg flex gap-3 justify-center items-center bg-search-input-container-background rounded-full drop-shadow-lg">
        {isRecording ? (
          <div className="text-red-500 animate-pulse w-60 text-center">
            Recording <span>{recordingDuration}</span>
          </div>
        ) : (
          <div>
            {recordedAudio && (
              <>
                {!isPlaying ? (
                  <FaPlay onClick={handlePlayRecording} />
                ) : (
                  <FaPauseCircle onClick={handlePauseRecording} />
                )}
              </>
            )}
          </div>
        )}
        <div className="w-60" ref={waveFormref} hidden={isRecording} />
        {recordedAudio && isPlaying && (
          <span>{formatTime(currentPlaybackTime)}</span>
        )}
        {recordedAudio && !isPlaying && (
          <span>{formatTime(totalDuration)}</span>
        )}
        <audio ref={audioRef} hidden />
      </div>

      <div className="mr-4">
        {!isRecording ? (
          <FaMicrophone
            className="text-red-500"
            onClick={handleStartRecording}
          />
        ) : (
          <FaStop className="text-red-500" onClick={handleStopRecording} />
        )}
      </div>
      <MdSend
        className="text-panel-header-icon cursor-pointer mr-4"
        title="Send"
        onClick={sendRecording}
      />
    </div>
  );
}

export default CaptureAudio;
