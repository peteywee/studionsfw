// src/ai/flows/generate-prompt-from-image.ts
'use server';
/**
 * @fileOverview Generates a text prompt from an uploaded image.
 *
 * - generatePromptFromImage - A function that generates a text prompt from an image.
 * - GeneratePromptFromImageInput - The input type for the generatePromptFromImage function.
 * - GeneratePromptFromImageOutput - The return type for the generatePromptFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePromptFromImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of something, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GeneratePromptFromImageInput = z.infer<typeof GeneratePromptFromImageInputSchema>;

const GeneratePromptFromImageOutputSchema = z.object({
  prompt: z.string().describe('A text prompt describing the image.'),
});
export type GeneratePromptFromImageOutput = z.infer<typeof GeneratePromptFromImageOutputSchema>;

export async function generatePromptFromImage(input: GeneratePromptFromImageInput): Promise<GeneratePromptFromImageOutput> {
  return generatePromptFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePromptFromImagePrompt',
  input: {schema: GeneratePromptFromImageInputSchema},
  output: {schema: GeneratePromptFromImageOutputSchema},
  prompt: `You are an AI assistant that generates text prompts describing an image.  The prompt will be used as the basis for generating variations of the image.

  Describe the following image in a text prompt:
  {{media url=photoDataUri}}`,
});

const generatePromptFromImageFlow = ai.defineFlow(
  {
    name: 'generatePromptFromImageFlow',
    inputSchema: GeneratePromptFromImageInputSchema,
    outputSchema: GeneratePromptFromImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
