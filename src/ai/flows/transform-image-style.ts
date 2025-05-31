
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
      textPromptGenerationInstruction = `Your task is to generate a textual instruction for an AI image editing model. The model will be given an input image (visible to you) and your text. Your instruction must guide the AI to redraw the subject in the input image with *minimal, SFW (Safe-For-Work), non-explicit* attire.
Examples of acceptable SFW attire include:
- Basic, full-coverage swimwear (e.g., one-piece swimsuit for females, swim trunks for males).
- Simple, plain leotards or unitards that cover the torso.
- Athletic wear appropriate for a non-sexualized context (e.g., sports bra and shorts for a workout scene, if contextually appropriate and ensuring modest coverage).
Alternatively, guide the AI towards an SFW artistic nude style, *strictly reminiscent of classical sculptures (e.g., marble statue) or anatomical drawings*, devoid of any sexualization or explicit details. The aim is artistic representation, not titillation.
*Crucially, the instruction must explicitly state to AVOID any depiction of nudity that is not in the style of classical art or anatomical study. It must AVOID any sexually suggestive poses, attire, or contexts. Prohibit depiction of lingerie, transparent clothing, or overly revealing attire. The output must be suitable for all audiences and must not violate safety policies against depicting sexual content or non-consensual sexual content.*
The final visual style of the edited image should be '${specificStyleForUnveiledImage}'.
The instruction must emphasize SFW artistic representation, maintain likeness to the original subject's facial features and general body type as much as possible, and be concise for the image editing model.`;
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
       config: { // Added safety settings for the instruction generation step
        safetySettings: [
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      }
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
        safetySettings: [ // Added safety settings for the image generation step
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed to return a media URL or was blocked due to safety policies.');
    }

    return {transformedImage: media.url};
  }
);

