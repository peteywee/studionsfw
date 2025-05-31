"use client";

import React, { useState, useCallback } from 'react';
import { ImageUploader } from './image-uploader';
import { ImageCard } from './image-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generatePromptFromImage } from '@/ai/flows/generate-prompt-from-image';

export function DescribeImageSection() {
  const [uploadedImageUri, setUploadedImageUri] = useState<string>('');
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null); // For image card error
  const [promptError, setPromptError] = useState<string | null>(null); // For prompt generation error
  const { toast } = useToast();

  const handleImageUpload = useCallback((dataUri: string) => {
    setUploadedImageUri(dataUri);
    setGeneratedPrompt(''); // Clear previous prompt
    setError(null);
    setPromptError(null);
  }, []);

  const handleDescribe = async () => {
    if (!uploadedImageUri) {
      toast({ title: "No image uploaded", description: "Please upload an image first to generate a prompt.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setPromptError(null);
    setGeneratedPrompt('');

    try {
      const result = await generatePromptFromImage({ photoDataUri: uploadedImageUri });
      setGeneratedPrompt(result.prompt);
      toast({ title: "Prompt Generation Successful", description: "A descriptive prompt has been generated for your image." });
    } catch (e: any) {
      console.error("Prompt generation error:", e);
      const errorMessage = e.message || "Failed to generate prompt. Please try again.";
      setPromptError(errorMessage);
      toast({ title: "Prompt Generation Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Get Prompt from Image</CardTitle>
        <CardDescription>Upload an image to generate a descriptive text prompt for AI image generation.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="space-y-4">
            <h3 className="font-headline text-lg">1. Upload Your Image</h3>
            <ImageUploader onImageUpload={handleImageUpload} identifier="describe-upload" disabled={isLoading} />
             <Button onClick={handleDescribe} disabled={isLoading || !uploadedImageUri} className="w-full mt-2">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
              Generate Prompt
            </Button>
          </div>
          <div className="space-y-4">
             <h3 className="font-headline text-lg">Uploaded Image</h3>
             <ImageCard
                title=""
                imageUrl={uploadedImageUri}
                error={error} // Assuming image uploader doesn't set its own errors for ImageCard here
                altText="Image to be described"
                placeholderHint="object person scene"
                aspectRatio="aspect-video"
              />
          </div>
        </div>
       
        { (isLoading && !generatedPrompt && !promptError) && 
            <div className="flex items-center justify-center p-4 bg-muted/50 rounded-md">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                <p>Generating prompt...</p>
            </div>
        }
        {promptError && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-md">
            <p className="font-semibold">Error generating prompt:</p>
            <p className="text-sm">{promptError}</p>
          </div>
        )}
        {generatedPrompt && (
          <div className="space-y-2">
            <h3 className="font-headline text-lg">Generated Prompt:</h3>
            <Textarea
              value={generatedPrompt}
              readOnly
              rows={5}
              className="bg-muted/30"
              aria-label="Generated prompt"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
