"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { Separator } from "@/components/ui/separator";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { auth, db } from "../../../../../service/firebase.config";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import {
  Loader2,
  ArrowLeft,
  Sparkles,
  Lightbulb,
  Clock,
  ChevronRight,
  Palette,
  Type,
  MessageSquare,
  Layout,
} from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { apikey } from "@/app/Utils/gemini";

const genAI = new GoogleGenerativeAI(apikey);

interface Idea {
  id: string;
  title: string;
  body: string;
  createdAt: any;
}

interface BrandKit {
  name: string;
  tagline: string;
  description: string;
  usp: string[];
  brandVoice: {
    tone: string;
    personality: string[];
    keywords: string[];
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    gradients: string[];
  };
  typography: {
    heading: string;
    body: string;
    display: string;
    weights: {
      light: string;
      regular: string;
      medium: string;
      bold: string;
    };
  };
  logo: {
    concept: string;
    style: string;
    elements: string[];
    variations: string[];
    usage: string[];
  };
  ui: {
    style: string;
    components: string[];
    layout: string;
    spacing: string;
    shadows: string[];
    animations: string[];
  };
  marketing: {
    socialMedia: {
      platforms: string[];
      tone: string;
      contentTypes: string[];
    };
    messaging: {
      headlines: string[];
      callsToAction: string[];
      valueProps: string[];
    };
  };
}

export default function BrandKit() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingBrandKit, setLoadingBrandKit] = useState(false);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [brandKit, setBrandKit] = useState<BrandKit | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        try {
          const docRef = doc(db, "users", authUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUser({
              auth: authUser,
              firestore: userData,
            });
            // Fetch user's ideas
            const ideasQuery = query(
              collection(db, "ideas"),
              where("ownerId", "==", authUser.uid)
            );
            const ideasSnapshot = await getDocs(ideasQuery);
            const ideasList = ideasSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as Idea[];
            setIdeas(ideasList);
          } else {
            setUser({
              auth: authUser,
              firestore: null,
            });
          }
        } catch (error) {
          console.error("Error fetching Firestore user data:", error);
          toast.error("Failed to fetch user data");
        } finally {
          setLoading(false);
        }
      } else {
        router.replace("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const fetchIdea = async () => {
      const ideaId = params?.id || searchParams?.get("id");

      if (ideaId) {
        setLoadingBrandKit(true);
        try {
          const ideaRef = doc(db, "ideas", ideaId as string);
          const ideaSnap = await getDoc(ideaRef);

          if (ideaSnap.exists()) {
            const ideaData = ideaSnap.data();
            setSelectedIdea({
              id: ideaSnap.id,
              ...ideaData,
            } as Idea);
            await generateBrandKit(ideaData.body);
          } else {
            toast.error("Idea not found");
            router.push("/dashboard/ai/brandkit");
          }
        } catch (error) {
          console.error("Error fetching idea:", error);
          toast.error("Failed to fetch idea");
          router.push("/dashboard/ai/brandkit");
        } finally {
          setLoadingBrandKit(false);
        }
      }
    };

    fetchIdea();
  }, [params?.id, searchParams, router]);

  const generateBrandKit = async (ideaContent: string) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = `As a brand strategist and designer, create a comprehensive brand kit for the following business idea:

${ideaContent}

Generate a detailed brand kit in JSON format (without any markdown formatting or code blocks) with the following structure:
{
  "name": "A catchy, memorable brand name",
  "tagline": "A compelling tagline that captures the essence",
  "description": "A concise brand description",
  "usp": ["Unique selling point 1", "Unique selling point 2", "Unique selling point 3"],
  "brandVoice": {
    "tone": "The overall tone of voice for the brand",
    "personality": ["Key personality traits", "Brand characteristics"],
    "keywords": ["Important brand keywords", "Key messaging terms"]
  },
  "colors": {
    "primary": "Main brand color (hex code)",
    "secondary": "Secondary brand color (hex code)",
    "accent": "Accent color (hex code)",
    "background": "Background color (hex code)",
    "text": "Text color (hex code)",
    "gradients": ["Gradient combination 1", "Gradient combination 2"]
  },
  "typography": {
    "heading": "Recommended heading font",
    "body": "Recommended body font",
    "display": "Recommended display font",
    "weights": {
      "light": "Light weight usage",
      "regular": "Regular weight usage",
      "medium": "Medium weight usage",
      "bold": "Bold weight usage"
    }
  },
  "logo": {
    "concept": "Logo concept description",
    "style": "Logo style description",
    "elements": ["Key visual elements for the logo"],
    "variations": ["Different logo variations"],
    "usage": ["Logo usage guidelines"]
  },
  "ui": {
    "style": "Overall UI style description",
    "components": ["Key UI components and their style"],
    "layout": "Layout approach and structure",
    "spacing": "Spacing system and guidelines",
    "shadows": ["Shadow styles and usage"],
    "animations": ["Animation guidelines and examples"]
  },
  "marketing": {
    "socialMedia": {
      "platforms": ["Recommended social media platforms"],
      "tone": "Social media voice and tone",
      "contentTypes": ["Types of content to create"]
    },
    "messaging": {
      "headlines": ["Example headlines"],
      "callsToAction": ["Example CTAs"],
      "valueProps": ["Key value propositions"]
    }
  }
}

Focus on creating a cohesive, modern, and professional brand identity that aligns with the business idea. Provide specific, actionable recommendations that can be implemented immediately.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Clean the response text to ensure it's valid JSON
      const cleanText = text.replace(/```json\n?|\n?```/g, "").trim();

      try {
        const brandKitData = JSON.parse(cleanText);
        setBrandKit(brandKitData);
      } catch (parseError) {
        console.error("Error parsing brand kit JSON:", parseError);
        toast.error("Failed to parse brand kit data");
      }
    } catch (error) {
      console.error("Error generating brand kit:", error);
      toast.error("Failed to generate brand kit");
    }
  };

  const handleIdeaSelect = async (idea: Idea) => {
    setSelectedIdea(idea);
    setLoadingBrandKit(true);
    await generateBrandKit(idea.body);
    setLoadingBrandKit(false);
  };

  const handleDownloadReport = async () => {
    try {
      // const element = document.getElementById("brand-kit-content");
      // if (!element) return;

      // const canvas = await html2canvas(element, {
      //   scale: 2,
      //   useCORS: true,
      //   logging: false,
      // });

      // const imgData = canvas.toDataURL("image/png");
      // const pdf = new jsPDF({
      //   orientation: "portrait",
      //   unit: "mm",
      //   format: "a4",
      // });

      // const imgWidth = 210; // A4 width in mm
      // const imgHeight = (canvas.height * imgWidth) / canvas.width;
      // let position = 0;

      // pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);

      // // Add title page
      // pdf.insertPage(1);
      // pdf.setFontSize(24);
      // pdf.text("Brand Kit Report", 105, 50, { align: "center" });
      // pdf.setFontSize(16);
      // pdf.text(brandKit?.name || "", 105, 60, { align: "center" });
      // pdf.setFontSize(12);
      // pdf.text(brandKit?.tagline || "", 105, 70, { align: "center" });
      // pdf.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 80, {
      //   align: "center",
      // });

      // pdf.save(
      //   `${brandKit?.name.toLowerCase().replace(/\s+/g, "-")}-brand-kit.pdf`
      // );
      toast.error("Failed to generate PDF report");
      // toast.success("Brand kit report downloaded successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF report");
    }
  };

  if (loading || loadingBrandKit) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-muted/10">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            {loadingBrandKit
              ? "Generating brand kit..."
              : "Loading your ideas..."}
          </p>
        </div>
      </div>
    );
  }

  if (!selectedIdea) {
    return (
      <SidebarProvider>
        <AppSidebar user={user} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <span className="text-lg font-medium">Brand Kit Generator</span>
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
            <div className="bg-gradient-to-b from-muted/50 to-background rounded-xl p-6 shadow-sm">
              <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-3">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-2">
                    <Palette className="h-8 w-8 text-primary" />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Select an Idea
                  </h1>
                  <p className="text-muted-foreground text-lg max-w-md mx-auto">
                    Choose an idea to generate a complete brand kit
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {ideas.length > 0 ? (
                    ideas.map((idea) => (
                      <Card
                        key={idea.id}
                        className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all duration-300 overflow-hidden group"
                        onClick={() => handleIdeaSelect(idea)}
                      >
                        <CardHeader className="">
                          <div className="flex justify-between items-start">
                            <CardTitle className="flex items-center gap-2 text-base font-medium text-foreground/90">
                              <Lightbulb className="h-4 w-4 text-primary" />
                              <span className="line-clamp-1">{idea.title}</span>
                            </CardTitle>
                            <Badge
                              variant="outline"
                              className="bg-background/80"
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              {new Date(
                                idea.createdAt?.toDate()
                              ).toLocaleDateString()}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="">
                          <div className="text-sm text-muted-foreground line-clamp-3 prose prose-sm">
                            <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                              {idea.body}
                            </ReactMarkdown>
                          </div>
                        </CardContent>
                        <CardFooter className="pt-0 pb-3 flex justify-between items-center">
                          <p className="text-xs text-muted-foreground">
                            Created{" "}
                            {new Date(
                              idea.createdAt?.toDate()
                            ).toLocaleTimeString()}
                          </p>
                          <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </CardFooter>
                      </Card>
                    ))
                  ) : (
                    <Card className="col-span-full p-6 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                          <Sparkles className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <CardTitle>No ideas yet</CardTitle>
                        <CardDescription>
                          Create your first idea to get started
                        </CardDescription>
                        <Button
                          className="mt-2"
                          onClick={() => router.push("/dashboard")}
                        >
                          Create Idea
                        </Button>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <header className="flex h-14 md:h-16 shrink-0 items-center justify-between gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-2 px-2 md:px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <div className="flex items-center gap-1.5">
              <Palette className="h-4 w-4 text-primary" />
              <span className="text-base md:text-lg font-medium">
                Brand Kit
              </span>
              <Badge variant="outline" className="ml-2 hidden sm:inline-flex">
                <Lightbulb className="h-3 w-3 mr-1 text-amber-500" />
                {selectedIdea.title.length > 20
                  ? selectedIdea.title.substring(0, 20) + "..."
                  : selectedIdea.title}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1 md:gap-2 px-2 md:px-4">
            {/* <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadReport}
              className="gap-1 md:gap-2 h-8 md:h-9"
            >
              <Download className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Download</span>
            </Button> */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIdea(null)}
              className="text-muted-foreground hover:text-foreground h-8 md:h-9"
            >
              <ArrowLeft className="mr-1 h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          </div>
        </header>

        <ScrollArea className="h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)]">
          <div
            id="brand-kit-content"
            className="p-3 md:p-6 space-y-4 md:space-y-8"
          >
            {/* Brand Identity Section */}
            <Card className="overflow-hidden">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Type className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  Brand Identity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-medium mb-1 md:mb-2">
                      Brand Name
                    </h3>
                    <p className="text-xl md:text-2xl font-bold">
                      {brandKit?.name}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1 md:mb-2">
                      Tagline
                    </h3>
                    <p className="text-base md:text-lg text-muted-foreground">
                      {brandKit?.tagline}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1 md:mb-2">
                    Description
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground">
                    {brandKit?.description}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1 md:mb-2">
                    Unique Selling Points
                  </h3>
                  <ul className="list-disc list-inside space-y-1 md:space-y-2">
                    {brandKit?.usp.map((point, index) => (
                      <li
                        key={index}
                        className="text-sm md:text-base text-muted-foreground"
                      >
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Brand Voice Section */}
            <Card className="overflow-hidden">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <MessageSquare className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  Brand Voice
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-medium mb-1 md:mb-2">Tone</h3>
                    <p className="text-sm md:text-base text-muted-foreground">
                      {brandKit?.brandVoice.tone}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1 md:mb-2">
                      Personality Traits
                    </h3>
                    <div className="flex flex-wrap gap-1.5 md:gap-2">
                      {brandKit?.brandVoice.personality.map((trait, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs md:text-sm"
                        >
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1 md:mb-2">Keywords</h3>
                  <div className="flex flex-wrap gap-1.5 md:gap-2">
                    {brandKit?.brandVoice.keywords.map((keyword, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs md:text-sm"
                      >
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Visual Identity Section */}
            <Card className="overflow-hidden">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Palette className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  Visual Identity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 space-y-6 md:space-y-8">
                {/* Colors */}
                <div>
                  <h3 className="text-sm font-medium mb-3 md:mb-4">
                    Color Palette
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                    {brandKit?.colors &&
                      Object.entries(brandKit.colors).map(([key, value]) => (
                        <div key={key} className="space-y-1.5 md:space-y-2">
                          {typeof value === "string" && (
                            <div
                              className="h-16 md:h-24 rounded-lg shadow-sm"
                              style={{ backgroundColor: value }}
                            />
                          )}
                          <div>
                            <p className="text-xs md:text-sm font-medium capitalize">
                              {key}
                            </p>
                            <p className="text-xs md:text-sm text-muted-foreground">
                              {value}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Typography */}
                <div>
                  <h3 className="text-sm font-medium mb-3 md:mb-4">
                    Typography
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="text-xs md:text-sm font-medium mb-1 md:mb-2">
                        Heading Font
                      </h4>
                      <p
                        className="text-lg md:text-2xl"
                        style={{ fontFamily: brandKit?.typography.heading }}
                      >
                        {brandKit?.typography.heading}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-xs md:text-sm font-medium mb-1 md:mb-2">
                        Body Font
                      </h4>
                      <p
                        className="text-base md:text-lg"
                        style={{ fontFamily: brandKit?.typography.body }}
                      >
                        {brandKit?.typography.body}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Logo */}
                <div>
                  <h3 className="text-sm font-medium mb-3 md:mb-4">
                    Logo Design
                  </h3>
                  <div className="space-y-3 md:space-y-4">
                    <div>
                      <h4 className="text-xs md:text-sm font-medium mb-1 md:mb-2">
                        Concept
                      </h4>
                      <p className="text-sm md:text-base text-muted-foreground">
                        {brandKit?.logo.concept}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-xs md:text-sm font-medium mb-1 md:mb-2">
                        Style
                      </h4>
                      <p className="text-sm md:text-base text-muted-foreground">
                        {brandKit?.logo.style}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-xs md:text-sm font-medium mb-1 md:mb-2">
                        Key Elements
                      </h4>
                      <div className="flex flex-wrap gap-1.5 md:gap-2">
                        {brandKit?.logo.elements.map((element, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs md:text-sm"
                          >
                            {element}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* UI Design Section */}
            <Card className="overflow-hidden">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Layout className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  UI Design
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-medium mb-1 md:mb-2">Style</h3>
                    <p className="text-sm md:text-base text-muted-foreground">
                      {brandKit?.ui.style}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1 md:mb-2">Layout</h3>
                    <p className="text-sm md:text-base text-muted-foreground">
                      {brandKit?.ui.layout}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1 md:mb-2">
                    Components
                  </h3>
                  <div className="flex flex-wrap gap-1.5 md:gap-2">
                    {brandKit?.ui.components.map((component, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs md:text-sm"
                      >
                        {component}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Marketing Section */}
            <Card className="overflow-hidden">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  Marketing Strategy
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-medium mb-1 md:mb-2">
                      Social Media
                    </h3>
                    <div className="space-y-3 md:space-y-4">
                      <div>
                        <h4 className="text-xs md:text-sm font-medium mb-1">
                          Platforms
                        </h4>
                        <div className="flex flex-wrap gap-1.5 md:gap-2">
                          {brandKit?.marketing.socialMedia.platforms.map(
                            (platform, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs md:text-sm"
                              >
                                {platform}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs md:text-sm font-medium mb-1">
                          Tone
                        </h4>
                        <p className="text-sm md:text-base text-muted-foreground">
                          {brandKit?.marketing.socialMedia.tone}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1 md:mb-2">
                      Messaging
                    </h3>
                    <div className="space-y-3 md:space-y-4">
                      <div>
                        <h4 className="text-xs md:text-sm font-medium mb-1">
                          Headlines
                        </h4>
                        <ul className="list-disc list-inside space-y-1">
                          {brandKit?.marketing.messaging.headlines.map(
                            (headline, index) => (
                              <li
                                key={index}
                                className="text-sm md:text-base text-muted-foreground"
                              >
                                {headline}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-xs md:text-sm font-medium mb-1">
                          Calls to Action
                        </h4>
                        <div className="flex flex-wrap gap-1.5 md:gap-2">
                          {brandKit?.marketing.messaging.callsToAction.map(
                            (cta, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs md:text-sm"
                              >
                                {cta}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </SidebarInset>
    </SidebarProvider>
  );
}
