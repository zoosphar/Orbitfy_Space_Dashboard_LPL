import { useState } from "react";
import LogoutIcon from "../static/img/logoutIcon.png";
import { FaTimes } from "react-icons/fa";

function UserMenu({ isVisible, handleLogout, setIsVisible }) {
  return (
    <div
      className={`absolute h-[100vh] top-0 right-0 z-20 bg-[#2B2D33] w-48 flex flex-col items-center justify-start p-2 rounded-tl-md rounded-bl-md ${
        !isVisible && "hidden"
      }`}
    >
      <div className="flex w-full justify-end items-end p-1">
        <FaTimes
          className="text-white cursor-pointer"
          onClick={() => setIsVisible(false)}
        />
      </div>
      <div
        className="flex justify-center items-center gap-2 cursor-pointer"
        onClick={handleLogout}
      >
        <img src={LogoutIcon} className="h-4" />
        <h5 className="text-[#AAAAAA] text-md">Logout</h5>
      </div>
    </div>
  );
}

export default UserMenu;
