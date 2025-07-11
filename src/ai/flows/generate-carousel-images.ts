'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating carousel post images based on provided text and a style.
 *
 * - generateCarouselImages - A function that generates carousel images.
 * - GenerateCarouselImagesInput - The input type for the generateCarouselImages function.
 * - GenerateCarouselImagesOutput - The return type for the generateCarouselImages function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImageStyleEnum = z.enum(['Minimal', '3D Art', 'Bold Typographic', 'Realistic']);
const NicheEnum = z.enum(['Web Development', 'Lead Generation', 'AI Solutions', 'CEO Diary']);

const GenerateCarouselImagesInputSchema = z.object({
  contentOptions: z.array(z.string()).describe('The text content for the carousel posts.'),
  imageStyle: ImageStyleEnum.describe('The desired image style for the carousel post.'),
  niche: NicheEnum.describe('The selected niche to guide image generation.'),
});
export type GenerateCarouselImagesInput = z.infer<typeof GenerateCarouselImagesInputSchema>;

const CarouselImageOptionSchema = z.object({
  image: z.string().describe("A generated image for the post, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});

const GenerateCarouselImagesOutputSchema = z.object({
  imageOptions: z.array(CarouselImageOptionSchema).describe('An array of carousel post image options.'),
});
export type GenerateCarouselImagesOutput = z.infer<typeof GenerateCarouselImagesOutputSchema>;

export async function generateCarouselImages(input: GenerateCarouselImagesInput): Promise<GenerateCarouselImagesOutput> {
  return generateCarouselImagesFlow(input);
}

const generateCarouselImagesFlow = ai.defineFlow(
  {
    name: 'generateCarouselImagesFlow',
    inputSchema: GenerateCarouselImagesInputSchema,
    outputSchema: GenerateCarouselImagesOutputSchema,
  },
  async (input) => {
    const imageOptionsPromises = input.contentOptions.map(async (text) => {
      let imagePrompt = '';
      const basePrompt = `Create a visually stunning, professional social media graphic with a 2:3 aspect ratio. The color palette must be strictly limited to dark black, dark orange, and white text for high contrast. The design must be modern and impactful. Also, include a small, subtle signature "Designer: Deepak Bagada" in one of the bottom corners of the image. The graphic must prominently feature this text: "${text}".`

      if (input.imageStyle === 'Bold Typographic') {
        imagePrompt = `${basePrompt} The style is 'Bold Typographic'. Emphasize a strong grid, masterful use of negative space, and bold, clean sans-serif typography in the style of modern Swiss design. The layout should be dynamic and create a clear visual hierarchy. This is a text-only graphic.`;
      } else if (input.imageStyle === '3D Art') {
        imagePrompt = `${basePrompt} The style is '3D Art'. Generate a high-end, abstract 3D artistic render. The composition must follow Swiss design principles with a clean, grid-based layout. Integrate subtle, realistic lighting and shadows to give depth to geometric 3D shapes. The text should be elegantly integrated into the 3D scene.`;
      } else if (input.imageStyle === 'Minimal') {
         imagePrompt = `${basePrompt} The style is 'Minimal'. Design an ultra-minimalist and elegant graphic inspired by Swiss design. The focus is on generous use of negative space, a precise grid layout, and crisp, light sans-serif typography. Include only essential elements to convey the message with sophisticated placement.`;
      } else if (input.imageStyle === 'Realistic') {
        imagePrompt = `${basePrompt} The style is 'Realistic'. Generate a high-quality, professional image relevant to the niche of "${input.niche}". The image must have a photorealistic quality, while adhering to the specified artistic color palette. The text should be integrated into the image with an elegant, modern, and readable font.`;
      }
      
      const imageResult = await ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: imagePrompt,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });
      
      return {
        image: imageResult.media.url,
      };
    });

    const imageOptions = await Promise.all(imageOptionsPromises);

    return { imageOptions };
  }
);
