"use client";

import { useKnowledgeUpload } from "@/app/workspace/[workspaceId]/knowledge/hooks/use-knowledge-upload";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { createLogger } from "@/lib/logs/console/logger";
import { X } from "lucide-react";
import { useRef, useState } from "react";

const logger = createLogger("UploadModal");

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

interface FileWithPreview extends File {
  preview: string;
}

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  knowledgeBaseId: string;
  chunkingConfig?: {
    maxSize: number;
    minSize: number;
    overlap: number;
  };
  onUploadComplete?: () => void;
}

export function UploadModal({
  open,
  onOpenChange,
  knowledgeBaseId,
  chunkingConfig,
  onUploadComplete,
}: UploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileWithPreview[]>([]);

  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const { isUploading, uploadProgress, uploadFiles } = useKnowledgeUpload({
    onUploadComplete: () => {
      logger.info(`成功上传了 ${files.length} 个文件`);
      onUploadComplete?.();
      handleClose();
    },
  });

  const handleClose = () => {
    if (isUploading) return; // Prevent closing during upload

    setFiles([]);
    setFileError(null);
    setIsDragging(false);
    onOpenChange(false);
  };

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `文件 "${file.name}" 太大了。最大大小为 100MB。`;
    }
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      return `文件 "${file.name}" 的格式不受支持。请使用 PDF, DOC, DOCX, TXT, CSV, XLS, 或 XLSX 文件。`;
    }
    return null;
  };

  const processFiles = (fileList: FileList | File[]) => {
    setFileError(null);
    const newFiles: FileWithPreview[] = [];

    for (const file of Array.from(fileList)) {
      const error = validateFile(file);
      if (error) {
        setFileError(error);
        return;
      }

      const fileWithPreview = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });
      newFiles.push(fileWithPreview);
    }

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      const removedFile = newFiles.splice(index, 1)[0];
      if (removedFile.preview) {
        URL.revokeObjectURL(removedFile.preview);
      }
      return newFiles;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    try {
      await uploadFiles(files, knowledgeBaseId, {
        chunkSize: chunkingConfig?.maxSize || 1024,
        minCharactersPerChunk: chunkingConfig?.minSize || 1,
        chunkOverlap: chunkingConfig?.overlap || 200,
        recipe: "default",
      });
    } catch (error) {
      logger.error("上传文件时出错：", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>上传文件</DialogTitle>
        </DialogHeader>

        <div className="flex-1 space-y-6 overflow-auto">
          {/* File Upload Section */}
          <div className="space-y-3">
            <Label>选择文件</Label>

            {files.length === 0 ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-muted-foreground/40 hover:bg-muted/10"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_FILE_TYPES.join(",")}
                  onChange={handleFileChange}
                  className="hidden"
                  multiple
                />
                <div className="space-y-2">
                  <p className="font-medium text-sm">
                    {isDragging
                      ? "将文件拖到这里！"
                      : "将文件拖到这里或点击浏览"}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    支持 PDF, DOC, DOCX, TXT, CSV, XLS, XLSX (每个文件最大
                    100MB)
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`cursor-pointer rounded-md border border-dashed p-3 text-center transition-colors ${
                    isDragging
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25 hover:border-muted-foreground/40"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_FILE_TYPES.join(",")}
                    onChange={handleFileChange}
                    className="hidden"
                    multiple
                  />
                  <p className="text-sm">
                    {isDragging ? "将更多文件拖到这里！" : "添加更多文件"}
                  </p>
                </div>

                <div className="max-h-40 space-y-2 overflow-auto">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-sm">
                          {file.name}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        disabled={isUploading}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {fileError && (
              <p className="text-destructive text-sm">{fileError}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t pt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
          >
            取消
          </Button>
          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || isUploading}
          >
            {isUploading
              ? uploadProgress.stage === "uploading"
                ? `上传中 ${uploadProgress.filesCompleted + 1}/${uploadProgress.totalFiles}...`
                : uploadProgress.stage === "processing"
                  ? "处理中..."
                  : "上传中..."
              : `上传 ${files.length} 个文件`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
