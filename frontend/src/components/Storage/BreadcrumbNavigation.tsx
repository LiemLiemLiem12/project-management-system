"use client";

import { Asset } from "@/types";
import { useRouter } from "next/navigation";

interface BreadcrumbNavigationProps {
  projectId: string;
  currentFolder: Asset | null;
}

export default function BreadcrumbNavigation({
  projectId,
  currentFolder,
}: BreadcrumbNavigationProps) {
  const router = useRouter();

  const breadcrumbs: { id: string; name: string }[] = [];

  let current = currentFolder;
  while (current) {
    breadcrumbs.unshift({ id: current.id, name: current.name });
    current = current.parent || null;
  }

  const handleNavigate = (folderId: string | null) => {
    if (folderId === null) {
      router.push(`/project/${projectId}/storage`);
    } else {
      router.push(`/project/${projectId}/storage/folder/${folderId}`);
    }
  };

  return (
    <div className="flex items-center gap-2 mb-5 text-sm">
      <button
        onClick={() => handleNavigate(null)}
        className="flex items-center gap-1 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
        title="Back to Project Storage"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        <span>Storage</span>
      </button>

      {/* Breadcrumb items */}
      {breadcrumbs.map((item, index) => (
        <div key={item.id} className="flex items-center gap-2">
          <span className="text-gray-400">/</span>
          <button
            onClick={() => handleNavigate(item.id)}
            className="px-2 py-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900 truncate max-w-[150px]"
            title={item.name}
          >
            {item.name}
          </button>
        </div>
      ))}
    </div>
  );
}
