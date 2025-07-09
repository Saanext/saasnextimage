'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating carousel post content and images based on a selected niche and style.
 *
 * - generateCarouselPost - A function that generates carousel post content and image options for a given niche and style.
 * - GenerateCarouselPostInput - The input type for the generateCarouselPost function.
 * - GenerateCarouselPostOutput - The return type for the generateCarouselPost function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NicheEnum = z.enum(['Web Development', 'Lead Generation', 'AI Solutions', 'CEO Diary']);
const ImageStyleEnum = z.enum(['Minimal', '3D Art', 'Bold Typographic']);

const GenerateCarouselPostInputSchema = z.object({
  niche: NicheEnum.describe('The niche for which to generate carousel post content.'),
  userIdeas: z.string().optional().describe('Optional user ideas to guide content generation.'),
  imageStyle: ImageStyleEnum.describe('The desired image style for the carousel post.'),
});
export type GenerateCarouselPostInput = z.infer<typeof GenerateCarouselPostInputSchema>;

const CarouselPostOptionSchema = z.object({
  content: z.string().describe('The text content for the carousel post.'),
  image: z.string().describe("A generated image for the post, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});

const GenerateCarouselPostOutputSchema = z.object({
  contentOptions: z.array(CarouselPostOptionSchema).describe('An array of carousel post content and image options.'),
});
export type GenerateCarouselPostOutput = z.infer<typeof GenerateCarouselPostOutputSchema>;

export async function generateCarouselPost(input: GenerateCarouselPostInput): Promise<GenerateCarouselPostOutput> {
  return generateCarouselPostFlow(input);
}

const generateCarouselTextPrompt = ai.definePrompt({
  name: 'generateCarouselTextPrompt',
  input: {schema: GenerateCarouselPostInputSchema},
  output: {schema: z.object({ contentOptions: z.array(z.string()).length(3) })},
  prompt: `You are a social media expert specializing in creating engaging, short-form posts for SAASNEXT, inspired by Swiss design principles (clean, grid-based, high-impact).

  Generate exactly 3 different post content options based on the selected niche. Each option must be very short, precise, and engaging. It must include:
  1. A strong, attention-grabbing hook.
  2. A clear, concise message.
  3. A compelling call-to-action (CTA).
  
  IMPORTANT: The total text for each option must be extremely brief and punchy, suitable for a visually-driven graphic.
  Do NOT include any hashtags, links, or URLs in your output.

  Niche: {{{niche}}}

  {{#if userIdeas}}
  The user has provided some ideas, use them as inspiration: {{{userIdeas}}}
  {{/if}}

  The carousel post content options should be tailored to the specified niche and designed for high engagement.
  Return the options as a JSON object with a 'contentOptions' key containing an array of strings.
  `, 
});


const generateCarouselPostFlow = ai.defineFlow(
  {
    name: 'generateCarouselPostFlow',
    inputSchema: GenerateCarouselPostInputSchema,
    outputSchema: GenerateCarouselPostOutputSchema,
  },
  async (input) => {
    const { output } = await generateCarouselTextPrompt(input);
    const textOptions = output?.contentOptions || [];

    if (textOptions.length === 0) {
      return { contentOptions: [] };
    }

    const imagePromises = textOptions.map(async (text) => {
      let imagePrompt = '';
      const colorThemePrompt = "The color palette for any visual elements must be strictly limited to dark black and dark orange. The text must be white. The overall design should be high-contrast and professional.";
      
      if (input.imageStyle === 'Bold Typographic') {
        imagePrompt = `A visually striking, text-only graphic for a social media post, 2:3 aspect ratio, in the style of modern Swiss design. Emphasize a strong grid, masterful use of negative space, and bold, clean sans-serif typography. The layout should be dynamic and create a clear visual hierarchy. Feature this text prominently: "${text}". The design must be modern, professional, and high-impact. ${colorThemePrompt}`;
      } else if (input.imageStyle === '3D Art') {
        imagePrompt = `Generate a high-end, abstract 3D artistic render for a social media post, framed in a 2:3 aspect ratio. The composition must follow Swiss design principles, featuring a clean, grid-based layout and a professional aesthetic. Integrate subtle, realistic lighting and shadows to give depth to geometric 3D shapes. The text "${text}" should be elegantly integrated into the 3D scene. The overall feel should be sophisticated, modern, and visually captivating. ${colorThemePrompt}`;
      } else if (input.imageStyle === 'Minimal') {
         imagePrompt = `Design an ultra-minimalist and elegant social media graphic in a 2:3 aspect ratio, deeply inspired by Swiss design. The focus should be on generous use of negative space, a precise grid layout, and crisp, light sans-serif typography. Include only essential elements to convey the message clearly. Feature the following text with sophisticated placement: "${text}". The aesthetic must be clean, professional, modern, and serene. ${colorThemePrompt}`;
      }
      
      const { media } = await ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: imagePrompt,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });
      return {
        content: text,
        image: media.url,
      };
    });

    const contentOptions = await Promise.all(imagePromises);

    return { contentOptions };
  }
);
