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

const ImageStyleEnum = z.enum(['Minimal', '3D Art', 'Bold Typographic', 'Realistic', '3D Newspaper']);
const NicheEnum = z.enum(['Web Development', 'Lead Generation', 'AI Solutions', 'CEO Diary', 'Latest News']);

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
      const basePrompt = `Create an artistic, masterpiece-level social media graphic with a 2:3 aspect ratio. The color palette is strictly limited to dark black, vibrant dark orange, and pure white for text. The design must be ultra-modern, professional, and impactful. A small, subtle signature "Designer: Deepak Bagada" must be in a bottom corner. The graphic must prominently feature the following text, and ONLY this text, with no spelling mistakes: "${text}".`

      if (input.imageStyle === 'Bold Typographic') {
        imagePrompt = `${basePrompt} Style: 'Bold Typographic'. This is a text-only masterpiece of graphic design. Emphasize a powerful grid system, masterful use of negative space, and expressive, bold sans-serif typography inspired by cutting-edge Swiss design. The layout must be dynamic, creating a clear visual hierarchy and a sense of movement. The composition should feel like a high-end art print.`;
      } else if (input.imageStyle === '3D Art') {
        imagePrompt = `${basePrompt} Style: '3D Art'. Generate a sophisticated, abstract 3D artistic render. The composition must be a masterpiece of digital art, following Swiss design principles with a clean, grid-based layout. Integrate complex, realistic lighting and soft shadows to give depth to abstract geometric or organic 3D shapes. The text must be elegantly integrated into the 3D scene as if it were a physical object within the composition.`;
      } else if (input.imageStyle === 'Minimal') {
         imagePrompt = `${basePrompt} Style: 'Minimal'. Design an ultra-minimalist and elegant graphic masterpiece inspired by high-end Swiss design. The focus is on extreme use of negative space, a mathematically precise grid layout, and crisp, light sans-serif typography. Include only the most essential elements, placed with artistic precision to convey the message with quiet confidence and sophistication.`;
      } else if (input.imageStyle === 'Realistic') {
        imagePrompt = `${basePrompt} Style: 'Realistic'. Generate a hyper-realistic, professional, masterpiece photograph relevant to the niche of "${input.niche}". The image must have a cinematic quality, with perfect lighting and composition, while adhering to the specified artistic color palette (black, orange, white). The text should be seamlessly and accurately integrated into the photograph in an elegant, modern, and highly readable font, as if it were part of the original scene.`;
      } else if (input.imageStyle === '3D Newspaper') {
        imagePrompt = `${basePrompt} Style: '3D Newspaper'. Create a dramatic, artistic 3D render of a newspaper. The text should be the main headline, designed with a bold, attention-grabbing font. The newspaper itself should be rendered with photorealistic textures, showing the paper grain and slightly aged look, with columns of blurred placeholder text to simulate a real newspaper layout. Use dynamic, cinematic lighting to cast soft shadows, enhancing the 3D effect and creating a masterpiece of visual storytelling.`;
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
