"use client";

import { useRef, useEffect, useState } from "react";
import { Asset } from "@/types";
import {
  useCreateFolder,
  useUpdateAsset,
  useDeleteAsset,
  useCreateAsset,
} from "@/services/storage.service";
import toast from "react-hot-toast";
import { Info } from "lucide-react";
import ConfirmModal from "../CustomModal/ConfirmModal";
import InputConfirmModal from "../CustomModal/InputConfirmModal";

interface StorageContextMenuProps {
  position: { x: number; y: number } | null;
  selectedAsset: Asset | null;
  projectId: string;
  onClose: () => void;
  onCreateFolder: () => void;
  onRename: (asset: Asset) => void;
  setOpenDetailSidebar: (bool: boolean) => void;
  setIsUploading: (bool: boolean) => void;
  setUploadProgress: (percent: number) => void;
}

export default function StorageContextMenu({
  position,
  selectedAsset,
  projectId,
  onClose,
  onCreateFolder,
  onRename,
  setOpenDetailSidebar,
  setIsUploading,
  setUploadProgress,
}: StorageContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [showRenameInput, setShowRenameInput] = useState(false);
  const [newName, setNewName] = useState(selectedAsset?.name || "");
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [openNewFolderModal, setOpenNewFolderModal] = useState<boolean>(false);

  const updateAsset = useUpdateAsset();
  const deleteAsset = useDeleteAsset();
  const createFolder = useCreateFolder();
  const createAsset = useCreateAsset();

  // Reset tên khi đổi sang file khác
  useEffect(() => {
    if (selectedAsset) {
      setNewName(selectedAsset.name);
      setShowRenameInput(false); // Reset trạng thái ô input
    }
  }, [selectedAsset]);

  // Click ra ngoài để đóng menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Quan trọng: Nếu Delete Modal đang mở, KHÔNG đóng context menu khi click ra ngoài
      if (openDeleteModal) return;

      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, openDeleteModal]); // Thêm openDeleteModal vào dependencies

  const handleRename = async () => {
    if (!selectedAsset || !newName.trim()) {
      toast.error("Please enter a valid name");
      return;
    }

    if (newName === selectedAsset.name) {
      setShowRenameInput(false);
      return;
    }

    updateAsset.mutate(
      {
        fileId: selectedAsset.id,
        payload: { name: newName },
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
    setShowRenameInput(false);
  };

  const handleDelete = async () => {
    if (!selectedAsset) return;

    deleteAsset.mutate(selectedAsset.id, {
      onSuccess: () => {
        onClose();
      },
    });

    setOpenDeleteModal(false);
    onClose();
  };

  const handleUploadFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files || files.length === 0) return;

      const formData = new FormData();
      formData.append("projectId", projectId);
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }

      setIsUploading(true);
      setUploadProgress(0);

      createAsset.mutate(
        {
          parentId: undefined,
          formData,
          onUploadProgress: (progressEvent: any) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total,
              );
              setUploadProgress(percentCompleted);
            }
          },
        },
        {
          onSuccess: () => {
            onClose();
            setTimeout(() => {
              setIsUploading(false);
            }, 1000);
          },

          onError: () => {
            setIsUploading(false);
            setUploadProgress(0);
          },
        },
      );
    };
    input.click();
    onClose();
  };

  const handleCreateFolder = (folderName: string | undefined) => {
    createFolder.mutate(
      {
        name: folderName,
        parentId: undefined,
        projectId,
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );

    setOpenNewFolderModal(false);
  };

  if (!position) return null;

  return (
    <>
      {/* Ẩn khối menu này khi openDeleteModal là true */}
      {!openDeleteModal && !openNewFolderModal && (
        <div
          ref={menuRef}
          className="fixed bg-white border border-gray-200 rounded-lg shadow-lg z-[200] py-1 min-w-[200px]"
          style={{
            top: `${position.y}px`,
            left: `${position.x}px`,
          }}
          onClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {!selectedAsset ? (
            <>
              <button
                onClick={() => setOpenNewFolderModal(true)}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                {/* SVG Icon */}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="text-gray-500"
                >
                  <path
                    d="M6 8H10M8 6V10"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                  <path
                    d="M2 4C2 2.9 2.9 2 4 2h4l2 2h4c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V4z"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                New Folder
              </button>

              <button
                onClick={handleUploadFile}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                {/* SVG Icon */}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="text-gray-500"
                >
                  <path
                    d="M8 2v8M4 6l4-4 4 4M2 14h12"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Upload File
              </button>
            </>
          ) : (
            <>
              {showRenameInput ? (
                <div className="px-4 py-2">
                  <input
                    autoFocus
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename();
                      if (e.key === "Escape") setShowRenameInput(false);
                    }}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="New name..."
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleRename}
                      disabled={updateAsset.isPending}
                      className="flex-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                      {updateAsset.isPending ? "..." : "Save"}
                    </button>
                    <button
                      onClick={() => setShowRenameInput(false)}
                      className="flex-1 px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowRenameInput(true)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  {/* SVG Icon */}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="text-gray-500"
                  >
                    <path
                      d="M11.5 2.5L13.5 0.5L15.5 2.5L13.5 4.5M12.5 3.5L3 13H1V11L11 2"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Rename
                </button>
              )}

              <button
                onClick={() => setOpenDeleteModal(true)} // Mở modal (tự động ẩn menu nhờ điều kiện ở trên)
                disabled={deleteAsset.isPending}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                {/* SVG Icon */}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="text-gray-500"
                >
                  <path
                    d="M2 4h12M6.5 7v5M9.5 7v5M3 4l1 10c0 1 .9 1.5 2 1.5h4c1.1 0 2-.5 2-1.5l1-10M6 4V2.5c0-.8.7-1.5 1.5-1.5h1c.8 0 1.5.7 1.5 1.5V4"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Delete
              </button>

              <button
                onClick={() => {
                  setOpenDetailSidebar(true);
                  onClose(); // Nên đóng context menu khi mở sidebar
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <Info size={16} />
                View Information
              </button>
            </>
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={openDeleteModal}
        onClose={() => {
          setOpenDeleteModal(false);
          onClose(); // Đóng hoàn toàn Context Menu nếu người dùng bấm Hủy (Cancel) trên Modal
        }}
        onConfirm={handleDelete}
        title="Delete permanently?"
        description={
          <>
            "{selectedAsset?.name}" will be deleted permanently. Do you want to
            cancel this action?
          </>
        }
        cancelText="Cancel"
        confirmText={
          deleteAsset.isPending ? "Deleting..." : "Delete permanently"
        }
        confirmColorClass="bg-[#b3261e] hover:bg-[#8c1d18] text-white"
      />

      <InputConfirmModal
        isOpen={openNewFolderModal}
        onClose={() => {
          setOpenNewFolderModal(false);
          onClose();
        }}
        onConfirm={handleCreateFolder}
        title="New Folder"
        cancelText="Cancel"
        confirmText={deleteAsset.isPending ? "Creating..." : "Create Folder"}
        confirmColorClass="bg-primary hover:bg-blue-800 text-white"
      />
    </>
  );
}
