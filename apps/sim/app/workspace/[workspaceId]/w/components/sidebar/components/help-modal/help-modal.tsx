"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createLogger } from "@/lib/logs/console/logger";
import { zodResolver } from "@hookform/resolvers/zod";
import imageCompression from "browser-image-compression";
import { AlertCircle, CheckCircle2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const logger = createLogger("HelpModal");

// Define form schema
const formSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  subject: z.string().min(1, "主题是必填项"),
  message: z.string().min(1, "消息是必填项"),
  type: z.enum(["bug", "feedback", "feature_request", "other"], {
    required_error: "请选择请求类型",
  }),
});

type FormValues = z.infer<typeof formSchema>;

// Increased maximum upload size to 20MB
const MAX_FILE_SIZE = 20 * 1024 * 1024;
// Target size after compression (2MB)
const TARGET_SIZE_MB = 2;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

interface ImageWithPreview extends File {
  preview: string;
}

interface HelpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpModal({ open, onOpenChange }: HelpModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [images, setImages] = useState<ImageWithPreview[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      subject: "",
      message: "",
      type: "bug", // Set default value to 'bug'
    },
    mode: "onChange",
  });

  // Listen for the custom event to open the help modal
  useEffect(() => {
    const handleOpenHelp = (event: CustomEvent) => {
      onOpenChange(true);
    };

    // Add event listener
    window.addEventListener("open-help", handleOpenHelp as EventListener);

    // Clean up
    return () => {
      window.removeEventListener("open-help", handleOpenHelp as EventListener);
    };
  }, [onOpenChange]);

  // Set default value for type on component mount
  useEffect(() => {
    setValue("type", "bug");
  }, [setValue]);

  // Scroll to top when success message appears
  useEffect(() => {
    if (submitStatus === "success" && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [submitStatus]);

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      images.forEach((image) => URL.revokeObjectURL(image.preview));
    };
  }, [images]);

  // Scroll to bottom when images are added
  useEffect(() => {
    if (images.length > 0 && scrollContainerRef.current) {
      const scrollContainer = scrollContainerRef.current;
      setTimeout(() => {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: "smooth",
        });
      }, 100); // Small delay to ensure DOM has updated
    }
  }, [images.length]);

  const compressImage = async (file: File): Promise<File> => {
    // Skip compression for small files or GIFs (which don't compress well)
    if (file.size < TARGET_SIZE_MB * 1024 * 1024 || file.type === "image/gif") {
      return file;
    }

    const options = {
      maxSizeMB: TARGET_SIZE_MB,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: file.type,
      // Ensure we maintain proper file naming and MIME types
      initialQuality: 0.8,
      alwaysKeepResolution: true,
    };

    try {
      const compressedFile = await imageCompression(file, options);

      // Create a new File object with the original name and type to ensure compatibility
      return new File([compressedFile], file.name, {
        type: file.type,
        lastModified: Date.now(),
      });
    } catch (error) {
      logger.warn("压缩图片失败，使用原始图片:", { error });
      return file;
    }
  };

  const processFiles = async (files: FileList | File[]) => {
    setImageError(null);

    if (!files || files.length === 0) return;

    setIsProcessing(true);

    try {
      const newImages: ImageWithPreview[] = [];
      let hasError = false;

      for (const file of Array.from(files)) {
        // Check file size
        if (file.size > MAX_FILE_SIZE) {
          setImageError(`文件 ${file.name} 大小超过 20MB，最大支持 20MB。`);
          hasError = true;
          continue;
        }

        // Check file type
        if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
          setImageError(
            `文件 ${file.name} 格式不支持，请使用 JPEG、PNG、WebP 或 GIF 格式。`
          );
          hasError = true;
          continue;
        }

        // Compress the image (behind the scenes)
        const compressedFile = await compressImage(file);

        // Create preview URL
        const imageWithPreview = Object.assign(compressedFile, {
          preview: URL.createObjectURL(compressedFile),
        }) as ImageWithPreview;

        newImages.push(imageWithPreview);
      }

      if (!hasError && newImages.length > 0) {
        setImages((prev) => [...prev, ...newImages]);
      }
    } catch (error) {
      logger.error("处理图片失败:", { error });
      setImageError("处理图片失败，请联系客服。");
    } finally {
      setIsProcessing(false);

      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Update the existing handleFileChange function to use processFiles
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await processFiles(e.target.files);
    }
  };

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(e.dataTransfer.files);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      // Revoke the URL to avoid memory leaks
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Create FormData to handle file uploads
      const formData = new FormData();

      // Add form fields
      formData.append("email", data.email);
      formData.append("subject", data.subject);
      formData.append("message", data.message);
      formData.append("type", data.type);

      // Add images
      images.forEach((image, index) => {
        formData.append(`image_${index}`, image);
      });

      const response = await fetch("/api/help", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "提交帮助请求失败");
      }

      setSubmitStatus("success");
      reset();

      // Clean up image previews
      images.forEach((image) => URL.revokeObjectURL(image.preview));
      setImages([]);
    } catch (error) {
      logger.error("提交帮助请求失败:", { error });
      setSubmitStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "提交帮助请求失败"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="flex h-[75vh] max-h-[75vh] flex-col gap-0 p-0 sm:max-w-[700px]">
        <AlertDialogHeader className="flex-shrink-0 px-6 py-5">
          <AlertDialogTitle className="font-medium text-lg">
            帮助 & 支持
          </AlertDialogTitle>
        </AlertDialogHeader>

        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            {/* Scrollable Content */}
            <div
              ref={scrollContainerRef}
              className="scrollbar-hide min-h-0 flex-1 overflow-y-auto pb-20"
            >
              <div className="px-6">
                {submitStatus === "success" ? (
                  <Alert className="mb-6 border-border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30">
                    <div className="flex items-start gap-4 py-1">
                      <div className="mt-[-1.5px] flex-shrink-0">
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="mr-4 flex-1 space-y-2">
                        <AlertTitle className="-mt-0.5 flex items-center justify-between">
                          <span className="font-medium text-green-600 dark:text-green-400">
                            成功
                          </span>
                        </AlertTitle>
                        <AlertDescription className="text-green-600 dark:text-green-400">
                          您的请求已成功提交，我们将尽快回复您。
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                ) : submitStatus === "error" ? (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>错误</AlertTitle>
                    <AlertDescription>
                      {errorMessage || "提交请求时出错，请稍后重试。"}
                    </AlertDescription>
                  </Alert>
                ) : null}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">请求类型</Label>
                    <Select
                      defaultValue="bug"
                      onValueChange={(value) => setValue("type", value as any)}
                    >
                      <SelectTrigger
                        id="type"
                        className={`h-9 rounded-[8px] ${errors.type ? "border-red-500" : ""}`}
                      >
                        <SelectValue placeholder="请选择请求类型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bug">Bug 报告</SelectItem>
                        <SelectItem value="feedback">反馈</SelectItem>
                        <SelectItem value="feature_request">
                          功能请求
                        </SelectItem>
                        <SelectItem value="other">其他</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.type && (
                      <p className="mt-1 text-red-500 text-sm">
                        {errors.type.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">邮箱</Label>
                    <Input
                      id="email"
                      placeholder="请输入邮箱"
                      {...register("email")}
                      className={`h-9 rounded-[8px] ${errors.email ? "border-red-500" : ""}`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-red-500 text-sm">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">标题</Label>
                    <Input
                      id="subject"
                      placeholder="请输入标题"
                      {...register("subject")}
                      className={`h-9 rounded-[8px] ${errors.subject ? "border-red-500" : ""}`}
                    />
                    {errors.subject && (
                      <p className="mt-1 text-red-500 text-sm">
                        {errors.subject.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">内容</Label>
                    <Textarea
                      id="message"
                      placeholder="请输入内容"
                      rows={5}
                      {...register("message")}
                      className={`rounded-[8px] ${errors.message ? "border-red-500" : ""}`}
                    />
                    {errors.message && (
                      <p className="mt-1 text-red-500 text-sm">
                        {errors.message.message}
                      </p>
                    )}
                  </div>

                  {/* Image Upload Section */}
                  <div className="mt-6 space-y-2">
                    <Label>上传图片 (可选)</Label>
                    <div
                      ref={dropZoneRef}
                      onDragEnter={handleDragEnter}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`flex items-center gap-4 ${
                        isDragging ? "rounded-md bg-primary/5 p-2" : ""
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept={ACCEPTED_IMAGE_TYPES.join(",")}
                        onChange={handleFileChange}
                        className="hidden"
                        multiple
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex h-9 items-center justify-center gap-2 rounded-[8px]"
                      >
                        <Upload className="h-4 w-4" />
                        上传图片
                      </Button>
                      <p className="text-muted-foreground text-xs">
                        拖拽图片到这里或点击上传。每个图片最大 20MB。
                      </p>
                    </div>
                    {imageError && (
                      <p className="mt-1 text-red-500 text-sm">{imageError}</p>
                    )}
                    {isProcessing && (
                      <p className="text-muted-foreground text-sm">
                        图片上传中...
                      </p>
                    )}
                  </div>

                  {/* Image Preview Section */}
                  {images.length > 0 && (
                    <div className="space-y-2">
                      <Label>上传图片</Label>
                      <div className="grid grid-cols-2 gap-4">
                        {images.map((image, index) => (
                          <div
                            key={index}
                            className="group relative overflow-hidden rounded-md border"
                          >
                            <div className="relative aspect-video">
                              <Image
                                src={image.preview}
                                alt={`Preview ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                              <div
                                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                                onClick={() => removeImage(index)}
                              >
                                <X className="h-6 w-6 text-white" />
                              </div>
                            </div>
                            <div className="truncate bg-muted/50 p-2 text-xs">
                              {image.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Overlay Footer */}
            <div className="absolute inset-x-0 bottom-0 bg-background">
              <div className="flex w-full items-center justify-between px-6 py-4">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  type="button"
                  className="h-9 rounded-[8px]"
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || isProcessing}
                  className="h-9 rounded-[8px]"
                >
                  {isSubmitting ? "提交中..." : "提交"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
