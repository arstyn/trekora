import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CloudUpload, ImageIcon, X } from "lucide-react";
import React, { useRef, useState } from "react";

interface FileUploaderProps {
    value?: (File | string)[]; // Selected files or existing URLs
    onChange: (files: File[]) => void;
    onRemoveExisting?: (index: number) => void;
    onRemoveNew?: (index: number) => void;
    maxFiles?: number;
    accept?: string;
    label?: string;
    className?: string;
    isCircular?: boolean; // Circular shape for profile photo
}

export function FileUploader({
    value = [],
    onChange,
    onRemoveExisting,
    onRemoveNew,
    maxFiles = 1,
    accept = "image/*",
    className = "",
    isCircular = false,
}: FileUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

        const droppedFiles = Array.from(e.dataTransfer.files);
        if (droppedFiles.length === 0) return;

        // Filter files based on accept type (simple check)
        const acceptedFiles = droppedFiles.filter((file) => {
            if (accept === "image/*") return file.type.startsWith("image/");
            return true; // add more validation if needed
        });

        if (acceptedFiles.length > 0) {
            // Respect maxFiles limit
            const filesToSelect = acceptedFiles.slice(0, maxFiles);
            onChange(filesToSelect);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        if (selectedFiles.length > 0) {
            const filesToSelect = selectedFiles.slice(0, maxFiles);
            onChange(filesToSelect);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    // Separate URLs vs File objects
    const existingUrls = value.filter((v): v is string => typeof v === "string");
    const newFiles = value.filter((v): v is File => v instanceof File);

    // Create local preview URLs for the new files
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

    const totalCount = existingUrls.length + newFiles.length;

    // Clean up preview URLs when component un-mounts
    React.useEffect(() => {
        return () => {
            newPreviews.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [newFiles]);

    if (isCircular) {
        const hasImage = totalCount > 0;
        const currentImage = newPreviews[0] || existingUrls[0];

        return (
            <div className={`flex flex-col items-center gap-4 ${className}`}>
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={triggerFileInput}
                    className={`relative w-36 h-36 rounded-full border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all duration-300 group select-none shadow-sm
                        ${isDragging
                            ? "border-primary bg-primary/10 ring-4 ring-primary/10 scale-105"
                            : "border-muted-foreground/30 hover:border-primary hover:bg-accent/50 bg-background"
                        }`}
                >
                    {hasImage ? (
                        <>
                            <img
                                src={currentImage}
                                alt="Uploader preview"
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white gap-1">
                                <CloudUpload className="h-6 w-6 animate-bounce" />
                                <span className="text-[10px] font-semibold tracking-wide uppercase">Change Photo</span>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
                            <CloudUpload className={`h-8 w-8 mb-2 transition-transform duration-200 group-hover:scale-110 ${isDragging ? 'text-primary scale-110' : ''}`} />
                            <span className="text-xs font-semibold text-foreground group-hover:text-primary">Drag & Drop</span>
                            <span className="text-[9px] text-muted-foreground/80 mt-0.5">or click to upload</span>
                        </div>
                    )}
                </div>

                {hasImage && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (newFiles.length > 0 && onRemoveNew) {
                                onRemoveNew(0);
                            } else if (existingUrls.length > 0 && onRemoveExisting) {
                                onRemoveExisting(0);
                            }
                        }}
                        className="h-8 text-xs font-medium text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors px-3 py-1 flex items-center gap-1.5"
                    >
                        <X className="h-3.5 w-3.5" />
                        Remove Image
                    </Button>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    onChange={handleFileSelect}
                    className="hidden"
                />
            </div>
        );
    }

    return (
        <div className={`space-y-3 ${className}`}>
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={triggerFileInput}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 group select-none flex flex-col items-center justify-center min-h-[140px]
                    ${isDragging
                        ? "border-primary bg-primary/5 ring-4 ring-primary/5 scale-[1.01]"
                        : "border-muted-foreground/20 hover:border-primary hover:bg-accent/40 bg-background"
                    }`}
            >
                <CloudUpload className={`h-9 w-9 text-muted-foreground mb-3 transition-transform duration-200 group-hover:scale-110 ${isDragging ? 'text-primary scale-110 animate-pulse' : ''}`} />
                <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        Drag and drop files here
                    </p>
                    <p className="text-xs text-muted-foreground">
                        or <span className="underline font-medium text-primary">browse files</span> on your device
                    </p>
                    <p className="text-[10px] text-muted-foreground/80 mt-1">
                        Supports images under 5MB
                    </p>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    multiple={maxFiles > 1}
                    accept={accept}
                    onChange={handleFileSelect}
                    className="hidden"
                />
            </div>

            {/* Show files / previews list */}
            {totalCount > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-1">
                    {/* Existing Files */}
                    {existingUrls.map((url, idx) => (
                        <div key={`existing-${idx}`} className="relative group rounded-lg overflow-hidden border bg-muted aspect-video flex items-center justify-center shadow-sm">
                            <img src={url} alt="Uploaded" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <Badge variant="secondary" className="absolute top-1.5 left-1.5 text-[9px] px-1 py-0.5">Existing</Badge>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="h-7 w-7 rounded-full shadow"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemoveExisting?.(idx);
                                    }}
                                >
                                    <X className="h-4.5 w-4.5" />
                                </Button>
                            </div>
                        </div>
                    ))}

                    {/* New Files */}
                    {newFiles.map((file, idx) => (
                        <div key={`new-${idx}`} className="relative group rounded-lg overflow-hidden border bg-muted aspect-video flex items-center justify-center shadow-sm">
                            {file.type.startsWith("image/") ? (
                                <img src={newPreviews[idx]} alt="Uploaded" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center justify-center text-muted-foreground p-2">
                                    <ImageIcon className="h-8 w-8 mb-1" />
                                    <span className="text-[10px] text-center truncate max-w-full font-medium px-1">{file.name}</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <Badge variant="default" className="absolute top-1.5 left-1.5 text-[9px] px-1 py-0.5 bg-primary">New</Badge>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="h-7 w-7 rounded-full shadow"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemoveNew?.(idx);
                                    }}
                                >
                                    <X className="h-4.5 w-4.5" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
