'use server';

/**
 * @fileOverview Transforms an image to a specified style using GenAI.
 *
 * - transformImageStyle - A function that transforms an image to a specified style.
 * - TransformImageStyleInput - The input type for the transformImageStyle function.
 * - TransformImageStyleOutput - The return type for the transformImageStyle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TransformImageStyleInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to transform, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  style: z
    .string()
    .describe(
      'The desired style for the image transformation (e.g., Realistic Unveiled, Anime-Style Unveiled).'
    ),
});
export type TransformImageStyleInput = z.infer<typeof TransformImageStyleInputSchema>;

const TransformImageStyleOutputSchema = z.object({
  transformedImage: z
    .string()
    .describe(
      'The transformed image as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'      
    ),
});
export type TransformImageStyleOutput = z.infer<typeof TransformImageStyleOutputSchema>;

export async function transformImageStyle(input: TransformImageStyleInput): Promise<TransformImageStyleOutput> {
  return transformImageStyleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'transformImageStylePrompt',
  input: {schema: TransformImageStyleInputSchema},
  output: {schema: TransformImageStyleOutputSchema},
  prompt: `You are an AI expert in transforming images.  You will transform the input image to the specified style. The output should be a base64 encoded data URI of the transformed image.

  The input image is: {{media url=photoDataUri}}
  The desired style is: {{{style}}}
  
  Ensure the transformed image maintains likeness to the original subject and is SFW.  Return ONLY the transformed image data URI.
  `,
});

const transformImageStyleFlow = ai.defineFlow(
  {
    name: 'transformImageStyleFlow',
    inputSchema: TransformImageStyleInputSchema,
    outputSchema: TransformImageStyleOutputSchema,
  },
  async input => {
    // 1. Generate a detailed text prompt based on the input image and desired style.
    const {text: generatedPrompt} = await ai.generate({
      model: 'googleai/gemini-1.5-flash-001',
      prompt: [
        {media: {url: input.photoDataUri}},
        {text: `Create a descriptive text prompt to generate an image in the style of ${input.style}. Focus on maintaining likeness to the original subject and creating an SFW output.`},
      ],
    });

    // 2. Generate the transformed image using the generated prompt.
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: generatedPrompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    return {transformedImage: media.url!};
  }
);
