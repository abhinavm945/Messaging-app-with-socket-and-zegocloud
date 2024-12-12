import { reducerCases } from "@/context/constants";
import { useStateProvider } from "@/context/StateContext";
import Image from "next/image";
import React from "react";

function IncomingVideoCall() {
  const { state, dispatch } = useStateProvider();
  const { incomingVideoCall, socket } = state;

  const acceptCall = () => {
    dispatch({
      type: reducerCases.SET_VIDEO_CALL,
      videoCall: { ...incomingVideoCall, type: "in-coming" },
    });

    socket.current.emit("accept-incoming-call", { id: incomingVideoCall.id });

    dispatch({
      type: reducerCases.SET_INCOMING_VIDEO_CALL,
      incomingVideoCall: undefined,
    });
  };

  const rejectCall = () => {
    socket.current.emit("reject-video-call", { to: incomingVideoCall.id });
    dispatch({ type: reducerCases.END_CALL });
  };

  return (
    <div className="h-24 w-80 fixed bottom-8 mb-0 right-0 z-50 rounded-sm flex gap-5 items-center justify-start p-4 bg-conversation-panel-background text-white drop-shadow-2xl border-icon-green border-2 py-14">
      <div>
        {incomingVideoCall.profilePicture ? (
          <Image
            src={incomingVideoCall.profilePicture}
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
        <div>{incomingVideoCall.name || "Unknown User"}</div>
        <div className="text-xs">Incoming Video Call</div>
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

export default IncomingVideoCall;
