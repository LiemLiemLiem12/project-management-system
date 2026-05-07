"use client";
import { useState, useRef } from "react";
import {
  Paperclip,
  FileText,
  Image as ImageIcon,
  Film,
  Archive,
  Lock,
  X,
} from "lucide-react";
import { FileStoringModal } from "./FileStoringModal";
import {
  useGetAssetsByTaskId,
  useCreateAsset,
  useDeleteAsset,
} from "@/services/storage.service";
import { useTaskStore } from "@/store/task.store";
import { useProjectStore } from "@/store/project.store";
import UploadProgress from "../Storage/UploadProgress";
import IconLoader from "../IconLoader";

export default function TaskAttachments({
  onOpenModal,
}: {
  onOpenModal: () => void;
}) {
  const currentTask = useTaskStore((s) => s.currentTask);
  const currentProject = useProjectStore((s) => s.currentProject);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: assets = [] } = useGetAssetsByTaskId(currentTask?.id || "");
  const createAssetMutation = useCreateAsset();
  const deleteAssetMutation = useDeleteAsset();

  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isDestinationModalOpen, setIsDestinationModalOpen] = useState(false);

  // 1. Thêm state để lưu % tiến trình
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPendingFiles(Array.from(e.target.files));
      setIsDestinationModalOpen(true);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCancelDestination = () => {
    setPendingFiles([]);
    setIsDestinationModalOpen(false);
  };

  const handleConfirmDestination = async (folderId: string | number | null) => {
    if (pendingFiles.length === 0) return;

    // Build FormData with files and taskId
    const formData = new FormData();

    pendingFiles.forEach((file) => {
      formData.append("files", file);
    });

    if (currentTask?.id) {
      formData.append("taskId", currentTask.id);
    }

    if (currentProject?.id) {
      formData.append("projectId", currentProject.id);
    }

    // Reset progress về 0 trước khi bắt đầu upload
    setUploadProgress(0);

    // Call upload mutation
    createAssetMutation.mutate(
      {
        parentId: folderId ? String(folderId) : undefined,
        formData: formData,
        onUploadProgress: (progressEvent: any) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          // 2. Cập nhật state progress tại đây
          setUploadProgress(percentCompleted);
        },
      },
      {
        onSuccess: () => {
          setPendingFiles([]);
          setIsDestinationModalOpen(false);
          // 3. Reset progress khi thành công
          setUploadProgress(0);
        },
        onError: () => {
          // Reset progress nếu có lỗi
          setUploadProgress(0);
        },
      },
    );
  };

  const getFileExtension = (name: string, fileType?: string | null): string => {
    if (fileType) {
      const ext = fileType.includes("/")
        ? fileType.split("/")[1]
        : fileType.toLowerCase();
      return ext;
    }
    const parts = name.split(".");
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
  };

  const getFileIcon = (
    name: string,
    fileType?: string | null,
    storageUrl?: string | null,
  ) => {
    const ext = getFileExtension(name, fileType);

    if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) {
      return <Archive className="text-orange-500" size={24} />;
    }

    if (["mp4", "mov", "avi", "mkv", "flv", "wmv", "webm"].includes(ext)) {
      return <Film className="text-purple-500" size={24} />;
    }

    if (
      ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico"].includes(ext)
    ) {
      return <ImageIcon className="text-blue-500" size={24} />;
    }

    return <FileText className="text-slate-500" size={24} />;
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Cập nhật tên file hiển thị trên thanh progress (xử lý case chọn nhiều file)
  const getUploadingFileName = () => {
    if (!pendingFiles || pendingFiles.length === 0) return "";
    if (pendingFiles.length === 1) return pendingFiles[0].name;
    return `${pendingFiles[0].name} and ${pendingFiles.length - 1} more...`;
  };

  const handleDeleteAsset = (assetId: string) => {
    deleteAssetMutation.mutate(assetId);
  };

  return (
    <section id="section-attachments" className="scroll-mt-6">
      <h2 className="text-lg font-semibold mb-3 cursor-pointer">Attachments</h2>

      <input
        type="file"
        multiple
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileUpload}
      />

      {assets.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors"
        >
          <Paperclip size={24} className="text-slate-400 mb-2" />
          <p className="text-sm font-medium text-slate-700">
            Drop files here or click to upload
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Paperclip size={16} className="mr-1" /> Add more files
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="flex items-center p-3 border border-slate-200 rounded-lg bg-white relative group shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-2 bg-slate-50 rounded-md mr-3 shrink-0 relative">
                  {getFileIcon(asset.name, asset.fileType, asset.storageUrl)}

                  {!asset.storageUrl && (
                    <Lock
                      size={12}
                      className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 text-red-500"
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  {asset.storageUrl ? (
                    <a
                      href={asset.storageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline truncate block"
                    >
                      {asset.name}
                    </a>
                  ) : (
                    <p className="text-sm font-medium text-slate-700 truncate">
                      {asset.name}
                    </p>
                  )}
                  <p className="text-xs text-slate-500">
                    {asset.fileSize ? formatSize(asset.fileSize) : "0 Bytes"}
                  </p>
                </div>

                {deleteAssetMutation.isPending ? (
                  <IconLoader size={20} />
                ) : (
                  <button
                    onClick={() => handleDeleteAsset(asset.id)}
                    disabled={deleteAssetMutation.isPending}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-all ml-2 shrink-0"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <FileStoringModal
        isOpen={isDestinationModalOpen}
        onClose={handleCancelDestination}
        onSubmit={handleConfirmDestination}
      />

      {/* 4. Truyền state progress vào component */}
      <UploadProgress
        isUploading={createAssetMutation.isPending}
        progress={uploadProgress} // Prop truyền % hoàn thành
        fileName={getUploadingFileName()}
      />
    </section>
  );
}
