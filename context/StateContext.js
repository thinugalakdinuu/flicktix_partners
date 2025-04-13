// context/StateContext.js

import React, { createContext, useState, useContext } from "react";

const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // State for sidebar

  return (
    <StateContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
