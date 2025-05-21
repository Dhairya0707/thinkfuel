"use client";

import { useState, useEffect, useRef } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { Separator } from "@/components/ui/separator";
import { Suspense } from "react";
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
import { Textarea } from "@/components/ui/textarea";
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
  Send,
  ArrowLeft,
  User,
  MessageSquare,
  Sparkles,
  Lightbulb,
  ArrowLeftToLine,
  Clock,
  CornerDownLeft,
  ChevronRight,
  BrainCircuit,
} from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apikey } from "@/app/Utils/gemini";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(apikey);

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Idea {
  id: string;
  title: string;
  body: string;
  createdAt: any;
}

export default function IdeaChat() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-muted/10">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <IdeaChatContent />
    </Suspense>
  );
}

function IdeaChatContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ideaContent, setIdeaContent] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [ideaTitle, setIdeaTitle] = useState("");
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [showIdeaDialog, setShowIdeaDialog] = useState(false);
  const [loadingIdea, setLoadingIdea] = useState(false);

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
      // Check for idea ID in URL params
      const ideaId = params?.id || searchParams?.get("id");

      if (ideaId) {
        setLoadingIdea(true);
        try {
          const ideaRef = doc(db, "ideas", ideaId as string);
          const ideaSnap = await getDoc(ideaRef);

          if (ideaSnap.exists()) {
            const ideaData = ideaSnap.data();
            setSelectedIdea({
              id: ideaSnap.id,
              ...ideaData,
            } as Idea);
            setIdeaContent(ideaData.body);
            setIdeaTitle(ideaData.title);
            // Add initial system message
            setMessages([
              {
                role: "assistant",
                content: `I'm here to help you discuss and refine your idea: "${ideaData.title}". Feel free to ask any questions about market potential, implementation, features, or any other aspects you'd like to explore.`,
                timestamp: new Date(),
              },
            ]);
          } else {
            toast.error("Idea not found");
            router.push("/dashboard/ai/chat");
          }
        } catch (error) {
          console.error("Error fetching idea:", error);
          toast.error("Failed to fetch idea");
          router.push("/dashboard/ai/chat");
        } finally {
          setLoadingIdea(false);
        }
      }
    };

    fetchIdea();
  }, [params?.id, searchParams, router]);

  const handleIdeaSelect = (idea: Idea) => {
    setSelectedIdea(idea);
    setIdeaContent(idea.body);
    setIdeaTitle(idea.title);
    setMessages([
      {
        role: "assistant",
        content: `I'm here to help you discuss and refine your idea: "${idea.title}". Feel free to ask any questions about market potential, implementation, features, or any other aspects you'd like to explore.`,
        timestamp: new Date(),
      },
    ]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = `You are an expert business consultant and startup advisor. You are discussing the following business idea with the user:

${ideaContent}

Previous conversation context:
${messages.map((msg) => `${msg.role}: ${msg.content}`).join("\n")}

User's latest message: ${inputMessage}

Provide a detailed, practical, and actionable response. Focus on real-world examples, specific data points, and concrete suggestions. Be conversational but professional.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const assistantMessage: Message = {
        role: "assistant",
        content: text,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error generating response:", error);
      toast.error("Failed to generate response");
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading || loadingIdea) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-muted/10">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            {loadingIdea ? "Loading idea..." : "Loading your ideas..."}
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
              <span className="text-lg font-medium">Chat with Idea</span>
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
            <div className="bg-gradient-to-b from-muted/50 to-background rounded-xl p-6 shadow-sm">
              <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-3">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-2">
                    <Lightbulb className="h-8 w-8 text-primary" />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Select an Idea
                  </h1>
                  <p className="text-muted-foreground text-lg max-w-md mx-auto">
                    Choose an idea to discuss with our AI assistant
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
                        <CardContent className="pt-0 pb-4">
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
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <div className="flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-primary" />
              <span className="text-lg font-medium">AI Discussion</span>
              <Badge variant="outline" className="ml-2">
                <Lightbulb className="h-3 w-3 mr-1 text-amber-500" />
                {selectedIdea.title.length > 20
                  ? selectedIdea.title.substring(0, 20) + "..."
                  : selectedIdea.title}
              </Badge>
            </div>
          </div>
          <div className="flex items-center px-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIdea(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back to Ideas
            </Button>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-0 h-[calc(100vh-4rem)]">
          {/* Main content area */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left panel (idea content) - hidden on mobile */}
            <div className="w-2/5 border-r hidden lg:block">
              <Card className="h-full rounded-none border-0">
                <CardHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Lightbulb className="h-5 w-5 text-amber-500" />
                    <span className="line-clamp-1">{selectedIdea.title}</span>
                  </CardTitle>
                </CardHeader>
                <ScrollArea className="h-[calc(100vh-8rem)]">
                  <CardContent className="p-6">
                    <div className="prose prose-stone max-w-none">
                      <div
                        dangerouslySetInnerHTML={{ __html: selectedIdea.body }}
                      />
                    </div>
                  </CardContent>
                </ScrollArea>
              </Card>
            </div>

            {/* Right panel (chat interface) */}
            <div className="flex-1 flex flex-col">
              <Card className="flex-1 rounded-none border-0">
                <ScrollArea className="h-[calc(100vh-10rem)]">
                  <div className="space-y-6 p-4 md:p-6">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={cn(
                          "flex",
                          message.role === "user"
                            ? "justify-end"
                            : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "flex items-start gap-3 max-w-[85%]",
                            message.role === "user"
                              ? "flex-row-reverse"
                              : "flex-row"
                          )}
                        >
                          <Avatar
                            className={cn(
                              "h-8 w-8",
                              message.role === "assistant" &&
                                "bg-primary/10 text-primary"
                            )}
                          >
                            {message.role === "user" ? (
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                <User className="h-4 w-4" />
                              </AvatarFallback>
                            ) : (
                              <AvatarFallback className="bg-primary/10">
                                <BrainCircuit className="h-4 w-4 text-primary" />
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div
                            className={cn(
                              "rounded-xl p-4 shadow-sm",
                              message.role === "user"
                                ? "bg-primary text-primary-foreground rounded-tr-none"
                                : "bg-muted/60 rounded-tl-none"
                            )}
                          >
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                              <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                                {message.content}
                              </ReactMarkdown>
                            </div>
                            <span className="text-xs opacity-70 mt-2 block">
                              {message.timestamp.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-8 w-8 bg-primary/10">
                            <AvatarFallback>
                              <BrainCircuit className="h-4 w-4 text-primary" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="rounded-xl rounded-tl-none p-4 bg-muted/60 shadow-sm">
                            <div className="flex gap-2">
                              <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" />
                              <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0.2s]" />
                              <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0.4s]" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input area */}
                <div className="p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-full shrink-0 md:hidden"
                      onClick={() => setShowIdeaDialog(true)}
                    >
                      <Lightbulb className="h-4 w-4 text-amber-500" />
                    </Button>
                    <div className="relative flex-1">
                      <Textarea
                        placeholder="Type your message..."
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                        className="min-h-[60px] resize-none pr-12 py-3 placeholder:text-muted-foreground/50"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute bottom-3 right-2 h-6 w-6 text-muted-foreground"
                        disabled={isTyping}
                      >
                        <CornerDownLeft className="h-4 w-4" />
                        <span className="sr-only">Send with enter</span>
                      </Button>
                    </div>
                    <Button
                      onClick={handleSendMessage}
                      disabled={isTyping || !inputMessage.trim()}
                      className="h-10 px-4 shrink-0"
                    >
                      {isTyping ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">Send</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* Mobile Idea View Dialog */}
      <Dialog open={showIdeaDialog} onOpenChange={setShowIdeaDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              {selectedIdea.title}
            </DialogTitle>
            <DialogDescription>Your idea details</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="p-4 prose prose-sm max-w-none">
              <div dangerouslySetInnerHTML={{ __html: selectedIdea.body }} />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
