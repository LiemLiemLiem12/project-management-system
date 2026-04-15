"use client";
import { useState, useRef } from "react";
import { Paperclip, FileText, Image as ImageIcon, Film, X } from "lucide-react";

// Mock data giả lập các file đã được upload từ trước
const MOCK_FILES = [
  {
    id: "1",
    name: "project_requirements.docx",
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    size: 2048576, // ~2MB
  },
  {
    id: "2",
    name: "ui_design_preview.jpg",
    type: "image/jpeg",
    size: 1024000, // ~1MB
  },
  {
    id: "3",
    name: "feature_demo.mp4",
    type: "video/mp4",
    size: 15485760, // ~15MB
  },
];

export default function TaskAttachments() {
  const [files, setFiles] = useState<any[]>(MOCK_FILES);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Xử lý khi người dùng chọn file mới
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        id: crypto.randomUUID(), // Tạo ID ngẫu nhiên cho file mới
        name: file.name,
        type: file.type,
        size: file.size,
        rawFile: file, // Lưu lại file gốc để gọi API upload thực tế sau này
      }));
      setFiles((prev) => [...prev, ...newFiles]);
    }
    // Reset giá trị input để cho phép chọn lại cùng một file nếu vừa xóa
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Xóa file khỏi danh sách
  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  // Helper function để chọn Icon dựa trên loại file
  const getFileIcon = (type: string) => {
    if (type.startsWith("image/"))
      return <ImageIcon className="text-blue-500" size={24} />;
    if (type.startsWith("video/"))
      return <Film className="text-purple-500" size={24} />;
    return <FileText className="text-slate-500" size={24} />; // Mặc định cho Doc/PDF/Other
  };

  // Helper function để format dung lượng file cho dễ đọc
  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <section id="section-attachments" className="scroll-mt-6">
      <h2 className="text-lg font-semibold mb-3">Attachments</h2>

      {/* Input file ẩn, được trigger qua ref */}
      <input
        type="file"
        multiple
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileUpload}
      />

      {files.length === 0 ? (
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
          {/* Nút Upload thêm file khi đã có danh sách */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Paperclip size={16} className="mr-1" /> Add more files
          </button>

          {/* Render danh sách file */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center p-3 border border-slate-200 rounded-lg bg-white relative group shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-2 bg-slate-50 rounded-md mr-3 shrink-0">
                  {getFileIcon(file.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatSize(file.size)}
                  </p>
                </div>

                {/* Nút xóa hiện ra khi hover */}
                <button
                  onClick={() => removeFile(file.id)}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-all ml-2 shrink-0"
                  title="Remove file"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
