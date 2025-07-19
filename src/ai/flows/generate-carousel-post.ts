'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating carousel post content and a caption based on a selected niche.
 *
 * - generateCarouselText - A function that generates carousel post content and a caption for a given niche.
 * - GenerateCarouselTextInput - The input type for the generateCarouselText function.
 * - GenerateCarouselTextOutput - The return type for the generateCarouselText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NicheEnum = z.enum(['Web Development', 'Lead Generation', 'AI Solutions', 'CEO Diary', 'Latest News']);

const GenerateCarouselTextInputSchema = z.object({
  niche: NicheEnum.describe('The niche for which to generate carousel post content.'),
  userIdeas: z.string().optional().describe('Optional user ideas to guide content generation.'),
});
export type GenerateCarouselTextInput = z.infer<typeof GenerateCarouselTextInputSchema>;

const GenerateCarouselTextOutputSchema = z.object({
  contentOptions: z.array(z.string()).describe('An array of carousel post content options.'),
  overallCaption: z.string().describe('A single social media caption for the entire carousel post, including a hook and 3 trending hashtags.'),
});
export type GenerateCarouselTextOutput = z.infer<typeof GenerateCarouselTextOutputSchema>;

export async function generateCarouselText(input: GenerateCarouselTextInput): Promise<GenerateCarouselTextOutput> {
  return generateCarouselTextFlow(input);
}

const generateCarouselTextPrompt = ai.definePrompt({
  name: 'generateCarouselTextPrompt',
  input: {schema: z.object({
    niche: NicheEnum,
    userIdeas: z.string().optional(),
    isLatestNews: z.boolean(),
  })},
  output: {schema: z.object({ contentOptions: z.array(z.string()).length(3) })},
  prompt: `You are a senior copywriter expert, a master of crafting highly persuasive and engaging content for the SAASNEXT brand, which is inspired by clean, high-impact Swiss design. Your writing must be flawless, strategic, and compelling.

  Generate exactly 3 different post content options based on the selected niche. Each option must be a masterpiece of brevity and impact, strictly following these rules:
  1. A powerful, irresistible hook (3-5 words) that stops the scroll.
  2. A crystal-clear, concise message (10-15 words) that delivers immediate value.
  3. A strong, action-oriented call-to-action (CTA) (3-5 words) that drives engagement.
  
  CRITICAL INSTRUCTIONS:
  - The total text for each option must be extremely brief and punchy, suitable for a visually-driven graphic.
  - There must be absolutely NO spelling mistakes. Your reputation as an expert depends on it.
  - Do NOT include any hashtags, links, URLs, or quotation marks in your output. Adhere strictly to this rule.
  - Ensure the output is a valid JSON object with a 'contentOptions' key containing an array of 3 strings.

  Niche: {{{niche}}}
  {{#if isLatestNews}}
  When the niche is "Latest News", format the content as a bold, punchy news headline that feels urgent and important.
  {{/if}}

  {{#if userIdeas}}
  The user has provided some ideas. First, analyze their input like a senior strategist to identify the core topics and underlying intent. Then, use those insights to generate exceptionally creative and engaging post content that elevates their original thoughts into expert-level copy.
  User Ideas: {{{userIdeas}}}
  {{/if}}

  The carousel post content options should be tailored to the specified niche and designed for maximum engagement and authority.
  `, 
});

const generateOverallCaptionPrompt = ai.definePrompt({
    name: 'generateOverallCaptionPrompt',
    input: { schema: z.object({ postContents: z.array(z.string()), niche: NicheEnum }) },
    output: { schema: z.object({ caption: z.string() }) },
    prompt: `You are a social media expert. Create a single, engaging social media caption for a carousel post that contains the following pieces of content.

    The caption MUST follow this exact structure:
    1.  Start with a strong, attention-grabbing hook that summarizes the theme of the carousel.
    2.  Briefly introduce the topics covered in the slides.
    3.  End with exactly 3 relevant and trending hashtags for the given niche. Do not use the '#' symbol before the hashtags.

    The content of the carousel slides is:
    {{#each postContents}}
    - "{{this}}"
    {{/each}}
    
    The niche is: "{{{niche}}}"
    
    Return the output as a JSON object with a 'caption' key.
    `,
});


const generateCarouselTextFlow = ai.defineFlow(
  {
    name: 'generateCarouselTextFlow',
    inputSchema: GenerateCarouselTextInputSchema,
    outputSchema: GenerateCarouselTextOutputSchema,
  },
  async (input) => {
    const { output } = await generateCarouselTextPrompt({
        ...input,
        isLatestNews: input.niche === 'Latest News',
    });
    const textOptions = output?.contentOptions || [];

    if (textOptions.length === 0) {
      return { contentOptions: [], overallCaption: '' };
    }

    const captionResult = await generateOverallCaptionPrompt({
      postContents: textOptions,
      niche: input.niche,
    });
    
    const rawCaption = captionResult.output?.caption || textOptions.join(' ');
    // Format hashtags
    const captionWithHashtags = rawCaption.replace(/(\w+)\s*(\w+)\s*(\w+)$/, '\n\n#$1 #$2 #$3');


    return { contentOptions: textOptions, overallCaption: captionWithHashtags };
  }
);
