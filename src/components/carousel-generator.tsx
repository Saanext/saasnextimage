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
  Share2,
  Slice,
  Box,
  Bold
} from "lucide-react";

import {
  generateCarouselPost,
  type GenerateCarouselPostInput,
  type GenerateCarouselPostOutput,
} from "@/ai/flows/generate-carousel-post";
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
] as const;

const FormSchema = z.object({
  niche: z.enum(["Web Development", "Lead Generation", "AI Solutions", "CEO Diary"], {
    required_error: "You need to select a niche.",
  }),
  imageStyle: z.enum(["Minimal", "3D Art", "Bold Typographic"], {
    required_error: "You need to select an image style.",
  }),
  userIdeas: z.string().optional(),
});

export function CarouselGenerator() {
  const { toast } = useToast();
  const [generatedContent, setGeneratedContent] = React.useState<GenerateCarouselPostOutput | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    setGeneratedContent(null);
    try {
      const result = await generateCarouselPost(data as GenerateCarouselPostInput);
      setGeneratedContent(result);
    } catch (error) {
      console.error("Failed to generate content:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate content. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleShare = async (content: string) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "SAASNEXT Carousel Post",
          text: content,
        });
      } else {
        await navigator.clipboard.writeText(content);
        toast({
          title: "Copied to clipboard!",
          description: "Post content has been copied.",
        });
      }
    } catch (error) {
      console.error("Failed to share:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not share or copy content.",
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
          <form onSubmit={form.handleSubmit(onSubmit)}>
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
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
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
        <Card className="h-full min-h-[500px] flex flex-col justify-center items-center shadow-lg">
          {isLoading && (
            <div className="flex flex-col items-center gap-4 text-muted-foreground">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="font-semibold">Generating creative posts...</p>
              <p>This may take a moment.</p>
            </div>
          )}

          {!isLoading && !generatedContent && (
             <div className="text-center text-muted-foreground p-8">
                <SaasNextLogo className="h-20 w-auto mx-auto text-primary opacity-20" />
                <h3 className="mt-4 text-2xl font-semibold text-foreground">Your posts will appear here</h3>
                <p>Select a niche and style, then click "Generate Content" to start.</p>
            </div>
          )}
          
          {!isLoading && generatedContent && (
             <Carousel className="w-full max-w-sm mx-auto" opts={{ loop: true }}>
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
                         <Button variant="outline" size="icon" onClick={() => handleShare(item.content)}>
                           <Share2 className="h-5 w-5" />
                           <span className="sr-only">Share</span>
                         </Button>
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
          )}
        </Card>
      </div>
    </div>
  );
}
