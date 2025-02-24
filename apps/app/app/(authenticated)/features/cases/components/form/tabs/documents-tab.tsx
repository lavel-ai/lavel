import { Button } from "@repo/design-system/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/design-system/components/ui/form";
import { Input } from "@repo/design-system/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/design-system/components/ui/select";
import { useFieldArray, useFormContext } from "react-hook-form";
import type { CaseFormData } from "../../schemas";
import { FileUpload } from "@repo/design-system/components/ui/file-upload";
import { Checkbox } from "@repo/design-system/components/ui/checkbox";
import { Plus, Trash2, FileText, AlertCircle } from "lucide-react";
import { useState } from "react";
import { UploadProgress } from "../upload/upload-progress";

interface FileWithPreview extends File {
  preview?: string;
}

interface UploadState {
  progress: number;
  status: "pending" | "uploading" | "completed" | "failed";
  error?: string;
}

export function DocumentsTab() {
  const form = useFormContext<CaseFormData>();
  const caseType = form.watch("type");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadStates, setUploadStates] = useState<Record<number, UploadState>>({});
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "documents",
  });

  const handleFileSelect = async (index: number, file: FileWithPreview | null) => {
    if (!file) return;

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size must be less than 10MB");
      setUploadStates(prev => ({
        ...prev,
        [index]: {
          progress: 0,
          status: "failed",
          error: "File size must be less than 10MB"
        }
      }));
      return;
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
    ];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Invalid file type. Please upload PDF, DOC, DOCX, JPG, or PNG files.");
      setUploadStates(prev => ({
        ...prev,
        [index]: {
          progress: 0,
          status: "failed",
          error: "Invalid file type"
        }
      }));
      return;
    }

    setUploadError(null);
    setUploadStates(prev => ({
      ...prev,
      [index]: {
        progress: 0,
        status: "uploading",
      }
    }));

    try {
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadStates(prev => {
          const current = prev[index];
          if (current && current.status === "uploading" && current.progress < 90) {
            return {
              ...prev,
              [index]: {
                ...current,
                progress: current.progress + 10
              }
            };
          }
          return prev;
        });
      }, 500);

      // Set the file in the form
      form.setValue(`documents.${index}.file`, file);

      // Simulate upload completion
      setTimeout(() => {
        clearInterval(interval);
        setUploadStates(prev => ({
          ...prev,
          [index]: {
            progress: 100,
            status: "completed"
          }
        }));
      }, 3000);
    } catch (error) {
      setUploadStates(prev => ({
        ...prev,
        [index]: {
          progress: 0,
          status: "failed",
          error: "Upload failed"
        }
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Case Documents</h3>
        <p className="text-sm text-muted-foreground">
          Upload and manage documents related to this case.
        </p>
      </div>

      {uploadError && (
        <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-md">
          <AlertCircle className="h-4 w-4" />
          <p className="text-sm">{uploadError}</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <FormLabel>Documents</FormLabel>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ 
              file: null,
              title: "",
              documentType: "",
              isCourtDocument: false,
              typeOfCourtDocument: "",
              description: ""
            })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Document
          </Button>
        </div>

        {fields.map((field, index) => (
          <div key={field.id} className="border rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Document {index + 1}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`documents.${index}.title`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter document title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`documents.${index}.documentType`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="correspondence">Correspondence</SelectItem>
                        <SelectItem value="evidence">Evidence</SelectItem>
                        <SelectItem value="filing">Court Filing</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {caseType === "litigation" && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name={`documents.${index}.isCourtDocument`}
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">This is a court document</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch(`documents.${index}.isCourtDocument`) && (
                  <FormField
                    control={form.control}
                    name={`documents.${index}.typeOfCourtDocument`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type of Court Document</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select court document type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pleading">Pleading</SelectItem>
                            <SelectItem value="motion">Motion</SelectItem>
                            <SelectItem value="order">Court Order</SelectItem>
                            <SelectItem value="judgment">Judgment</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}

            <FormField
              control={form.control}
              name={`documents.${index}.description`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      className="w-full min-h-[80px] resize-y rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Enter document description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`documents.${index}.file`}
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Upload Document</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <FileUpload
                        {...field}
                        value={value}
                        onFileSelect={(file) => handleFileSelect(index, file)}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      />
                      {uploadStates[index] && (
                        <UploadProgress
                          fileName={value?.name || "Document"}
                          progress={uploadStates[index].progress}
                          status={uploadStates[index].status}
                          error={uploadStates[index].error}
                        />
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
