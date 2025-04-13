import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { IoChevronForward, IoLogOutOutline, IoMenu } from "react-icons/io5";
import { Button } from "./ui/button";
import { useStateContext } from "@/context/StateContext";

const Navbar = () => {
  const router = useRouter();
  const pathName = router.pathname;
  const pathParts = pathName.split("/").filter(Boolean);

  const { setSidebarOpen } = useStateContext();

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    router.push("/login");
  };

  return (
    <div className="w-full h-[10vh] py-4 px-5 border-b border-gray-200 flex items-center justify-between">
      <div className="h-full flex items-center">
        <p className="flex flex-row text-sm gap-2">
          {pathParts.length === 0
            ? "Home"
            : pathParts.map((part, index) => (
                <React.Fragment key={index}>
                  <span className="capitalize">{part}</span>
                  {index < pathParts.length - 1 && (
                    <IoChevronForward className="mt-1" />
                  )}
                </React.Fragment>
              ))}
        </p>
      </div>

      <div className="flex items-center gap-4">
        {/* Sidebar Toggle Button for Small Screens */}
        <button
          className="md:hidden p-2"
          onClick={() => setSidebarOpen(true)} // Open Sidebar
        >
          <IoMenu size={30} />
        </button>

        {/* Logout Button */}
        <Button
          className="cursor-pointer bg-white hover:bg-gray-100 text-black shadow-none"
          onClick={handleLogout}
        >
          <IoLogOutOutline size={30} />
        </Button>
      </div>
    </div>
  );
};

export default Navbar;
