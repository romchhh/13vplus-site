"use client";

import { createContext, useContext, useState } from "react";
import { ReactNode } from "react";

interface ContextType {
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isBasketOpen: boolean;
  setIsBasketOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isSeasonOpen: boolean;
  setIsSeasonOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isSearchOpen: boolean;
  setIsSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppContext = createContext<ContextType>({
  isSidebarOpen: false,
  setIsSidebarOpen: () => {},
  isBasketOpen: false,
  setIsBasketOpen: () => {},
  isSeasonOpen: false,
  setIsSeasonOpen: () => {},
  isSearchOpen: false,
  setIsSearchOpen: () => {},
});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBasketOpen, setIsBasketOpen] = useState(false);
  const [isSeasonOpen, setIsSeasonOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <AppContext.Provider
      value={{
        isSidebarOpen,
        setIsSidebarOpen,
        isBasketOpen,
        setIsBasketOpen,
        isSeasonOpen,
        setIsSeasonOpen,
        isSearchOpen,
        setIsSearchOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Custom hook for easier access
export const useAppContext = () => useContext(AppContext);
