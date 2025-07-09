import { CarouselGenerator } from "@/components/carousel-generator";
import { SaasNextLogo } from "@/components/icons";

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <div className="inline-block">
             <SaasNextLogo className="h-12 w-auto text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-headline font-bold mt-4 text-foreground">
            Social Post Carousel Generator
          </h1>
          <p className="text-muted-foreground mt-2">
            Select a niche to generate engaging carousel posts for your social media.
          </p>
        </header>
        <CarouselGenerator />
      </div>
    </main>
  );
}
