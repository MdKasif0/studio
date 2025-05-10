import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { BookOpen, Youtube, Lightbulb, CookingPot, HelpingHand } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learn Nutrition - Articles, Guides & Support | Nutri AI",
  description: "Expand your nutrition knowledge with Nutri AI's educational resources. Explore articles, videos, guides, recipes, and future premium consultation options.",
  keywords: ["nutrition education", "health articles", "cooking guides", "diet tips", "mindful eating", "Nutri AI learn"],
  openGraph: {
    title: "Nutri AI Knowledge & Support Hub",
    description: "Learn about nutrition, cooking, and healthy habits with our resources.",
    url: "https://example.com/learn", // Replace with your actual domain
  },
  twitter: {
    title: "Nutri AI Knowledge & Support Hub",
    description: "Explore educational content on nutrition and wellness.",
  },
};


export default function LearnPage() {
  const resources = [
    {
      type: "Article",
      title: "The Truth About Carbs: Friend or Foe?",
      description: "Debunk common myths about carbohydrates and learn how to incorporate them healthily into your diet.",
      icon: BookOpen,
      link: "#",
      image: "https://picsum.photos/seed/learn1/400/200",
      aiHint: "bread pasta",
    },
    {
      type: "Video",
      title: "Mastering Meal Prep: A Beginner's Guide",
      description: "Watch our expert chef demonstrate time-saving meal prep techniques for busy weekdays.",
      icon: Youtube,
      link: "#",
      image: "https://picsum.photos/seed/learn2/400/200",
      aiHint: "meal prep containers",
    },
    {
      type: "Guide",
      title: "Understanding Macronutrients: Protein, Carbs & Fats",
      description: "A comprehensive guide to what macronutrients are, why they matter, and how to balance them.",
      icon: Lightbulb,
      link: "#",
      image: "https://picsum.photos/seed/learn3/400/200",
      aiHint: "healthy fats protein",
    },
    {
      type: "Recipe Collection",
      title: "Quick & Healthy 30-Minute Dinners",
      description: "Explore a collection of delicious and nutritious dinner recipes you can make in 30 minutes or less.",
      icon: CookingPot,
      link: "#",
      image: "https://picsum.photos/seed/learn4/400/200",
      aiHint: "quick dinner",
    },
    {
      type: "Premium Support",
      title: "Expert Nutritionist Consultations",
      description: "Connect with registered dietitians for personalized one-on-one guidance and advanced support. (Nutri AI plans to offer this in the future)",
      icon: HelpingHand,
      link: "#",
      image: "https://picsum.photos/seed/learnsupport/400/200",
      aiHint: "nutritionist consultation",
    },
  ];

  return (
    <div className="container mx-auto py-4 md:py-8 animate-in fade-in duration-500">
      <header className="mb-8 md:mb-12 text-center">
        <BookOpen className="mx-auto h-12 w-12 md:h-16 md:w-16 text-accent mb-3 md:mb-4" />
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Knowledge & Support Hub</h1>
        <p className="mt-2 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          Expand your nutrition knowledge and find support. Explore articles, videos, guides, recipes, and future premium consultation options.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 animate-in fade-in-25 duration-700">
        {resources.map((resource, index) => (
          <Card key={index} className="shadow-xl overflow-hidden flex flex-col">
            <div className="relative h-40 md:h-48 w-full">
              <Image
                src={resource.image}
                alt={`Visual for ${resource.title}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                data-ai-hint={resource.aiHint}
                priority={index < 3}
                loading={index < 3 ? "eager" : "lazy"}
              />
            </div>
            <CardHeader className="p-4">
              <div className="flex items-start gap-2 md:gap-3 mb-1 md:mb-2">
                <resource.icon aria-hidden="true" className="h-6 w-6 md:h-7 md:w-7 text-primary mt-1" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{resource.type}</p>
                  <CardTitle className="text-lg md:text-xl leading-tight">{resource.title}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 flex-grow">
              <CardDescription className="h-16 md:h-20 text-sm">{resource.description}</CardDescription>
            </CardContent>
            <CardFooter className="p-4 mt-auto">
              <Link href={resource.link} passHref legacyBehavior>
                <Button 
                  asChild 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm" 
                  disabled={true} // Kept disabled as per original, update if functionality is added
                >
                  <a>{resource.type === "Premium Support" ? "Learn More (Soon)" : "Read More (Soon)"}</a>
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
      <p className="text-center mt-8 md:mt-12 text-xs md:text-sm text-muted-foreground">
        We're constantly adding new educational content and support features. Check back soon for more!
      </p>
    </div>
  );
}