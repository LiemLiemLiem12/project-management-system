import {
  useGetAssetsByFolder,
  useGetAssetsByProject,
} from "@/services/storage.service";
import { useProjectStore } from "@/store/project.store";
import { Asset } from "@/types";
import React, { useMemo, useState } from "react";

interface FileStoringModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Thêm prop onSubmit để trả về ID của thư mục đích
  onSubmit?: (destinationFolderId: string | number | null) => void;
}

export const FileStoringModal = ({
  isOpen,
  onClose,
  onSubmit,
}: FileStoringModalProps) => {
  const currentProject = useProjectStore((s) => s.currentProject);
  const [breadcrumbs, setBreadcrumbs] = useState<Asset[]>([]);
  const [currentFolders, setCurrentFolders] = useState<
    Asset | null | undefined
  >();
  const [selectedFolderId, setSelectedFolderId] = useState<
    string | number | null
  >(null);

  const { data: initialAssets } = useGetAssetsByProject(
    currentProject?.id,
    breadcrumbs.length === 0,
  );

  const { data: currentFolderAssets } = useGetAssetsByFolder(
    currentFolders?.id || "",
  );

  const folders = useMemo(() => {
    if (currentFolders) {
      if (!currentFolderAssets?.children?.length) return [];
      return currentFolderAssets.children.filter(
        (asset: Asset) => asset.isFolder,
      );
    }
    if (!initialAssets?.length) return [];
    return initialAssets.filter((asset: Asset) => asset.isFolder);
  }, [initialAssets, currentFolders, currentFolderAssets]);

  if (!isOpen) return null;

  const handleFolderSelect = (folderId: string | number) => {
    setSelectedFolderId(folderId);
  };

  const handleFolderDoubleClick = (folder: Asset) => {
    setBreadcrumbs([...breadcrumbs, folder]);
    setCurrentFolders(folder);
    setSelectedFolderId(null);
  };

  const handleBreadcrumbClick = (index: any) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    setCurrentFolders(newBreadcrumbs[newBreadcrumbs.length - 1]);
    setSelectedFolderId(null);

    if (index === 0) {
      setCurrentFolders(null);
    }
  };

  // Xử lý khi bấm nút "Lưu tại đây"
  const handleSubmit = () => {
    if (onSubmit) {
      const targetFolderId = selectedFolderId || currentFolders?.id || null;
      onSubmit(targetFolderId);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 transition-opacity"
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
          setSelectedFolderId(null);
        }}
        className="w-full max-w-6xl bg-[#f8fafd] rounded-2xl shadow-xl overflow-hidden flex flex-col h-[80vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
          <div className="flex items-center gap-1 overflow-x-auto text-lg font-normal">
            {/* Breadcrumbs render... (Giữ nguyên như cũ) */}
            {breadcrumbs.length === 0 ? (
              <button className="px-3 py-1.5 rounded-full transition-colors whitespace-nowrap text-gray-800 bg-gray-100 font-medium">
                Home
              </button>
            ) : (
              <button
                onClick={() => handleBreadcrumbClick(0)}
                className="px-3 py-1.5 rounded-full transition-colors whitespace-nowrap text-gray-600 hover:bg-gray-100"
              >
                Home
              </button>
            )}

            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.id}>
                <span className="text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <button
                  onClick={() => handleBreadcrumbClick(index + 1)}
                  className={`px-3 py-1.5 rounded-full transition-colors whitespace-nowrap ${
                    index === breadcrumbs.length - 1
                      ? "text-gray-800 bg-gray-100 font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {crumb.name}
                </button>
              </React.Fragment>
            ))}
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {folders && folders.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {folders.map((folder: Asset) => {
                const isSelected = selectedFolderId === folder.id;
                return (
                  <div
                    key={folder.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFolderSelect(folder.id);
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      handleFolderDoubleClick(folder);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all border ${
                      isSelected
                        ? "bg-blue-100 border-blue-400 shadow-sm"
                        : "bg-[#e9eef6] border-transparent hover:bg-[#dfe4ec]"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6 text-[#F4B400] shrink-0"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-800 truncate select-none">
                      {folder.name}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <p>This folder is empty.</p>
            </div>
          )}
        </div>

        {/* --- FOOTER THÊM MỚI --- */}
        {onSubmit && (
          <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-end gap-3 rounded-b-2xl">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg  transition-colors`}
            >
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
