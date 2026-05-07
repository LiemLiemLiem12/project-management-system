"use client";

import { useState, useMemo } from "react";
import { Asset } from "@/types";
import ProjectStorageSection from "@/components/Storage/ProjectStorageSection";
import FileDetailPanel from "@/components/Storage/FileDetailPanel";
import StorageContextMenu from "@/components/Storage/StorageContextMenu";
import FilePreviewModal from "@/components/Storage/FilePreviewModal";
import BreadcrumbNavigation from "@/components/Storage/BreadcrumbNavigation";
import { useParams, useRouter } from "next/navigation";
import { useGetAssetsByFolder } from "@/services/storage.service";
import UploadProgress from "@/components/Storage/UploadProgress";
import PermissionGrantModal from "@/components/Storage/PermissionGrantModal";
import { AxiosError } from "axios";

export default function FolderPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.projectId as string;
  const folderId = params?.folderId as string;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [contextMenuAsset, setContextMenuAsset] = useState<Asset | null>(null);
  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null);
  const [openDetailSidebar, setOpenDetailSidebar] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [openPermissionModal, setOpenPermissionModal] =
    useState<boolean>(false);

  // Fetch folder assets
  const {
    data: dataFolders,
    isLoading,
    isError,
    error,
  } = useGetAssetsByFolder(folderId);

  // Get current folder info (first item has parent info)
  const currentFolder = useMemo(() => {
    if (!dataFolders) return;
    return dataFolders?.folderInfo;
  }, [dataFolders]);

  const folderAssets = useMemo(() => {
    if (!dataFolders || dataFolders?.children?.length === 0) return [];
    return dataFolders?.children;
  }, [dataFolders]);

  const selectedAsset = useMemo(() => {
    if (!selectedId) return null;
    return folderAssets.find((a: any) => a.id === selectedId) || null;
  }, [selectedId, folderAssets]);

  const handleSelect = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  const handleContextMenu = (e: React.MouseEvent, file: Asset | null) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });

    if (file) {
      setContextMenuAsset(file);
      setSelectedId(file.id);
    } else {
      setContextMenuAsset(null);
      setSelectedId(null);
    }
  };

  const handleDoubleClick = (file: Asset) => {
    if (file.isFolder) {
      // Navigate into nested folder
      router.push(`/project/${projectId}/storage/folder/${file.id}`);
    } else {
      if (file.storageUrl) {
        window.open(file.storageUrl, "_blank", "noopener,noreferrer");
      }
    }
  };

  if (isError) {
    return (
      <div className="relative flex h-screen bg-gray-50 ">
        <div className="flex items-center justify-center h-full w-full">
          <div className="text-gray-500">
            {error instanceof AxiosError
              ? error.response?.data.message
              : "Unknow Error"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen bg-gray-50 ">
      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 ">
        <div className="flex-1 ">
          <div className="p-5 h-full sm:p-7 max-w-none overflow-y-auto">
            {/* Breadcrumb Navigation */}
            {currentFolder && (
              <BreadcrumbNavigation
                projectId={projectId}
                currentFolder={currentFolder}
              />
            )}

            {/* Folder contents section */}
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading folder contents...</div>
              </div>
            ) : folderAssets.length === 0 ? (
              <div
                onContextMenu={(e) => handleContextMenu(e, null)}
                className="flex items-center justify-center h-64"
              >
                <div className="text-gray-500">This folder is empty</div>
              </div>
            ) : (
              <ProjectStorageSection
                selectedId={selectedId}
                onSelect={handleSelect}
                onDoubleClick={handleDoubleClick}
                onContextMenu={handleContextMenu}
                files={folderAssets}
                isLoadingExternal={isLoading}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Detail panel ── */}
      {selectedAsset && openDetailSidebar && (
        <>
          {/* Mobile overlay backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => {
              setSelectedId(null);
              setOpenDetailSidebar(false);
            }}
          />
          {/* Panel */}
          <div className="fixed right-0 top-0 bottom-0 z-50 w-[300px] sm:w-[320px] bg-white shadow-2xl border-l border-gray-200 overflow-hidden">
            <FileDetailPanel
              file={selectedAsset}
              onClose={() => {
                setSelectedId(null);
              }}
              setOpenPermissionModal={setOpenPermissionModal}
            />
          </div>
        </>
      )}

      {/* ── Context Menu ── */}
      <StorageContextMenu
        setOpenDetailSidebar={setOpenDetailSidebar}
        position={contextMenu}
        selectedAsset={contextMenuAsset}
        projectId={projectId}
        parentId={currentFolder?.id}
        onClose={() => {
          setContextMenu(null);
          setContextMenuAsset(null);
        }}
        onCreateFolder={() => {
          // Context menu will handle this via mutation
        }}
        onRename={(asset: Asset) => {
          // Context menu will handle this
        }}
        setIsUploading={setIsUploading}
        setUploadProgress={setUploadProgress}
      />

      <FilePreviewModal
        asset={previewAsset}
        onClose={() => setPreviewAsset(null)}
      />

      <PermissionGrantModal
        file={selectedAsset}
        isOpen={openPermissionModal}
        onClose={() => setOpenPermissionModal(false)}
      />

      <UploadProgress isUploading={isUploading} progress={uploadProgress} />
    </div>
  );
}
