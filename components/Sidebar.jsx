import React, { useState } from "react";
import { useRouter } from "next/router";
import { useStateContext } from "@/context/StateContext";

import { IoHomeOutline, IoCloseCircleOutline, IoTicketOutline, IoFilmOutline } from "react-icons/io5";
import { Button } from "./ui/button";

const Sidebar = ({ onClose }) => {
  const router = useRouter();
  const pathName = router.pathname;

  const { sidebarOpen, setSidebarOpen } = useStateContext();

  const getItemClass = (path) => {
    return pathName === path
      ? "bg-gray-200 w-full h-8 px-4 gap-2 flex flex-row items-center rounded-md cursor-pointer"
      : "bg-[#F4F6F5] hover:bg-gray-200 w-full h-8 px-4 gap-2 flex flex-row items-center rounded-md cursor-pointer"; // Inactive link styles
  };
  const getSubItemClass = (path) => {
    return pathName === path
      ? "bg-gray-200 w-full h-7 px-4 gap-2 flex flex-row items-center rounded-md cursor-pointer"
      : "bg-[#F4F6F5] hover:bg-gray-200 w-full h-7 px-4 gap-2 flex flex-row items-center rounded-md cursor-pointer"; // Inactive link styles
  };

  const navigateTo = (path) => {
    router.push(`/dashboard${path}`);
  };

  const onToggleSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div
    className={`fixed z-50 top-0 left-0 h-full w-full sm:w-6/10 md:w-3/10 lg:w-1/5 p-4 px-3 bg-[#F4F6F5] border-r border-gray-200 transition-transform duration-300 ease-in-out transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
    >
      <div className="w-full h-1/10 flex flex-row place-content-between">
        <div className="h-full bg-gray-200 rounded-md">image</div>
        <div className="block md:hidden h-full">
          <Button
            className="block md:hidden h-full bg-[#F4F6F5] shadow-none text-black hover:bg-[#F4F6F5]"
            onClick={onToggleSidebar}
          >
            <div className="w-fit h-fit rounded-full cursor-pointer">
              <IoCloseCircleOutline size={30} />
            </div>
          </Button>
        </div>
      </div>
      <hr className="border border-gray-200 mt-2" />
      <div className="w-full h-9/10 py-2 space-y-3">
        <div
          className={`${getItemClass("/dashboard")}`}
          onClick={() => navigateTo("/")}
        >
          <IoHomeOutline fontWeight={600} />
          <p className="text-sm ppns-medium">Home</p>
        </div>
        <div
          className={`${getItemClass("/dashboard/movies")}`}
          onClick={() => navigateTo("/movies")}
        >
          <IoFilmOutline fontWeight={600} />
          <p className="text-sm ppns-medium">Movies</p>
        </div>
        <div className="w-full min-h-20 mt-[-10px] gap-2 flex flex-row items-start">
          <div className="w-1/7 h-20 border-r border-[#gray-200]"></div>
          <div className="w-6/7 min-h-20 pt-[10px] space-y-1">
            <div
              className={`${getSubItemClass("/dashboard/movies")}`}
              onClick={() => navigateTo("/movies")}
            >
              <p className="text-sm ppns-regular">Movies</p>
            </div>
            <div
              className={`${getSubItemClass("/dashboard/movies/add")}`}
              onClick={() => navigateTo("/movies/add")}
            >
              <p className="text-sm ppns-regular">Add New</p>
            </div>
          </div>
        </div>
        <div
          className={`${getItemClass("/dashboard/tickets")}`}
          onClick={() => navigateTo("/tickets")}
        >
          <IoTicketOutline fontWeight={600} />
          <p className="text-sm ppns-medium">Tickets</p>
        </div>
        <div className="w-full min-h-20 mt-[-10px] gap-2 flex flex-row items-start">
          <div className="w-1/7 h-27 border-r border-[#gray-200]"></div>
          <div className="w-6/7 min-h-20 pt-[10px] space-y-1">
            <div
              className={`${getSubItemClass("/dashboard/tickets/reserved")}`}
              onClick={() => navigateTo("/tickets/reserved")}
            >
              <p className="text-sm ppns-regular">Reserved</p>
            </div>
            <div
              className={`${getSubItemClass("/dashboard/tickets/redeemed")}`}
              onClick={() => navigateTo("/tickets/redeemed")}
            >
              <p className="text-sm ppns-regular">Redeemed</p>
            </div>
            <div
              className={`${getSubItemClass("/dashboard/tickets/scan")}`}
              onClick={() => navigateTo("/tickets/scan")}
            >
              <p className="text-sm ppns-regular">Scan now</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
