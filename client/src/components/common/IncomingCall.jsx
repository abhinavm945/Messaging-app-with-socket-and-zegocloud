import { reducerCases } from "@/context/constants";
import { useStateProvider } from "@/context/StateContext";
import Image from "next/image";
import React from "react";

function IncomingCall() {
  const { state, dispatch } = useStateProvider();
  const { incomingVoiceCall, socket } = state;

  const acceptCall = () => {
    dispatch({
      type: reducerCases.SET_VOICE_CALL,
      voiceCall: { ...incomingVoiceCall, type: "in-coming" },
    });

    socket.current.emit("accept-incoming-call", { id: incomingVoiceCall.id });

    dispatch({
      type: reducerCases.SET_INCOMING_VOICE_CALL,
      incomingVoiceCall: undefined,
    });
  };

  const rejectCall = () => {
    socket.current.emit("reject-voice-call", { to: incomingVoiceCall.id });
    dispatch({ type: reducerCases.END_CALL });
  };

  return (
    <div className="h-24 w-80 fixed bottom-8 mb-0 right-0 z-50 rounded-sm flex gap-5 items-center justify-start p-4 bg-conversation-panel-background text-white drop-shadow-2xl border-icon-green border-2 py-14">
      <div>
        {incomingVoiceCall.profilePicture ? (
          <Image
            src={incomingVoiceCall.profilePicture}
            alt="avatar"
            width={70}
            height={70}
            className="rounded-full"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-500 rounded-full flex items-center justify-center">
            {/* Display a placeholder icon or text */}
            <span className="text-white text-sm">N/A</span>
          </div>
        )}
      </div>
      <div>
        <div>{incomingVoiceCall.name || "Unknown User"}</div>
        <div className="text-xs">Incoming Voice Call</div>
      </div>
      <div className="flex gap-2 mt-2">
        <button
          className="bg-red-500 p-1 px-3 text-sm rounded-full"
          onClick={rejectCall}
        >
          Reject
        </button>
        <button
          className="bg-green-500 p-1 px-3 text-sm rounded-full"
          onClick={acceptCall}
        >
          Accept
        </button>
      </div>
    </div>
  );
}

export default IncomingCall;
