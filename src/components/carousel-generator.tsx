"use client";

import * as React from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  BookUser,
  BrainCircuit,
  Code,
  Download,
  Filter,
  Loader2,
  Copy,
  Slice,
  Box,
  Bold,
  Image as ImageIcon,
  Newspaper,
} from "lucide-react";

import {
  generateCarouselText,
  type GenerateCarouselTextInput,
  type GenerateCarouselTextOutput,
} from "@/ai/flows/generate-carousel-post";
import {
  generateCarouselImages,
  type GenerateCarouselImagesInput,
} from "@/ai/flows/generate-carousel-images";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { SaasNextLogo } from "./icons";
import { Textarea } from "./ui/textarea";

const NICHES = [
  {
    value: "Web Development",
    label: "Web Development",
    icon: Code,
    description: "Code, frameworks, and best practices.",
  },
  {
    value: "Lead Generation",
    label: "Lead Generation",
    icon: Filter,
    description: "Strategies to attract and convert leads.",
  },
  {
    value: "AI Solutions",
    label: "AI Solutions",
    icon: BrainCircuit,
    description: "Cutting-edge AI and machine learning.",
  },
  {
    value: "CEO Diary",
    label: "CEO Diary",
    icon: BookUser,
    description: "Insights from the life of a CEO.",
  },
  {
    value: "Latest News",
    label: "Latest News",
    icon: Newspaper,
    description: "Breaking news and current events.",
  },
] as const;

const STYLES = [
  {
    value: "Minimal",
    label: "Minimal",
    icon: Slice,
    description: "Clean, simple, and elegant design.",
  },
  {
    value: "3D Art",
    label: "3D Art",
    icon: Box,
    description: "Vibrant and eye-catching 3D graphics.",
  },
  {
    value: "Bold Typographic",
    label: "Bold Typographic",
    icon: Bold,
    description: "Text-focused, impactful, and modern.",
  },
  {
    value: "Realistic",
    label: "Realistic",
    icon: ImageIcon,
    description: "Photorealistic images of your niche.",
  },
  {
    value: "3D Newspaper",
    label: "3D Newspaper",
    icon: Newspaper,
    description: "Headline-style 3D newspaper graphics.",
  },
] as const;

const FormSchema = z.object({
  niche: z.enum(["Web Development", "Lead Generation", "AI Solutions", "CEO Diary", "Latest News"], {
    required_error: "You need to select a niche.",
  }),
  imageStyle: z.enum(["Minimal", "3D Art", "Bold Typographic", "Realistic", "3D Newspaper"], {
    required_error: "You need to select an image style.",
  }),
  userIdeas: z.string().optional(),
});

type FinalGeneratedContent = {
  contentOptions: {
    content: string;
    image: string;
  }[];
  overallCaption: string;
};

export function CarouselGenerator() {
  const { toast } = useToast();
  const [generatedContent, setGeneratedContent] = React.useState<FinalGeneratedContent | null>(null);
  const [generatedText, setGeneratedText] = React.useState<GenerateCarouselTextOutput | null>(null);
  const [isLoadingText, setIsLoadingText] = React.useState(false);
  const [isGeneratingImages, setIsGeneratingImages] = React.useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  async function onGenerateText(data: z.infer<typeof FormSchema>) {
    setIsLoadingText(true);
    setGeneratedText(null);
    setGeneratedContent(null);
    try {
      const result = await generateCarouselText({
        niche: data.niche,
        userIdeas: data.userIdeas,
      });
      setGeneratedText(result);
    } catch (error) {
      console.error("Failed to generate content:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate text content. Please try again.",
      });
    } finally {
      setIsLoadingText(false);
    }
  }
  
  async function onGenerateImages() {
    const { imageStyle, niche } = form.getValues();
    if (!generatedText || !imageStyle) {
      toast({
        variant: "destructive",
        title: "Image Style Required",
        description: "Please select an image style before generating images.",
      });
      return;
    }

    setIsGeneratingImages(true);
    setGeneratedContent(null);
    try {
      const imageResult = await generateCarouselImages({
        contentOptions: generatedText.contentOptions,
        imageStyle: imageStyle,
        niche,
      });

      const finalContent: FinalGeneratedContent = {
        overallCaption: generatedText.overallCaption,
        contentOptions: generatedText.contentOptions.map((content, index) => ({
          content: content,
          image: imageResult.imageOptions[index].image,
        })),
      };
      setGeneratedContent(finalContent);

    } catch (error) {
      console.error("Failed to generate images:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate images. Please try again.",
      });
    } finally {
      setIsGeneratingImages(false);
    }
  }


  const handleCopyCaption = async (caption: string) => {
    try {
      await navigator.clipboard.writeText(caption);
      toast({
        title: "Copied to clipboard!",
        description: "The caption has been copied.",
      });
    } catch (error) {
      console.error("Failed to copy:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not copy caption.",
      });
    }
  };

  const handleSave = (imageUrl: string, index: number) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `saasnext-post-image-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: "Image saved!",
      description: "The post image has been downloaded.",
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <Card className="lg:col-span-1 h-fit shadow-lg">
        <CardHeader>
          <CardTitle>Customize Your Post</CardTitle>
          <CardDescription>
            Select a topic, style and provide your ideas to generate posts.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onGenerateText)}>
            <CardContent>
              <FormField
                control={form.control}
                name="niche"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Niche</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        {NICHES.map((niche) => (
                          <FormItem key={niche.value}>
                            <FormLabel
                              className={cn(
                                "flex items-center space-x-3 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                              )}
                            >
                              <FormControl>
                                <RadioGroupItem value={niche.value} className="sr-only peer" />
                              </FormControl>
                              <niche.icon className="h-6 w-6 text-primary" />
                              <div className="flex-1">
                                <span className="block font-semibold">{niche.label}</span>
                                <span className="block text-sm text-muted-foreground">{niche.description}</span>
                              </div>
                            </FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imageStyle"
                render={({ field }) => (
                  <FormItem className="mt-6">
                    <FormLabel className="text-base font-semibold">Image Style</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        {STYLES.map((style) => (
                          <FormItem key={style.value}>
                            <FormLabel
                              className={cn(
                                "flex items-center space-x-3 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                              )}
                            >
                              <FormControl>
                                <RadioGroupItem value={style.value} className="sr-only peer" />
                              </FormControl>
                              <style.icon className="h-6 w-6 text-primary" />
                              <div className="flex-1">
                                <span className="block font-semibold">{style.label}</span>
                                <span className="block text-sm text-muted-foreground">{style.description}</span>
                              </div>
                            </FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="userIdeas"
                render={({ field }) => (
                  <FormItem className="mt-6">
                    <FormLabel>Your Ideas (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'A post about the top 5 javascript frameworks' or 'why AI is the future of marketing'"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoadingText || isGeneratingImages}>
                {isLoadingText ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Text...
                  </>
                ) : (
                  "Generate Content"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      
      <div className="lg:col-span-2">
        <Card className="h-full min-h-[500px] flex flex-col justify-center items-center shadow-lg p-4">
          {isLoadingText && (
            <div className="flex flex-col items-center gap-4 text-muted-foreground">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="font-semibold">Generating creative text...</p>
              <p>This may take a moment.</p>
            </div>
          )}

          {!isLoadingText && !generatedContent && generatedText && (
            <div className="w-full max-w-md mx-auto flex flex-col gap-4">
              <Card>
                  <CardHeader>
                    <CardTitle>Generated Content</CardTitle>
                    <CardDescription>Review the generated text below. When you're ready, click "Generate Images" to create the visuals for your posts.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {generatedText.contentOptions.map((text, index) => (
                      <div key={index} className="p-3 border rounded-md bg-muted/50">
                        <p className="font-semibold">Post {index + 1}</p>
                        <p className="text-sm text-muted-foreground">{text}</p>
                      </div>
                    ))}
                  </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Generated Caption</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {generatedText.overallCaption}
                  </p>
                </CardContent>
              </Card>
               <Button className="w-full" onClick={onGenerateImages} disabled={isGeneratingImages}>
                {isGeneratingImages ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Images...
                  </>
                ) : (
                  <>
                  <ImageIcon className="mr-2 h-4 w-4"/>
                  Generate Images
                  </>
                )}
              </Button>
            </div>
          )}
          
          {isGeneratingImages && (
            <div className="flex flex-col items-center gap-4 text-muted-foreground">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="font-semibold">Generating your images...</p>
              <p>The AI is getting creative now.</p>
            </div>
          )}

          {!isLoadingText && !isGeneratingImages && !generatedText && !generatedContent && (
             <div className="text-center text-muted-foreground p-4 sm:p-8">
                <SaasNextLogo className="h-20 w-auto mx-auto text-primary opacity-20" />
                <h3 className="mt-4 text-2xl font-semibold text-foreground">Your posts will appear here</h3>
                <p>Select a niche and style, then click "Generate Content" to start.</p>
            </div>
          )}
          
          {generatedContent && (
            <div className="w-full max-w-sm mx-auto flex flex-col gap-4">
              <Carousel className="w-full" opts={{ loop: true }}>
                <CarouselContent>
                  {generatedContent.contentOptions.map((item, index) => (
                    <CarouselItem key={index}>
                      <div className="p-1">
                        <Card className="bg-background overflow-hidden">
                          <CardContent className="relative p-0 aspect-[2/3]">
                              <Image
                                src={item.image}
                                alt={`Generated image for post: ${item.content}`}
                                fill
                                className="object-cover"
                              />
                          </CardContent>
                          <CardFooter className="flex justify-center gap-4 py-4">
                            <Button variant="outline" size="icon" onClick={() => handleSave(item.image, index)}>
                              <Download className="h-5 w-5" />
                              <span className="sr-only">Save Image</span>
                            </Button>
                          </CardFooter>
                        </Card>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="text-foreground" />
                <CarouselNext className="text-foreground" />
              </Carousel>
              <Card className="bg-background">
                <CardHeader>
                  <CardTitle>Generated Caption</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {generatedContent.overallCaption}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={() => handleCopyCaption(generatedContent.overallCaption)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Caption
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
