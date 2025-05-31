"use client";

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransformImageSection } from './transform-image-section';
import { GenerateTextSection } from './generate-text-section';
import { DescribeImageSection } from './describe-image-section';
import { Wand2, ImagePlus, FileText } from 'lucide-react';

export function VisionWeaverClient() {
  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 md:px-0">
      <Tabs defaultValue="transform" className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 mb-8 shadow-md">
          <TabsTrigger value="transform" className="py-3 data-[state=active]:shadow-lg">
            <Wand2 className="mr-2 h-5 w-5" />
            <span className="font-headline">Transform Image</span>
          </TabsTrigger>
          <TabsTrigger value="generate" className="py-3 data-[state=active]:shadow-lg">
            <ImagePlus className="mr-2 h-5 w-5" />
            <span className="font-headline">Generate from Text</span>
          </TabsTrigger>
          <TabsTrigger value="describe" className="py-3 data-[state=active]:shadow-lg">
            <FileText className="mr-2 h-5 w-5" />
            <span className="font-headline">Describe Image</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transform">
          <TransformImageSection />
        </TabsContent>
        <TabsContent value="generate">
          <GenerateTextSection />
        </TabsContent>
        <TabsContent value="describe">
          <DescribeImageSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
