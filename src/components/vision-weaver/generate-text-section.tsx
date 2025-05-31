"use client";

import React, { useState } from 'react';
import { ImageCard } from './image-card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ImagePlus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateImageFromText } from '@/ai/flows/generate-image-from-text';

export function GenerateTextSection() {
  const [prompt, setPrompt] = useState<string>('');
  const [generatedImageUri, setGeneratedImageUri] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({ title: "Empty prompt", description: "Please enter a prompt to generate an image.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImageUri('');

    try {
      const result = await generateImageFromText({ prompt });
      setGeneratedImageUri(result.image);
      toast({ title: "Image Generation Successful", description: "Your image has been generated." });
    } catch (e: any) {
      console.error("Image generation error:", e);
      const errorMessage = e.message || "Failed to generate image. Please try again.";
      setError(errorMessage);
      toast({ title: "Image Generation Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Generate Image from Text</CardTitle>
        <CardDescription>Describe the image you want to create, and let AI bring it to life.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="text-prompt" className="font-headline text-lg">Enter Your Prompt</label>
          <Textarea
            id="text-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A majestic lion king on a rocky outcrop, sunset, hyperrealistic"
            rows={4}
            disabled={isLoading}
            className="resize-none"
          />
        </div>
        <Button onClick={handleGenerate} disabled={isLoading || !prompt.trim()} className="w-full md:w-auto">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImagePlus className="mr-2 h-4 w-4" />}
          Generate Image
        </Button>
        
        <div className="mt-6">
          <ImageCard
            title="Generated Image"
            imageUrl={generatedImageUri}
            isLoading={isLoading}
            error={error}
            altText="Image generated from text prompt"
            placeholderHint="ai generated art"
          />
        </div>
      </CardContent>
    </Card>
  );
}
