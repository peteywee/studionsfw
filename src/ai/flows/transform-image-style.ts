
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
    let baseStyleForTextPrompt = input.style; 
    let isUnveiledStyle = false;
    let specificStyleForUnveiledImage = ""; 

    if (input.style === "Realistic Unveiled") {
      isUnveiledStyle = true;
      specificStyleForUnveiledImage = "Realistic";
    } else if (input.style === "Anime-Style Unveiled") {
      isUnveiledStyle = true;
      specificStyleForUnveiledImage = "Anime-Style";
    }

    let textPromptGenerationInstruction: string;

    if (isUnveiledStyle) {
      textPromptGenerationInstruction = `Your task is to generate a textual instruction for an AI image editing model. The AI model will be given an input image (which you are also seeing now via multimodal input). Your textual instruction should guide the AI to modify the subject in the input image. The modification involves artistically and safely "unveiling" their clothing – this means redrawing them in simple, minimal, non-explicit attire (e.g., basic swimwear, a plain leotard, or athletic wear appropriate for the context), or in an SFW (safe-for-work) artistic nude style reminiscent of classical sculptures, ensuring no explicit or inappropriate content. The final visual style of the edited image should be '${specificStyleForUnveiledImage}'. Your instruction must emphasize SFW artistic representation and guide the AI to maintain likeness to the original subject's facial features and general body type as much as possible. The instruction should be concise and direct for the image editing model.`;
    } else {
      textPromptGenerationInstruction = `Your task is to generate a textual instruction for an AI image editing model. The AI model will be given an input image (which you are also seeing now via multimodal input). Your textual instruction should guide the AI to transform the input image, redrawing it in the style of '${baseStyleForTextPrompt}'. Your instruction must emphasize SFW (safe-for-work) artistic representation and guide the AI to maintain likeness to the original subject's features and composition as much as possible. The instruction should be concise and direct for the image editing model.`;
    }

    // 1. Generate textual editing instructions based on the input image and desired style.
    const {text: generatedEditingInstruction} = await ai.generate({
      model: 'googleai/gemini-1.5-flash-001', // Good for text generation from multimodal input
      prompt: [
        {media: {url: input.photoDataUri}},     // Provide the original image context
        {text: textPromptGenerationInstruction}, // Instruction for generating the editing text
      ],
    });

    // 2. Generate the transformed image using the original image and the generated editing instructions.
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',     // Image generation model
      prompt: [
        {media: {url: input.photoDataUri}},       // Original image as base
        {text: generatedEditingInstruction}       // Textual instructions from step 1
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'], // Expect image and potentially text output
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed to return a media URL.');
    }

    return {transformedImage: media.url};
  }
);

