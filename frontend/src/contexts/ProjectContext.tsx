"use client";

import { createContext } from "react";
import { useState } from "react";

type ProjectContextType = {
  isOpenSidebar: boolean;
  setisOpenSidebar: (value: boolean) => void;
};

export const ProjectContext = createContext<ProjectContextType | null>(null);

export default function ProjectProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpenSidebar, setisOpenSidebar]: [boolean, (value: boolean) => void] =
    useState(false);
  return (
    <ProjectContext.Provider value={{ isOpenSidebar, setisOpenSidebar }}>
      {children}
    </ProjectContext.Provider>
  );
}
