import React, { useEffect, useRef } from "react";

function ContextMenu({ options, cordinates, contextMenu, setContextMenu }) {
  const contextMenuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (event.target.id !== "context-opener") {
        if (
          contextMenuRef.current &&
          !contextMenuRef.current.contains(event.target)
        ) {
          setContextMenu(false);
        }
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [setContextMenu]);

  useEffect(() => {
    const adjustPosition = () => {
      if (contextMenuRef.current) {
        const { innerWidth, innerHeight } = window;
        const { offsetWidth, offsetHeight } = contextMenuRef.current;

        let newTop = cordinates.y;
        let newLeft = cordinates.x;

        if (cordinates.y + offsetHeight > innerHeight) {
          newTop = innerHeight - offsetHeight - 10;
        }
        if (cordinates.x + offsetWidth > innerWidth) {
          newLeft = innerWidth - offsetWidth - 10;
        }

        contextMenuRef.current.style.top = `${newTop}px`;
        contextMenuRef.current.style.left = `${newLeft}px`;
      }
    };

    adjustPosition();
  }, [cordinates]);

  const handleClick = (e, callback) => {
    e.stopPropagation();
    setContextMenu(false);
    callback();
  };

  return (
    contextMenu && (
      <div
        className="bg-gray-800 fixed py-2 z-[100] rounded-md shadow-lg"
        ref={contextMenuRef}
        style={{
          top: cordinates.y,
          left: cordinates.x,
          position: "absolute",
        }}
      >
        <ul>
          {options.map(({ name, callback }) => (
            <li
              key={name}
              onClick={(e) => handleClick(e, callback)}
              className="px-5 py-2 cursor-pointer hover:bg-gray-700 text-white"
            >
              {name}
            </li>
          ))}
        </ul>
      </div>
    )
  );
}

export default ContextMenu;
