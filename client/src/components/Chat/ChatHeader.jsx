import { useState } from "react";
import Avatar from "../common/Avatar";
import { MdCall } from "react-icons/md";
import { IoVideocam } from "react-icons/io5";
import { BsThreeDotsVertical } from "react-icons/bs";
import { BiSearchAlt2 } from "react-icons/bi";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import ContextMenu from "../common/ContextMenu";

function ChatHeader() {
  const { state, dispatch } = useStateProvider(); // Access the full state
  const { currentChatUser, onlineUsers } = state; // Extract currentChatUser from state

  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);
  const [contextMenuCordinates, setContextMenuCordinates] = useState({
    x: 0,
    y: 0,
  });

  const showContextMenu = (e) => {
    e.preventDefault();
    setContextMenuCordinates({
      x: e.pageX - 50,
      y: e.pageY + 10,
    });
    setIsContextMenuVisible(true);
  };

  const ContextMenuOptions = [
    {
      name: "Exit",
      callback: async () => {
        dispatch({ type: reducerCases.SET_EXIT_CHAT });
      },
    },
  ];

  const handleVoiceCall = () => {
    dispatch({
      type: reducerCases.SET_VOICE_CALL,
      voiceCall: {
        ...currentChatUser,
        type: "out-going",
        callType: "voice",
        roomId: Date.now(),
      },
    });
  };

  const handleVideoCall = () => {
    dispatch({
      type: reducerCases.SET_VIDEO_CALL,
      videoCall: {
        ...currentChatUser,
        type: "out-going",
        callType: "video",
        roomId: Date.now(),
      },
    });
  };

  return (
    <div className="h-16 px-4 py-3 flex justify-between items-center bg-panel-header-background shadow-md z-50">
      {/* Left Side: Avatar and Status */}
      <div className="flex items-center gap-4">
        <Avatar type="sm" image={currentChatUser?.profilePicture} />
        <div className="flex flex-col">
          <span className="text-primary-strong flex items-center gap-2">
            {currentChatUser?.name}
            <span
              className={`h-2 w-2 rounded-full ${
                onlineUsers.includes(currentChatUser.id)
                  ? "bg-green-500"
                  : "bg-gray-400"
              }`}
            ></span>
          </span>
          <span
            className={`text-sm ${
              onlineUsers.includes(currentChatUser.id)
                ? "text-green-500"
                : "text-gray-400"
            }`}
          >
            {onlineUsers.includes(currentChatUser.id) ? "Online" : "Offline"}
          </span>
        </div>
      </div>

      {/* Right Side: Icons */}
      <div className="flex gap-4 items-center">
        <MdCall
          className="text-panel-header-icon cursor-pointer text-xl hover:text-primary-strong"
          onClick={handleVoiceCall}
        />
        <IoVideocam
          className="text-panel-header-icon cursor-pointer text-xl hover:text-primary-strong"
          onClick={handleVideoCall}
        />
        <BiSearchAlt2
          className="text-panel-header-icon cursor-pointer text-xl hover:text-primary-strong"
          onClick={() => dispatch({ type: reducerCases.SET_MESSAGE_SEARCH })}
        />
        <BsThreeDotsVertical
          className="text-panel-header-icon cursor-pointer text-xl hover:text-primary-strong"
          onClick={(e) => showContextMenu(e)}
          id="context-opener"
        />
        {/* ContextMenu */}
        {isContextMenuVisible && (
          <ContextMenu
            options={ContextMenuOptions}
            cordinates={contextMenuCordinates}
            contextMenu={isContextMenuVisible}
            setContextMenu={setIsContextMenuVisible}
          />
        )}
      </div>
    </div>
  );
}

export default ChatHeader;
