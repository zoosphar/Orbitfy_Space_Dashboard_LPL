import { useEffect, useState } from "react";
import LPLIcon from "../static/icons/lpl_logo.png";
import { userPool } from "../App";
import jwtDecode from "jwt-decode";
import UserMenu from "./UserMenu.component";
function Header({ handleLogout }) {
  const [userEmail, setUserEmail] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const idToken = localStorage.getItem("idToken");
    if (!idToken) {
      setUserEmail("");
      return;
    }
    const idTokenData = jwtDecode(idToken);
    setUserEmail(idTokenData.email);
  }, []);
  return (
    <div className="bg-[#2B2D33] w-full flex justify-between items-center px-10 py-2 h-full">
      <img src={LPLIcon} className="h-20" />
      <h2 className="text-white text-2xl font-bold">
        Little Place Labs : AI in Space | Demo Dashboard
      </h2>
      <h4
        className="text-white text-lg cursor-pointer"
        onClick={() => setIsVisible(!isVisible)}
      >
        {userEmail}
      </h4>
      <UserMenu
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        handleLogout={handleLogout}
      />
    </div>
  );
}

export default Header;
