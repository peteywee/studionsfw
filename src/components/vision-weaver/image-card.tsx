import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "./loading-spinner";
import { AlertTriangle } from "lucide-react";

interface ImageCardProps {
  title: string;
  description?: string;
  imageUrl?: string;
  isLoading?: boolean;
  error?: string | null;
  altText?: string;
  placeholderHint?: string;
  aspectRatio?: string; // e.g., "aspect-square", "aspect-video"
}

export function ImageCard({
  title,
  description,
  imageUrl,
  isLoading,
  error,
  altText = "Image",
  placeholderHint = "abstract visual",
  aspectRatio = "aspect-square",
}: ImageCardProps) {
  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-xl">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className={`${aspectRatio} flex items-center justify-center bg-muted/30 rounded-b-md`}>
        {isLoading ? (
          <LoadingSpinner size={48} />
        ) : error ? (
          <div className="text-destructive text-center p-4">
            <AlertTriangle className="mx-auto h-12 w-12 mb-2" />
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : imageUrl ? (
          <div className="relative w-full h-full">
            <Image
              src={imageUrl}
              alt={altText}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="rounded-md object-contain image-result-enter-active"
            />
          </div>
        ) : (
          <div className="relative w-full h-full">
            <Image
              src={`https://placehold.co/512x512.png`}
              alt="Placeholder image"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="rounded-md object-contain opacity-50"
              data-ai-hint={placeholderHint}
            />
             <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-muted-foreground">No image yet</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
