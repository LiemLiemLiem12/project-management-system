"use client";

import { useState, useMemo } from "react";
import { Asset } from "@/types";
import StorageStats from "@/components/Storage/StorageStats";
import RecentFiles from "@/components/Storage/RecentFiles";
import ProjectStorageSection from "@/components/Storage/ProjectStorageSection";
import FileDetailPanel from "@/components/Storage/FileDetailPanel";
import StorageContextMenu from "@/components/Storage/StorageContextMenu";
import FilePreviewModal from "@/components/Storage/FilePreviewModal";
import { useParams } from "next/navigation";
import { useGetAssetsByProject } from "@/services/storage.service";
import UploadProgress from "@/components/Storage/UploadProgress";
import PermissionGrantModal from "@/components/Storage/PermissionGrantModal";

export default function StoragePage() {
  const params = useParams();
  const projectId = params?.projectId as string;

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

  // Fetch all assets
  const { data: allAssets = [] } = useGetAssetsByProject(projectId, true);

  const selectedAsset = useMemo(() => {
    if (!selectedId) return null;
    return allAssets.find((a) => a.id === selectedId) || null;
  }, [selectedId, allAssets]);

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
      // Navigate into folder or load folder contents
      // TODO: Implement folder navigation
      console.log("Opening folder:", file.id);
    } else {
      // Open file preview modal
      setPreviewAsset(file);
    }
  };

  return (
    <div className="relative flex h-screen bg-gray-50 overflow-hidden">
      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 sm:p-7 max-w-none">
            <StorageStats />
            <RecentFiles />
            <ProjectStorageSection
              selectedId={selectedId}
              onSelect={handleSelect}
              onDoubleClick={handleDoubleClick}
              onContextMenu={handleContextMenu}
            />
          </div>
        </div>
      </div>

      {/* ── Detail panel ── */}
      {selectedAsset && openDetailSidebar && (
        <>
          {/* Mobile overlay backdrop */}
          <div
            className="absolute inset-0 bg-black/20 z-40"
            onClick={() => {
              setSelectedId(null);
              setOpenDetailSidebar(false);
            }}
          />
          {/* Panel */}
          <div className="absolute right-0 top-0 bottom-0 z-50 w-[300px] sm:w-[320px] bg-white shadow-2xl border-l border-gray-200 overflow-hidden">
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
