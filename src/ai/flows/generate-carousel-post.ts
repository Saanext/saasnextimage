'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating carousel post content based on a selected niche.
 *
 * - generateCarouselPost - A function that generates carousel post content options for a given niche.
 * - GenerateCarouselPostInput - The input type for the generateCarouselPost function, specifying the niche.
 * - GenerateCarouselPostOutput - The return type for the generateCarouselPost function, providing an array of content options.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NicheEnum = z.enum(['Web Development', 'Lead Generation', 'AI Solutions', 'CEO Diary']);

const GenerateCarouselPostInputSchema = z.object({
  niche: NicheEnum.describe('The niche for which to generate carousel post content.'),
  userIdeas: z.string().optional().describe('Optional user ideas to guide content generation.'),
});
export type GenerateCarouselPostInput = z.infer<typeof GenerateCarouselPostInputSchema>;

const GenerateCarouselPostOutputSchema = z.object({
  contentOptions: z.array(z.string()).describe('An array of carousel post content options.'),
});
export type GenerateCarouselPostOutput = z.infer<typeof GenerateCarouselPostOutputSchema>;

export async function generateCarouselPost(input: GenerateCarouselPostInput): Promise<GenerateCarouselPostOutput> {
  return generateCarouselPostFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCarouselPostPrompt',
  input: {schema: GenerateCarouselPostInputSchema},
  output: {schema: GenerateCarouselPostOutputSchema},
  prompt: `You are a social media expert specializing in creating engaging carousel posts for SAASNEXT.

  Generate 3 different carousel post content options based on the selected niche. Each option should be concise and attention-grabbing.

  Niche: {{{niche}}}

  {{#if userIdeas}}
  The user has provided some ideas, use them as inspiration: {{{userIdeas}}}
  {{/if}}

  The carousel post content options should be tailored to the specified niche and designed to maximize user engagement.
  Ensure the content is appropriate for a professional audience.
  Return the options as a JSON array of strings.
  `, 
});

const generateCarouselPostFlow = ai.defineFlow(
  {
    name: 'generateCarouselPostFlow',
    inputSchema: GenerateCarouselPostInputSchema,
    outputSchema: GenerateCarouselPostOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
