import React, { useState, ClipboardEvent, useRef } from "react";
import { X, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

interface CommentInputProps {
  onSubmit?: (formData: FormData) => void;
  isLoading?: boolean;
  parentCommentId?: string;
  placeholder?: string;
  onCancel?: () => void;
}

export function CommentInput({
  onSubmit,
  isLoading,
  parentCommentId,
  placeholder = "Comment...",
  onCancel,
}: CommentInputProps) {
  const [content, setContent] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const inputFileRef = useRef<HTMLInputElement>(null);

  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    const newFiles: File[] = [];
    const newPreviews: string[] = [];

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          newFiles.push(file);
          newPreviews.push(URL.createObjectURL(file));
        }
      }
    }

    if (newFiles.length > 0) {
      setImageFiles((prev) => [...prev, ...newFiles]);
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  // Xóa ảnh đã paste
  const handleRemoveImage = (indexToRemove: number) => {
    // Giải phóng bộ nhớ của URL preview
    URL.revokeObjectURL(previews[indexToRemove]);

    setImageFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
    setPreviews((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;

    const formData = new FormData();
    formData.append("content", content);

    if (parentCommentId) {
      formData.append("parent_comment_id", parentCommentId);
    }

    if (imageFiles.length !== 0) {
      imageFiles.forEach((file) => {
        formData.append("files", file);
      });
    }

    if (onSubmit) {
      await onSubmit(formData);
    }

    setContent("");
    setImageFiles([]);
    setPreviews([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // 1. Hàm xử lý khi người dùng chọn file từ máy tính
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: File[] = [];
    const newPreviews: string[] = [];

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("video/")) {
        toast.error("Can't upload Video");
        return;
      }

      newFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });

    if (newFiles.length > 0) {
      setImageFiles((prev) => [...prev, ...newFiles]);
      setPreviews((prev) => [...prev, ...newPreviews]);
    }

    e.target.value = "";
  };

  const triggerFileInput = () => {
    inputFileRef.current?.click();
  };

  return (
    <div className="flex gap-3 flex-col">
      <div className="border border-slate-300 rounded-lg p-3 bg-white focus-within:border-blue-500 transition-colors">
        <textarea
          className="w-full resize-none outline-none text-[#172B4D] placeholder-slate-400"
          rows={2}
          placeholder="Comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          autoFocus={!!parentCommentId}
        />

        {previews.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2 mb-2">
            {previews.map((previewUrl, index) => (
              <div
                key={index}
                className="relative group w-20 h-20 border rounded-md overflow-hidden bg-slate-100"
              >
                <img
                  src={previewUrl}
                  alt={`Preview ${index}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100">
          <div className="text-slate-400 flex gap-2">
            <ImageIcon onClick={triggerFileInput} size={18} />
            <input
              ref={inputFileRef}
              onChange={handleFileChange}
              type="file"
              hidden={true}
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={isLoading || (!content.trim() && imageFiles.length === 0)}
            className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:bg-slate-300 transition-colors"
          >
            {isLoading ? "Sending" : "Send"}
          </button>
        </div>
      </div>
      <p className="text-xs text-slate-500 mt-2">
        <strong>Pro tip:</strong> press{" "}
        <kbd className="border border-slate-300 rounded px-1 bg-slate-50">
          Enter
        </kbd>{" "}
        to comment,{" "}
        <kbd className="border border-slate-300 rounded px-1 bg-slate-50">
          Shift + Enter
        </kbd>{" "}
        for new line
      </p>
    </div>
  );
}
