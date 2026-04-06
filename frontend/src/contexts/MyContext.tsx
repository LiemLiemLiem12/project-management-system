"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface MyContextProp {
  persist: boolean;
  setPersist: (value: boolean) => void;
}

export const MyContext = createContext<MyContextProp | undefined>(undefined);

export default function MyContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [persist, setPersist] = useState(false);

  useEffect(() => {
    const savedPersist = localStorage.getItem("persist");
    if (savedPersist !== null) {
      setPersist(JSON.parse(savedPersist));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("persist", JSON.stringify(persist));
  }, [persist]);

  return (
    <MyContext.Provider value={{ persist, setPersist }}>
      {children}
    </MyContext.Provider>
  );
}

export const useMyContext = () => {
  const context = useContext(MyContext);
  if (context === undefined) {
    throw new Error("useMyContext must be used within a MyProvider");
  }

  return context;
};
