import { cn } from "@repo/design-system/lib/utils";
import { Upload, File, X } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@repo/design-system/components/ui/button";

export interface UploadFile extends File {
  preview?: string;
}

interface UploadAreaProps {
  onFilesSelected: (files: UploadFile[]) => void;
  onFileRemove?: (file: UploadFile) => void;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number;
  className?: string;
  files?: UploadFile[];
  isLoading?: boolean;
  error?: string;
  helperText?: string;
}

export function UploadArea({
  onFilesSelected,
  onFileRemove,
  accept,
  maxFiles = 1,
  maxSize = 10 * 1024 * 1024, // 10MB default
  className,
  files = [],
  isLoading,
  error,
  helperText,
}: UploadAreaProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );
      onFilesSelected(newFiles);
    },
    [onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/20 hover:border-primary/50",
          error && "border-destructive",
          className
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload
            className={cn(
              "h-8 w-8",
              isDragActive ? "text-primary" : "text-muted-foreground"
            )}
          />
          <div className="text-sm">
            {isDragActive ? (
              <p className="text-primary">Drop files here</p>
            ) : (
              <p className="text-muted-foreground">
                Drag & drop files here, or click to select
              </p>
            )}
          </div>
          {helperText && (
            <p className="text-xs text-muted-foreground">{helperText}</p>
          )}
        </div>
      </div>

      {/* File Preview */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-muted rounded-md"
            >
              <div className="flex items-center space-x-2">
                <File className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm truncate max-w-[200px]">
                  {file.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({Math.round(file.size / 1024)}KB)
                </span>
              </div>
              {onFileRemove && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFileRemove(file)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
