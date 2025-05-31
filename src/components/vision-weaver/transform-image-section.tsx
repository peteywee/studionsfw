"use client";

import React, { useState, useCallback } from 'react';
import { ImageUploader } from './image-uploader';
import { ImageCard } from './image-card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { transformImageStyle } from '@/ai/flows/transform-image-style';

const availableStyles = [
  { value: "Realistic Unveiled", label: "Realistic Unveiled" },
  { value: "Anime-Style Unveiled", label: "Anime-Style Unveiled" },
  { value: "Impressionistic Painting", label: "Impressionistic Painting" },
  { value: "Cyberpunk Art", label: "Cyberpunk Art" },
  { value: "Fantasy Art", label: "Fantasy Art" },
  { value: "Watercolor Sketch", label: "Watercolor Sketch" },
];

export function TransformImageSection() {
  const [originalImageUri, setOriginalImageUri] = useState<string>('');
  const [transformedImageUri, setTransformedImageUri] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<string>(availableStyles[0].value);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleImageUpload = useCallback((dataUri: string) => {
    setOriginalImageUri(dataUri);
    setTransformedImageUri(''); // Clear previous result
    setError(null);
  }, []);

  const handleTransform = async () => {
    if (!originalImageUri) {
      toast({ title: "No image uploaded", description: "Please upload an image first.", variant: "destructive" });
      return;
    }
    if (!selectedStyle) {
      toast({ title: "No style selected", description: "Please select a transformation style.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setError(null);
    setTransformedImageUri('');

    try {
      const result = await transformImageStyle({ photoDataUri: originalImageUri, style: selectedStyle });
      setTransformedImageUri(result.transformedImage);
      toast({ title: "Transformation Successful", description: `Image transformed to ${selectedStyle} style.` });
    } catch (e: any) {
      console.error("Transformation error:", e);
      const errorMessage = e.message || "Failed to transform image. Please try again.";
      setError(errorMessage);
      toast({ title: "Transformation Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Transform Image</CardTitle>
        <CardDescription>Upload an image and apply an artistic style to it.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="space-y-4">
            <h3 className="font-headline text-lg">1. Upload Your Image</h3>
            <ImageUploader onImageUpload={handleImageUpload} identifier="transform-upload" disabled={isLoading} />
          </div>
          <div className="space-y-4">
            <h3 className="font-headline text-lg">2. Select Style & Transform</h3>
            <Select value={selectedStyle} onValueChange={setSelectedStyle} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Select a style" />
              </SelectTrigger>
              <SelectContent>
                {availableStyles.map(style => (
                  <SelectItem key={style.value} value={style.value}>
                    {style.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleTransform} disabled={isLoading || !originalImageUri} className="w-full">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              Transform Image
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <ImageCard
            title="Original Image"
            imageUrl={originalImageUri}
            altText="Original uploaded image"
            placeholderHint="portrait landscape"
          />
          <ImageCard
            title="Transformed Image"
            imageUrl={transformedImageUri}
            isLoading={isLoading && !!originalImageUri} // Only show loading on this card if original is present
            error={error}
            altText={`Transformed image in ${selectedStyle} style`}
            placeholderHint={`${selectedStyle.toLowerCase().replace(' ', '-')} art`}
          />
        </div>
      </CardContent>
    </Card>
  );
}
