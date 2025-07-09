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

const ImageStyleEnum = z.enum(['Minimal', '3D Art', 'Bold Typographic']);

const GenerateCarouselImagesInputSchema = z.object({
  contentOptions: z.array(z.string()).describe('The text content for the carousel posts.'),
  imageStyle: ImageStyleEnum.describe('The desired image style for the carousel post.'),
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
      const colorThemePrompt = "The color palette for any visual elements must be strictly limited to dark black and dark orange. The text must be white. The overall design should be high-contrast and professional.";
      
      if (input.imageStyle === 'Bold Typographic') {
        imagePrompt = `A visually striking, text-only graphic for a social media post, 2:3 aspect ratio, in the style of modern Swiss design. Emphasize a strong grid, masterful use of negative space, and bold, clean sans-serif typography. The layout should be dynamic and create a clear visual hierarchy. Feature this text prominently: "${text}". The design must be modern, professional, and high-impact. ${colorThemePrompt}`;
      } else if (input.imageStyle === '3D Art') {
        imagePrompt = `Generate a high-end, abstract 3D artistic render for a social media post, framed in a 2:3 aspect ratio. The composition must follow Swiss design principles, featuring a clean, grid-based layout, and a professional aesthetic. Integrate subtle, realistic lighting and shadows to give depth to geometric 3D shapes. The text "${text}" should be elegantly integrated into the 3D scene. The overall feel should be sophisticated, modern, and visually captivating. ${colorThemePrompt}`;
      } else if (input.imageStyle === 'Minimal') {
         imagePrompt = `Design an ultra-minimalist and elegant social media graphic in a 2:3 aspect ratio, deeply inspired by Swiss design. The focus should be on generous use of negative space, a precise grid layout, and crisp, light sans-serif typography. Include only essential elements to convey the message clearly. Feature the following text with sophisticated placement: "${text}". The aesthetic must be clean, professional, modern, and serene. ${colorThemePrompt}`;
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
