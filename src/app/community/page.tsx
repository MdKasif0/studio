
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, MessageCircle, ThumbsUp, PlusCircle, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function CommunityPage() {
  const trendingPosts = [
    {
      id: 1,
      user: "NutritionNinja",
      avatar: "https://picsum.photos/seed/avatar1/40/40",
      aiHint: "profile avatar",
      title: "My 30-Day Healthy Eating Transformation!",
      excerpt: "Just completed the 30-day challenge and feeling amazing. Lost 5lbs and my energy is through the roof! Here are some tips...",
      likes: 125,
      comments: 23,
      image: "https://picsum.photos/seed/post1/600/300",
      imageAiHint: "healthy meal",
    },
    {
      id: 2,
      user: "VeggieVictor",
      avatar: "https://picsum.photos/seed/avatar2/40/40",
      aiHint: "user avatar",
      title: "Best Vegan Protein Sources - Let's Discuss!",
      excerpt: "I'm always on the lookout for new vegan protein ideas. What are your go-to's? Sharing my favorite tofu scramble recipe below.",
      likes: 88,
      comments: 42,
      image: "https://picsum.photos/seed/post2/600/300",
      imageAiHint: "vegan food",
    },
  ];

  const activeGroups = [
    { id: 1, name: "Weight Loss Warriors", members: 234, image: "https://picsum.photos/seed/group1/100/100", aiHint: "fitness group" },
    { id: 2, name: "Gluten-Free Gourmets", members: 156, image: "https://picsum.photos/seed/group2/100/100", aiHint: "gluten free" },
    { id: 3, name: "Meal Prep Masters", members: 402, image: "https://picsum.photos/seed/group3/100/100", aiHint: "meal prep containers" },
  ];

  return (
    <div className="container mx-auto py-4 md:py-8">
      <header className="mb-8 md:mb-12 text-center">
        <Users className="mx-auto h-12 w-12 md:h-16 md:w-16 text-accent mb-3 md:mb-4" />
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">NutriCoach Community Hub</h1>
        <p className="mt-2 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          Connect with fellow health enthusiasts! Share recipes, celebrate successes, find support, and join group challenges.
        </p>
        <Button size="lg" className="mt-4 md:mt-6 bg-accent hover:bg-accent/90 text-accent-foreground text-sm md:text-base" disabled>
          <PlusCircle className="mr-2 h-4 w-4 md:h-5 md:w-5" /> Create New Post (Coming Soon)
        </Button>
      </header>

      <section className="mb-8 md:mb-12">
        <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-primary flex items-center">
          <TrendingUp className="mr-2 h-5 w-5 md:h-6 md:w-6" /> Trending Discussions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {trendingPosts.map((post) => (
            <Card key={post.id} className="shadow-xl overflow-hidden">
              {post.image && (
                <div className="relative h-40 md:h-48 w-full">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    data-ai-hint={post.imageAiHint}
                  />
                </div>
              )}
              <CardHeader className="p-4">
                <div className="flex items-center space-x-2 md:space-x-3 mb-2">
                  <Avatar className="h-8 w-8 md:h-10 md:w-10">
                    <AvatarImage src={post.avatar} alt={post.user} data-ai-hint={post.aiHint} />
                    <AvatarFallback>{post.user.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg md:text-xl">{post.title}</CardTitle>
                    <p className="text-xs text-muted-foreground">Posted by {post.user}</p>
                  </div>
                </div>
                <CardDescription className="h-16 md:h-20 overflow-hidden text-sm">{post.excerpt}</CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-between items-center text-xs md:text-sm text-muted-foreground p-4">
                <div className="flex items-center space-x-3 md:space-x-4">
                  <span className="flex items-center"><ThumbsUp className="h-4 w-4 mr-1 text-primary" /> {post.likes}</span>
                  <span className="flex items-center"><MessageCircle className="h-4 w-4 mr-1 text-primary" /> {post.comments}</span>
                </div>
                <Button variant="outline" size="sm" asChild disabled>
                  <Link href="#">Read More</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-primary">Active Groups</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {activeGroups.map((group) => (
            <Card key={group.id} className="shadow-lg text-center">
              <CardContent className="p-4 md:p-6">
                <Avatar className="h-16 w-16 md:h-20 md:w-20 mx-auto mb-3 md:mb-4">
                  <AvatarImage src={group.image} alt={group.name} data-ai-hint={group.aiHint}/>
                  <AvatarFallback>{group.name.substring(0,1)}</AvatarFallback>
                </Avatar>
                <h3 className="text-md md:text-lg font-medium text-foreground">{group.name}</h3>
                <p className="text-xs md:text-sm text-muted-foreground mb-2 md:mb-3">{group.members} members</p>
                <Button variant="ghost" className="w-full border border-primary text-primary hover:bg-primary/10 text-sm" disabled>
                  Join Group (Coming Soon)
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      <p className="text-center mt-8 md:mt-12 text-xs md:text-sm text-muted-foreground">
        Full community features including posting, commenting, and group interactions are under development. Stay tuned!
      </p>
    </div>
  );
}
