import { Progress } from "@repo/design-system/components/ui/progress";
import { AlertCircle, CheckCircle2, FileText, Loader2 } from "lucide-react";
import { cn } from "@repo/design-system/lib/utils";

interface UploadProgressProps {
  fileName: string;
  progress: number;
  status: "pending" | "uploading" | "completed" | "failed";
  error?: string;
}

export function UploadProgress({ fileName, progress, status, error }: UploadProgressProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">{fileName}</span>
        </div>
        <div className="flex items-center gap-2">
          {status === "uploading" && (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          )}
          {status === "completed" && (
            <CheckCircle2 className="h-4 w-4 text-success" />
          )}
          {status === "failed" && (
            <AlertCircle className="h-4 w-4 text-destructive" />
          )}
          <span 
            className={cn(
              "text-xs",
              status === "completed" && "text-success",
              status === "failed" && "text-destructive"
            )}
          >
            {status === "pending" && "Waiting..."}
            {status === "uploading" && `${Math.round(progress)}%`}
            {status === "completed" && "Uploaded"}
            {status === "failed" && "Failed"}
          </span>
        </div>
      </div>

      {status !== "completed" && (
        <Progress 
          value={progress} 
          className={cn(
            status === "failed" && "bg-destructive/20 [&>div]:bg-destructive"
          )}
        />
      )}

      {error && status === "failed" && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
