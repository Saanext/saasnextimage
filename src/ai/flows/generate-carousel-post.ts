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
  output: {schema: z.object({ contentOptions: z.array(z.string()) })},
  prompt: `You are a social media expert specializing in creating engaging carousel posts for SAASNEXT.

  Generate 3 different carousel post content options based on the selected niche. Each option should be concise and attention-grabbing.

  Niche: {{{niche}}}

  {{#if userIdeas}}
  The user has provided some ideas, use them as inspiration: {{{userIdeas}}}
  {{/if}}

  The carousel post content options should be tailored to the specified niche and designed to maximize user engagement.
  Ensure the content is appropriate for a professional audience.
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
      let imagePrompt = `A social media post with the text "${text}". Style: ${input.imageStyle}.`;
      if (input.imageStyle === 'Bold Typographic') {
        imagePrompt = `A visually striking, text-based image for a social media post. The text is "${text}". The style should be bold and typographic, clean, modern, professional.`;
      } else if (input.imageStyle === '3D Art') {
        imagePrompt = `A 3D artistic render for a social media post, related to SAAS, tech, and business. It should be inspired by the text: "${text}". Style: ${input.imageStyle}.`;
      } else if (input.imageStyle === 'Minimal') {
         imagePrompt = `A minimal and clean image for a social media post, related to SAAS, tech, and business. It should be inspired by the text: "${text}". Style: ${input.imageStyle}.`;
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
