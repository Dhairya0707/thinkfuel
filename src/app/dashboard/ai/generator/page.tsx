"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  Download,
  Share2,
  Bookmark,
  FileText,
  Brain,
  BarChart2,
  MessageCircle,
  PaintbrushIcon,
  SaveIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { generateIdeas } from "@/app/Utils/gemini";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../../../../service/firebase.config";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createIdea } from "@/app/Utils/function/createidea";

// Predefined areas and their subcategories
const areas = {
  Technology: [
    "Artificial Intelligence",
    "Web Development",
    "Mobile Apps",
    "Blockchain",
    "IoT",
    "Cybersecurity",
    "Cloud Computing",
    "Data Science",
  ],
  Business: [
    "E-commerce",
    "SaaS",
    "Fintech",
    "Marketing",
    "HR Tech",
    "Supply Chain",
    "Real Estate",
    "Healthcare",
  ],
  "Social Impact": [
    "Education",
    "Environment",
    "Healthcare",
    "Poverty Alleviation",
    "Community Development",
    "Sustainability",
    "Social Justice",
    "Mental Health",
  ],
  Creative: [
    "Content Creation",
    "Digital Media",
    "Gaming",
    "AR/VR",
    "Music",
    "Art",
    "Design",
    "Entertainment",
  ],
};

export default function IdeaGenerator() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
  const [additionalContext, setAdditionalContext] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [generatedIdeas, setGeneratedIdeas] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const editor = useEditor({
    extensions: [StarterKit],
    editable: false,
    content: "",
  });

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

  const handleGenerate = async () => {
    if (!selectedArea || !selectedSubcategory) {
      toast.error("Please select an area and subcategory");
      return;
    }

    setGenerating(true);
    try {
      const ideas = await generateIdeas(
        selectedArea,
        selectedSubcategory,
        additionalContext
      );
      setGeneratedIdeas(ideas);
      if (ideas.length > 0) {
        editor?.commands.setContent(ideas[0]);
      }
    } catch (error) {
      console.error("Error generating ideas:", error);
      toast.error("Failed to generate ideas");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyIdea = async (idea: string, index: number) => {
    try {
      await navigator.clipboard.writeText(idea);
      setCopiedIndex(index);
      toast.success("Idea copied to clipboard");
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      toast.error("Failed to copy idea");
    }
  };

  const handleDownloadIdea = () => {
    if (!editor?.getHTML()) return;

    const blob = new Blob([editor.getHTML()], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `idea-${new Date().toISOString().split("T")[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Idea downloaded successfully!");
  };

  const handleShareIdea = async () => {
    if (!editor?.getHTML()) return;

    try {
      await navigator.clipboard.writeText(editor.getHTML());
      toast.success("Idea copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy idea");
    }
  };

  const handleSaveIdea = async () => {
    if (!editor?.getHTML() || !auth.currentUser) return;

    try {
      // Extract title from the HTML content
      const ideaContent = editor.getHTML();
      const ideaTitle =
        ideaContent.match(/<h1>🚀 (.*?)<\/h1>/)?.[1] || "Untitled Idea";

      // Create a new document in the ideas collection
      const docRef = await addDoc(collection(db, "ideas"), {
        title: ideaTitle,
        body: ideaContent,
        ownerId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        visibility: "public",
        tags: [],
      });

      toast.success("Idea saved successfully!");
      router.push(`/dashboard/idea/${docRef.id}`);
    } catch (error) {
      console.error("Error saving idea:", error);
      toast.error("Failed to save idea");
    }
  };

  const handleSendToTool = async (tool: string) => {
    if (!editor?.getHTML() || !auth.currentUser) return;

    try {
      const ideaContent = editor.getText();
      const ideaTitle =
        ideaContent.match(/<h1>🚀 (.*?)<\/h1>/)?.[1] || "Untitled Idea";

      // Create a new document in the ideas collection
      const docRef = await addDoc(collection(db, "ideas"), {
        title: ideaTitle,
        body: ideaContent,
        ownerId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        visibility: "private",
        tags: [],
      });

      // Redirect to the appropriate tool
      switch (tool) {
        case "checker":
          router.push(`/dashboard/ai/checker?idea=${ideaContent}`);
          break;
        case "research":
          router.push(`/dashboard/ai/research?idea=${ideaContent}`);
          break;
        case "chat":
          router.push(`/dashboard/ai/chat?id=${docRef.id}`);
          break;
        case "branding":
          router.push(`/dashboard/ai/branding?id=${docRef.id}`);
          break;
      }
    } catch (error) {
      console.error("Error sending idea to tool:", error);
      toast.error("Failed to send idea to tool");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-0 data-[orientation=vertical]:h-4"
            />
            <span className="truncate font-medium">AI Idea Generator</span>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <div className="bg-muted/50 min-h-[calc(100vh-8rem)] flex-1 rounded-xl p-4 md:p-6">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="text-center space-y-4">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  AI Idea Generator
                </h1>
                <p className="text-muted-foreground text-lg">
                  Let AI help you discover innovative ideas in your chosen field
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Generate Your Idea</CardTitle>
                  <CardDescription>
                    Select your area of interest and provide some context to get
                    started
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="area">Area of Interest</Label>
                      <Select
                        value={selectedArea}
                        onValueChange={(value) => {
                          setSelectedArea(value);
                          setSelectedSubcategory("");
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an area" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(areas).map((area) => (
                            <SelectItem key={area} value={area}>
                              {area}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedArea && (
                      <div className="space-y-2">
                        <Label htmlFor="subcategory">Subcategory</Label>
                        <Select
                          value={selectedSubcategory}
                          onValueChange={setSelectedSubcategory}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a subcategory" />
                          </SelectTrigger>
                          <SelectContent>
                            {areas[selectedArea as keyof typeof areas].map(
                              (sub) => (
                                <SelectItem key={sub} value={sub}>
                                  {sub}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="context">
                        Additional Context (Optional)
                      </Label>
                      <Textarea
                        id="context"
                        placeholder="Describe any specific problems you want to solve or opportunities you've noticed..."
                        value={additionalContext}
                        onChange={(e) => setAdditionalContext(e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleGenerate}
                    disabled={
                      generating || !selectedArea || !selectedSubcategory
                    }
                  >
                    {generating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Ideas...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Ideas
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>

              {generatedIdeas.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold">Generated Idea</h2>
                  <Card className="group hover:shadow-lg transition-all overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xl">
                        Your Detailed Idea
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleDownloadIdea}>
                              <Download className="mr-2 h-4 w-4" />
                              Download as HTML
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleShareIdea}>
                              <Share2 className="mr-2 h-4 w-4" />
                              Copy to Clipboard
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleSaveIdea}>
                              <SaveIcon className="mr-2 h-4 w-4" />
                              Save Idea
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleSendToTool("checker")}
                            >
                              <Brain className="mr-2 h-4 w-4" />
                              Send to Idea Checker
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleSendToTool("research")}
                            >
                              <BarChart2 className="mr-2 h-4 w-4" />
                              Send to Market Research
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleSendToTool("chat")}
                            >
                              <MessageCircle className="mr-2 h-4 w-4" />
                              Chat with Idea
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleSendToTool("branding")}
                            >
                              <PaintbrushIcon className="mr-2 h-4 w-4" />
                              Create Branding Kit
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopyIdea(generatedIdeas[0], 0)}
                        >
                          {copiedIndex === 0 ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-invert max-w-none dark:prose-invert">
                        <EditorContent
                          editor={editor}
                          className="min-h-[400px] p-3 bg-card rounded-lg border"
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedArea("");
                          setSelectedSubcategory("");
                          setAdditionalContext("");
                          setGeneratedIdeas([]);
                          editor?.commands.setContent("");
                        }}
                      >
                        Generate Another Idea
                      </Button>
                      <Button
                        variant="default"
                        onClick={() => {
                          // TODO: Implement idea saving functionality
                          handleSaveIdea();
                        }}
                      >
                        Save Idea
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Loader2, Sparkles, ArrowRight } from "lucide-react";
// import { useRouter } from "next/navigation";
// import { toast } from "sonner";
// import { generateIdeas } from "@/app/Utils/gemini";

// // Predefined areas and their subcategories
// const areas = {
//   Technology: [
//     "Artificial Intelligence",
//     "Web Development",
//     "Mobile Apps",
//     "Blockchain",
//     "IoT",
//     "Cybersecurity",
//     "Cloud Computing",
//     "Data Science",
//   ],
//   Business: [
//     "E-commerce",
//     "SaaS",
//     "Fintech",
//     "Marketing",
//     "HR Tech",
//     "Supply Chain",
//     "Real Estate",
//     "Healthcare",
//   ],
//   "Social Impact": [
//     "Education",
//     "Environment",
//     "Healthcare",
//     "Poverty Alleviation",
//     "Community Development",
//     "Sustainability",
//     "Social Justice",
//     "Mental Health",
//   ],
//   Creative: [
//     "Content Creation",
//     "Digital Media",
//     "Gaming",
//     "AR/VR",
//     "Music",
//     "Art",
//     "Design",
//     "Entertainment",
//   ],
// };

// export default function IdeaGenerator() {
//   const router = useRouter();
//   const [selectedArea, setSelectedArea] = useState<string>("");
//   const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
//   const [additionalContext, setAdditionalContext] = useState<string>("");
//   const [loading, setLoading] = useState(false);
//   const [generatedIdeas, setGeneratedIdeas] = useState<string[]>([]);

//   const handleGenerate = async () => {
//     if (!selectedArea || !selectedSubcategory) {
//       toast.error("Please select an area and subcategory");
//       return;
//     }

//     setLoading(true);
//     try {
//       const ideas = await generateIdeas(
//         selectedArea,
//         selectedSubcategory,
//         additionalContext
//       );
//       setGeneratedIdeas(ideas);
//     } catch (error) {
//       console.error("Error generating ideas:", error);
//       toast.error("Failed to generate ideas");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="container max-w-4xl py-8 space-y-8">
//       <div className="text-center space-y-4">
//         <h1 className="text-4xl font-bold tracking-tight">AI Idea Generator</h1>
//         <p className="text-muted-foreground text-lg">
//           Let AI help you discover innovative ideas in your chosen field
//         </p>
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle>Generate Your Idea</CardTitle>
//           <CardDescription>
//             Select your area of interest and provide some context to get started
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-6">
//           <div className="grid gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="area">Area of Interest</Label>
//               <Select
//                 value={selectedArea}
//                 onValueChange={(value) => {
//                   setSelectedArea(value);
//                   setSelectedSubcategory("");
//                 }}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select an area" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {Object.keys(areas).map((area) => (
//                     <SelectItem key={area} value={area}>
//                       {area}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             {selectedArea && (
//               <div className="space-y-2">
//                 <Label htmlFor="subcategory">Subcategory</Label>
//                 <Select
//                   value={selectedSubcategory}
//                   onValueChange={setSelectedSubcategory}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select a subcategory" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {areas[selectedArea as keyof typeof areas].map((sub) => (
//                       <SelectItem key={sub} value={sub}>
//                         {sub}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//             )}

//             <div className="space-y-2">
//               <Label htmlFor="context">Additional Context (Optional)</Label>
//               <Textarea
//                 id="context"
//                 placeholder="Describe any specific problems you want to solve or opportunities you've noticed..."
//                 value={additionalContext}
//                 onChange={(e) => setAdditionalContext(e.target.value)}
//                 className="min-h-[100px]"
//               />
//             </div>
//           </div>
//         </CardContent>
//         <CardFooter>
//           <Button
//             className="w-full"
//             size="lg"
//             onClick={handleGenerate}
//             disabled={loading || !selectedArea || !selectedSubcategory}
//           >
//             {loading ? (
//               <>
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 Generating Ideas...
//               </>
//             ) : (
//               <>
//                 <Sparkles className="mr-2 h-4 w-4" />
//                 Generate Ideas
//               </>
//             )}
//           </Button>
//         </CardFooter>
//       </Card>

//       {generatedIdeas.length > 0 && (
//         <div className="space-y-4">
//           <h2 className="text-2xl font-semibold">Generated Ideas</h2>
//           <div className="grid gap-4">
//             {generatedIdeas.map((idea, index) => (
//               <Card
//                 key={index}
//                 className="group hover:shadow-lg transition-all"
//               >
//                 <CardHeader>
//                   <CardTitle className="text-lg">{idea}</CardTitle>
//                 </CardHeader>
//                 <CardFooter>
//                   <Button
//                     variant="ghost"
//                     className="ml-auto"
//                     onClick={() => {
//                       // TODO: Implement idea saving functionality
//                       toast.success("Idea saved successfully!");
//                     }}
//                   >
//                     Save Idea
//                     <ArrowRight className="ml-2 h-4 w-4" />
//                   </Button>
//                 </CardFooter>
//               </Card>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
