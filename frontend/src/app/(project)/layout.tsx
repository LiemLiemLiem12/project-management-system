import FloatingBackground from "@/components/FloatingBackground";
import ProjectNavbar from "@/components/Navbar/ProjectNavbar";
import Sidebar from "@/components/Sidebar";
import ProjectProvider from "@/contexts/ProjectContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen w-full overflow-hidden flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Navbar */}
        <div className="h-14 bg-white z-20">
          <ProjectNavbar />
        </div>

        {/* Content */}
        <div className="flex-1 mt-5 min-h-0 overflow-auto bg-gray-50">
          {children}
        </div>
      </div>
    </div>
  );
}
