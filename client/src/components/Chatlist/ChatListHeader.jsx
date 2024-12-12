import React, { useState } from "react";
import Avatar from "../common/Avatar";
import { useStateProvider } from "@/context/StateContext";
import { BsFillChatLeftTextFill, BsThreeDotsVertical } from "react-icons/bs";
import { reducerCases } from "@/context/constants";
import ContextMenu from "../common/ContextMenu";
import { useRouter } from "next/router";

function ChatListHeader() {
  const { state, dispatch } = useStateProvider();
  const { userInfo } = state;

  const router = useRouter();
  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);
  const [contextMenuCordinates, setContextMenuCordinates] = useState({
    x: 0,
    y: 0,
  });

  const showContextMenu = (e) => {
    e.preventDefault();
    setContextMenuCordinates({
      x: e.pageX - 30,
      y: e.pageY + 35,
    });
    setIsContextMenuVisible(true);
  };

  const ContextMenuOptions = [
    {
      name: "Logout",
      callback: async () => {
        setIsContextMenuVisible(false);
        router.push("/logout");
      },
    },
  ];

  const handleAllContactsPage = () => {
    dispatch({ type: reducerCases.SET_ALL_CONTACTS_PAGE });
  };

  return (
    <div className="h-16 px-4 py-3 flex justify-between items-center bg-panel-header-background shadow-md z-10">
      <div className="cursor-pointer">
        <Avatar type="sm" image={userInfo?.profileImage} />
      </div>
      <div className="flex gap-6 items-center">
        <BsFillChatLeftTextFill
          className="text-panel-header-icon cursor-pointer text-xl hover:text-primary-strong"
          title="New Chat"
          onClick={handleAllContactsPage}
        />
        <>
          <BsThreeDotsVertical
            className="text-panel-header-icon cursor-pointer text-xl hover:text-primary-strong"
            title="Menu"
            onClick={(e) => showContextMenu(e)}
            id="context-opener"
          />
          {isContextMenuVisible && (
            <ContextMenu
              options={ContextMenuOptions}
              cordinates={contextMenuCordinates}
              contextMenu={isContextMenuVisible}
              setContextMenu={setIsContextMenuVisible}
            />
          )}
        </>
      </div>
    </div>
  );
}

export default ChatListHeader;
