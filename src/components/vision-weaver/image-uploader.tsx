"use client";

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { UploadCloud, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  onImageUpload: (dataUri: string) => void;
  identifier: string; // Unique ID for the input
  disabled?: boolean;
}

export function ImageUploader({ onImageUpload, identifier, disabled }: ImageUploaderProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // Max 4MB
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 4MB.",
          variant: "destructive",
        });
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a JPG, PNG, WEBP, or GIF image.",
          variant: "destructive",
        });
        return;
      }

      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        onImageUpload(result);
      };
      reader.onerror = () => {
        toast({
          title: "Error reading file",
          description: "Could not read the selected file.",
          variant: "destructive",
        });
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload, toast]);

  const handleRemoveImage = useCallback(() => {
    setImagePreview(null);
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset file input
    }
    onImageUpload(""); // Notify parent that image is removed
  }, [onImageUpload]);

  const triggerFileInput = () => fileInputRef.current?.click();

  return (
    <div className="w-full space-y-4">
      <div
        className={cn(
          "relative group w-full aspect-video border-2 border-dashed border-muted-foreground/50 rounded-lg flex flex-col justify-center items-center cursor-pointer hover:border-primary transition-colors",
          imagePreview ? "p-2" : "p-6",
          disabled && "cursor-not-allowed opacity-50"
        )}
        onClick={() => !disabled && triggerFileInput()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') !disabled && triggerFileInput()}}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload image"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          id={`image-upload-${identifier}`}
          disabled={disabled}
        />
        {imagePreview ? (
          <>
            <Image
              src={imagePreview}
              alt="Uploaded preview"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-contain rounded-md"
            />
            {!disabled && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 bg-card/70 hover:bg-card text-destructive hover:text-destructive-foreground"
                onClick={(e) => { e.stopPropagation(); handleRemoveImage(); }}
                aria-label="Remove image"
              >
                <XCircle className="h-6 w-6" />
              </Button>
            )}
          </>
        ) : (
          <>
            <UploadCloud className="h-12 w-12 text-muted-foreground group-hover:text-primary transition-colors" />
            <p className="mt-2 text-sm text-muted-foreground group-hover:text-primary transition-colors">
              Click or drag to upload
            </p>
            <p className="text-xs text-muted-foreground/70">PNG, JPG, GIF, WEBP up to 4MB</p>
          </>
        )}
      </div>
      {fileName && <p className="text-sm text-muted-foreground">File: {fileName}</p>}
    </div>
  );
}
