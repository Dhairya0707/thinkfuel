"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { auth, db } from "../../../../../service/firebase.config";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Loader2,
  BookOpen,
  FileText,
  Users,
  Shield,
  Code,
  Layout,
  Sparkles,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { doc, getDoc } from "firebase/firestore";

export default function Guidelines() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-muted/10">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading guidelines...</p>
        </div>
      </div>
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
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="text-base md:text-lg font-medium">
                Guidelines
              </span>
            </div>
          </div>
        </header>

        <ScrollArea className="h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)]">
          <div className="p-3 md:p-6 space-y-4 md:space-y-8">
            {/* Design Guidelines */}
            <Card className="overflow-hidden">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Layout className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  Design Guidelines
                </CardTitle>
                <CardDescription>
                  Best practices and standards for UI/UX design
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-medium mb-1 md:mb-2">
                      Color Usage
                    </h3>
                    <ul className="list-disc list-inside space-y-1 md:space-y-2">
                      <li className="text-sm md:text-base text-muted-foreground">
                        Use primary colors for main actions
                      </li>
                      <li className="text-sm md:text-base text-muted-foreground">
                        Secondary colors for supporting elements
                      </li>
                      <li className="text-sm md:text-base text-muted-foreground">
                        Accent colors for highlights and emphasis
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1 md:mb-2">
                      Typography
                    </h3>
                    <ul className="list-disc list-inside space-y-1 md:space-y-2">
                      <li className="text-sm md:text-base text-muted-foreground">
                        Use consistent font sizes
                      </li>
                      <li className="text-sm md:text-base text-muted-foreground">
                        Maintain proper hierarchy
                      </li>
                      <li className="text-sm md:text-base text-muted-foreground">
                        Ensure readability
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Development Guidelines */}
            <Card className="overflow-hidden">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Code className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  Development Guidelines
                </CardTitle>
                <CardDescription>
                  Coding standards and best practices
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-medium mb-1 md:mb-2">
                      Code Structure
                    </h3>
                    <ul className="list-disc list-inside space-y-1 md:space-y-2">
                      <li className="text-sm md:text-base text-muted-foreground">
                        Follow component-based architecture
                      </li>
                      <li className="text-sm md:text-base text-muted-foreground">
                        Use proper file organization
                      </li>
                      <li className="text-sm md:text-base text-muted-foreground">
                        Implement error handling
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1 md:mb-2">
                      Performance
                    </h3>
                    <ul className="list-disc list-inside space-y-1 md:space-y-2">
                      <li className="text-sm md:text-base text-muted-foreground">
                        Optimize bundle size
                      </li>
                      <li className="text-sm md:text-base text-muted-foreground">
                        Implement lazy loading
                      </li>
                      <li className="text-sm md:text-base text-muted-foreground">
                        Use proper caching strategies
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Guidelines */}
            <Card className="overflow-hidden">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Shield className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  Security Guidelines
                </CardTitle>
                <CardDescription>
                  Security best practices and protocols
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-medium mb-1 md:mb-2">
                      Authentication
                    </h3>
                    <ul className="list-disc list-inside space-y-1 md:space-y-2">
                      <li className="text-sm md:text-base text-muted-foreground">
                        Implement secure authentication
                      </li>
                      <li className="text-sm md:text-base text-muted-foreground">
                        Use proper session management
                      </li>
                      <li className="text-sm md:text-base text-muted-foreground">
                        Enable 2FA where possible
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1 md:mb-2">
                      Data Protection
                    </h3>
                    <ul className="list-disc list-inside space-y-1 md:space-y-2">
                      <li className="text-sm md:text-base text-muted-foreground">
                        Encrypt sensitive data
                      </li>
                      <li className="text-sm md:text-base text-muted-foreground">
                        Implement proper access controls
                      </li>
                      <li className="text-sm md:text-base text-muted-foreground">
                        Regular security audits
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Guidelines */}
            <Card className="overflow-hidden">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <FileText className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  Content Guidelines
                </CardTitle>
                <CardDescription>
                  Standards for content creation and management
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-medium mb-1 md:mb-2">
                      Writing Style
                    </h3>
                    <ul className="list-disc list-inside space-y-1 md:space-y-2">
                      <li className="text-sm md:text-base text-muted-foreground">
                        Use clear and concise language
                      </li>
                      <li className="text-sm md:text-base text-muted-foreground">
                        Maintain consistent tone
                      </li>
                      <li className="text-sm md:text-base text-muted-foreground">
                        Follow brand voice guidelines
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1 md:mb-2">
                      Content Structure
                    </h3>
                    <ul className="list-disc list-inside space-y-1 md:space-y-2">
                      <li className="text-sm md:text-base text-muted-foreground">
                        Use proper headings and subheadings
                      </li>
                      <li className="text-sm md:text-base text-muted-foreground">
                        Include relevant metadata
                      </li>
                      <li className="text-sm md:text-base text-muted-foreground">
                        Optimize for SEO
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Platform Efficiency Guidelines */}
            <Card className="overflow-hidden">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  Platform Efficiency Guidelines
                </CardTitle>
                <CardDescription>
                  Best practices for using the platform effectively
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-medium mb-1 md:mb-2">
                      AI Tools Usage
                    </h3>
                    <ul className="list-disc list-inside space-y-1 md:space-y-2">
                      <li className="text-sm md:text-base text-muted-foreground">
                        Use specific prompts for better AI responses
                      </li>
                      <li className="text-sm md:text-base text-muted-foreground">
                        Combine multiple AI tools for comprehensive results
                      </li>
                      <li className="text-sm md:text-base text-muted-foreground">
                        Save successful prompts for future reference
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1 md:mb-2">
                      Idea Management
                    </h3>
                    <ul className="list-disc list-inside space-y-1 md:space-y-2">
                      <li className="text-sm md:text-base text-muted-foreground">
                        Use tags to categorize ideas effectively
                      </li>
                      <li className="text-sm md:text-base text-muted-foreground">
                        Create idea boards for different projects
                      </li>
                      <li className="text-sm md:text-base text-muted-foreground">
                        Set priorities and deadlines for ideas
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-medium mb-1 md:mb-2">
                      Workflow Optimization
                    </h3>
                    <ul className="list-disc list-inside space-y-1 md:space-y-2">
                      <li className="text-sm md:text-base text-muted-foreground">
                        Use templates for recurring tasks
                      </li>
                      <li className="text-sm md:text-base text-muted-foreground">
                        Set up automated workflows for efficiency
                      </li>
                      <li className="text-sm md:text-base text-muted-foreground">
                        Utilize batch processing for similar tasks
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1 md:mb-2">
                      Collaboration & Sharing
                    </h3>
                    <ul className="list-disc list-inside space-y-1 md:space-y-2">
                      <li className="text-sm md:text-base text-muted-foreground">
                        Share AI-generated insights with team
                      </li>
                      <li className="text-sm md:text-base text-muted-foreground">
                        Use real-time collaboration for brainstorming
                      </li>
                      <li className="text-sm md:text-base text-muted-foreground">
                        Export and share reports easily
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-medium mb-1 md:mb-2">
                      AI Tool Integration
                    </h3>
                    <ul className="list-disc list-inside space-y-1 md:space-y-2">
                      <li className="text-sm md:text-base text-muted-foreground">
                        Use AI for idea validation and refinement
                      </li>
                      <li className="text-sm md:text-base text-muted-foreground">
                        Leverage AI for market research and analysis
                      </li>
                      <li className="text-sm md:text-base text-muted-foreground">
                        Generate creative variations of ideas
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1 md:mb-2">
                      Productivity Tips
                    </h3>
                    <ul className="list-disc list-inside space-y-1 md:space-y-2">
                      <li className="text-sm md:text-base text-muted-foreground">
                        Schedule regular idea review sessions
                      </li>
                      <li className="text-sm md:text-base text-muted-foreground">
                        Use AI-powered analytics for insights
                      </li>
                      <li className="text-sm md:text-base text-muted-foreground">
                        Set up notifications for important updates
                      </li>
                    </ul>
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
