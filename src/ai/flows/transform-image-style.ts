
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

// This prompt definition is available but the flow below implements custom logic.
const transformImageStylePromptObject = ai.definePrompt({
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
  async (input: TransformImageStyleInput) => {
    // This is a placeholder for the actual logic.
    // The idea is to use the input.photoDataUri and input.style
    // to generate a new image.
    // For "Unveiled" styles, the prompt would need to instruct the model
    // to make clothing disappear in an artistic, SFW way.

    // Example of generating an image (this would be more complex for style transfer):
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp', // Example model, might need specific model for style transfer
      prompt: `Transform this image: {{media url=${input.photoDataUri}}} into the style: ${input.style}. If the style is an "Unveiled" style, artistically and SFW-ly remove clothing.`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed to return a media URL or was blocked due to safety policies.');
    }
    
    return {transformedImage: media.url};
  }
);

