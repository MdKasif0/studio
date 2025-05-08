import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Youtube, Lightbulb, CookingPot, HelpingHand } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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
      description: "Connect with registered dietitians for personalized one-on-one guidance and advanced support. (Coming Soon)",
      icon: HelpingHand,
      link: "#",
      image: "https://picsum.photos/seed/learnsupport/400/200",
      aiHint: "nutritionist consultation",
    },
  ];

  return (
    <div className="container mx-auto py-8">
      <header className="mb-12 text-center">
        <BookOpen className="mx-auto h-16 w-16 text-accent mb-4" />
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Knowledge & Support Hub</h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
          Expand your nutrition knowledge and find support. Explore articles, videos, guides, recipes, and future premium consultation options.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {resources.map((resource, index) => (
          <Card key={index} className="shadow-xl overflow-hidden flex flex-col">
            <div className="relative h-48 w-full">
              <Image
                src={resource.image}
                alt={resource.title}
                layout="fill"
                objectFit="cover"
                data-ai-hint={resource.aiHint}
              />
            </div>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <resource.icon className="h-7 w-7 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{resource.type}</p>
                  <CardTitle className="text-xl">{resource.title}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription className="h-20">{resource.description}</CardDescription>
            </CardContent>
            <CardContent className="mt-auto">
              <Link href={resource.link} passHref>
                <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 px-4 rounded-md transition-colors disabled:opacity-50" disabled>
                  {resource.type === "Premium Support" ? "Learn More (Coming Soon)" : "Read More (Coming Soon)"}
                </button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-center mt-12 text-sm text-muted-foreground">
        We're constantly adding new educational content and support features. Check back soon for more!
      </p>
    </div>
  );
}
