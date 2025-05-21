"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  Bold,
  Italic,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Code,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Link,
  Image as ImageIcon,
  UnderlineIcon,
  Moon,
  Sun,
  MoreHorizontal,
  Info,
  Share2,
  Download,
  Trash2,
  Brain,
  BarChart2,
  MessageCircle,
  PaintbrushIcon,
  Globe,
  Lock,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useState } from "react";
import { TextAlign } from "@tiptap/extension-text-align";
import { Underline } from "@tiptap/extension-underline";
import { Image } from "@tiptap/extension-image";
import { Link as TiptapLink } from "@tiptap/extension-link";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";
import { auth, db } from "../../../../../service/firebase.config";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

// Update the editor styles
const editorStyles = `
  .ProseMirror {
    outline: none !important;
    border: none !important;
    min-height: 100%;
  }
  .ProseMirror:focus {
    outline: none !important;
    border: none !important;
    box-shadow: none !important;
  }
  .ProseMirror p {
    margin: 0;
  }
  @media (max-width: 640px) {
    .ProseMirror {
      font-size: 16px;
      padding: 0.5rem !important;
    }
    .ProseMirror h1 {
      font-size: 1.5em;
      margin-top: 0.5em;
      margin-bottom: 0.5em;
    }
    .ProseMirror h2 {
      font-size: 1.3em;
      margin-top: 0.5em;
      margin-bottom: 0.5em;
    }
    .ProseMirror h3 {
      font-size: 1.1em;
      margin-top: 0.5em;
      margin-bottom: 0.5em;
    }
    .ProseMirror ul, .ProseMirror ol {
      padding-left: 1.2em;
      margin: 0.5em 0;
    }
    .ProseMirror blockquote {
      margin: 0.5em 0;
      padding-left: 1em;
    }
    .ProseMirror pre {
      margin: 0.5em 0;
      padding: 0.5em;
    }
  }
`;

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);
  const [user, setUser] = useState<any>(null);
  const [ideaData, setIdeaData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const { theme, setTheme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [lastSavedContent, setLastSavedContent] = useState("");
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isPublic, setIsPublic] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      Image,
      TiptapLink.configure({
        openOnClick: false,
      }),
    ],
    content: "",
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      // Only save if content has actually changed and we're not in initial load
      if (content !== lastSavedContent && !isInitialLoad) {
        updateIdeaDoc(content, title);
      }
    },
  });

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (!authUser) {
        router.replace("/login");
        return;
      }

      try {
        const userDocRef = doc(db, "users", authUser.uid);
        const userSnap = await getDoc(userDocRef);

        if (!userSnap.exists()) {
          toast.error("User not found");
          router.replace("/login");
          return;
        }

        setUser({
          auth: authUser,
          firestore: userSnap.data(),
        });

        // Fetch the idea document
        if (id) {
          const ideaDocRef = doc(db, "ideas", id);
          const ideaSnap = await getDoc(ideaDocRef);

          if (!ideaSnap.exists()) {
            toast.error("Idea not found");
            router.replace("/404");
            return;
          }

          const ideaDataCurrent = ideaSnap.data();

          // Check owner ID
          if (ideaDataCurrent.ownerId !== authUser.uid) {
            toast.error("Unauthorized access");
            router.replace("/unauthorized");
            return;
          }

          setIdeaData(ideaDataCurrent);
          setTitle(ideaDataCurrent.title);
          const content = ideaDataCurrent.body || "";
          editor?.commands.setContent(content);
          setLastSavedContent(content);
          toast.success("Note loaded");
          if (ideaDataCurrent) {
            setIsPublic(ideaDataCurrent.visibility === "public");
          }
        } else {
          toast.error("Invalid idea ID");
          router.replace("/404");
        }
      } catch (error) {
        console.error("Error during auth/idea fetch:", error);
        toast.error("Something went wrong");
      } finally {
        setLoading(false);
        // Set initial load to false after data is loaded
        setIsInitialLoad(false);
      }
    });

    return () => unsubscribe();
  }, [id, router, editor]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        const content = editor?.getHTML() || "";
        // if (content !== lastSavedContent) {
        updateIdeaDoc(content, title);
        toast("Note saved (Ctrl+S)");
        // }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editor, title, lastSavedContent]);

  const updateIdeaDoc = async (body: string, heading: string) => {
    try {
      if (id) {
        const docRef = doc(db, "ideas", id);
        await updateDoc(docRef, {
          title: heading,
          body: body,
          updatedAt: serverTimestamp(),
        });
        setLastSavedContent(body);
        // toast.success("Note saved");
      }
    } catch (error) {
      console.error("Failed to update idea:", error);
      toast.error("Failed to update idea");
    }
  };

  // Add debounced title update
  useEffect(() => {
    if (isInitialLoad) return;

    const timeoutId = setTimeout(() => {
      if (title !== ideaData?.title) {
        updateIdeaDoc(editor?.getHTML() || "", title);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [title, isInitialLoad, ideaData?.title]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 800);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    // Add the custom styles to the document
    const styleElement = document.createElement("style");
    styleElement.textContent = editorStyles;
    document.head.appendChild(styleElement);

    // Cleanup
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const renderToolbar = () => {
    if (isMobile) {
      return (
        <div className="border-b p-2 flex flex-wrap gap-2">
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor?.chain().focus().undo().run()}
              disabled={!editor?.can().undo()}
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor?.chain().focus().redo().run()}
              disabled={!editor?.can().redo()}
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="mx-1" />

          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className={editor?.isActive("bold") ? "bg-muted" : ""}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className={editor?.isActive("italic") ? "bg-muted" : ""}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
              className={editor?.isActive("underline") ? "bg-muted" : ""}
            >
              <UnderlineIcon className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="mx-1" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() =>
                  editor?.chain().focus().toggleHeading({ level: 1 }).run()
                }
              >
                <Heading1 className="h-4 w-4 mr-2" />
                <span>Heading 1</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  editor?.chain().focus().toggleHeading({ level: 2 }).run()
                }
              >
                <Heading2 className="h-4 w-4 mr-2" />
                <span>Heading 2</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  editor?.chain().focus().toggleHeading({ level: 3 }).run()
                }
              >
                <Heading3 className="h-4 w-4 mr-2" />
                <span>Heading 3</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
              >
                <List className="h-4 w-4 mr-2" />
                <span>Bullet List</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  editor?.chain().focus().toggleOrderedList().run()
                }
              >
                <ListOrdered className="h-4 w-4 mr-2" />
                <span>Numbered List</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor?.chain().focus().toggleBlockquote().run()}
              >
                <Quote className="h-4 w-4 mr-2" />
                <span>Quote</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
              >
                <Code className="h-4 w-4 mr-2" />
                <span>Code Block</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  const url = window.prompt("Enter the URL");
                  if (url) {
                    editor?.chain().focus().setLink({ href: url }).run();
                  }
                }}
              >
                <Link className="h-4 w-4 mr-2" />
                <span>Add Link</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  const url = window.prompt("Enter the image URL");
                  if (url) {
                    editor?.chain().focus().setImage({ src: url }).run();
                  }
                }}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                <span>Add Image</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    }

    return (
      <div className="border-b p-2 flex flex-wrap gap-2">
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor?.chain().focus().undo().run()}
            disabled={!editor?.can().undo()}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor?.chain().focus().redo().run()}
            disabled={!editor?.can().redo()}
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="mx-1" />

        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              editor?.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className={
              editor?.isActive("heading", { level: 1 }) ? "bg-muted" : ""
            }
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              editor?.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={
              editor?.isActive("heading", { level: 2 }) ? "bg-muted" : ""
            }
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              editor?.chain().focus().toggleHeading({ level: 3 }).run()
            }
            className={
              editor?.isActive("heading", { level: 3 }) ? "bg-muted" : ""
            }
          >
            <Heading3 className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="mx-1" />

        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={editor?.isActive("bold") ? "bg-muted" : ""}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={editor?.isActive("italic") ? "bg-muted" : ""}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            className={editor?.isActive("underline") ? "bg-muted" : ""}
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="mx-1" />

        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className={editor?.isActive("bulletList") ? "bg-muted" : ""}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            className={editor?.isActive("orderedList") ? "bg-muted" : ""}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            className={editor?.isActive("blockquote") ? "bg-muted" : ""}
          >
            <Quote className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
            className={editor?.isActive("codeBlock") ? "bg-muted" : ""}
          >
            <Code className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="mx-1" />

        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor?.chain().focus().setTextAlign("left").run()}
            className={
              editor?.isActive({ textAlign: "left" }) ? "bg-muted" : ""
            }
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor?.chain().focus().setTextAlign("center").run()}
            className={
              editor?.isActive({ textAlign: "center" }) ? "bg-muted" : ""
            }
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor?.chain().focus().setTextAlign("right").run()}
            className={
              editor?.isActive({ textAlign: "right" }) ? "bg-muted" : ""
            }
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="mx-1" />

        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const url = window.prompt("Enter the URL");
              if (url) {
                editor?.chain().focus().setLink({ href: url }).run();
              }
            }}
            className={editor?.isActive("link") ? "bg-muted" : ""}
          >
            <Link className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const url = window.prompt("Enter the image URL");
              if (url) {
                editor?.chain().focus().setImage({ src: url }).run();
              }
            }}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  const toggleVisibility = async () => {
    try {
      if (!id) {
        toast.error("Invalid idea ID");
        return;
      }
      const docRef = doc(db, "ideas", id);
      await updateDoc(docRef, {
        visibility: isPublic ? "private" : "public",
        updatedAt: serverTimestamp(),
      });
      setIsPublic(!isPublic);
      toast.success(`Idea is now ${isPublic ? "private" : "public"}`);
    } catch (error) {
      console.error("Error updating visibility:", error);
      toast.error("Failed to update visibility");
    }
  };

  const handleDeleteIdea = async () => {
    try {
      if (!id) {
        toast.error("Invalid idea ID");
        return;
      }
      const docRef = doc(db, "ideas", id);
      await deleteDoc(docRef);
      toast.success("Idea deleted successfully");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error deleting idea:", error);
      toast.error("Failed to delete idea");
    }
  };

  const handleDownloadIdea = () => {
    const content = editor?.getHTML() || "";
    const blob = new Blob([content], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex h-16 shrink-0 items-center border-b justify-between gap-2 px-2 sm:px-4">
        <div className="flex items-center gap-2 flex-1">
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-muted shrink-0"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full font-bold text-lg sm:text-xl border-none outline-none focus:outline-none focus:border-none bg-transparent"
              placeholder="Enter Title"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-muted">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                onClick={() => {
                  const content = editor?.getText();

                  router.push(`/dashboard/ai/checker?idea=${content}`);
                }}
              >
                <Brain className="mr-2 h-4 w-4" />
                <span>Send to Idea Checker</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  const content = editor?.getText();

                  router.push(`/dashboard/ai/research?idea=${content}`);
                }}
              >
                <BarChart2 className="mr-2 h-4 w-4" />
                <span>Send to Market Research</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/dashboard/ai/chat?id=${id}`)}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                <span>Chat with Idea</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/dashboard/ai/brandkit?id=${id}`)}
              >
                <PaintbrushIcon className="mr-2 h-4 w-4" />
                <span>Send to Branding Kit</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShareDialogOpen(true)}>
                <Share2 className="mr-2 h-4 w-4" />
                <span>Share</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownloadIdea}>
                <Download className="mr-2 h-4 w-4" />
                <span>Download</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Share Idea</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isPublic ? (
                      <Globe className="h-4 w-4 text-green-500" />
                    ) : (
                      <Lock className="h-4 w-4 text-blue-500" />
                    )}
                    <span>
                      Current Status: {isPublic ? "Public" : "Private"}
                    </span>
                  </div>
                  <Button variant="outline" onClick={toggleVisibility}>
                    Make {isPublic ? "Private" : "Public"}
                  </Button>
                </div>
                {isPublic && (
                  <div className="space-y-2">
                    <Label>Share Link</Label>
                    <div className="flex gap-2">
                      <Input
                        readOnly
                        value={`${window.location.origin}/share/${id}`}
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${window.location.origin}/share/${id}`
                          );
                          toast.success("Link copied to clipboard");
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Delete Idea</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this idea? This action cannot
                  be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDeleteIdea();
                    setDeleteDialogOpen(false);
                  }}
                >
                  Delete
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="hover:bg-muted"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <div className="h-full p-1 sm:p-2 md:p-4">
          <div className="h-full bg-card rounded-lg shadow-lg overflow-hidden flex flex-col">
            {renderToolbar()}
            <div className="flex-1 overflow-y-auto">
              <EditorContent
                editor={editor}
                className="h-full prose prose-invert max-w-none px-2 sm:px-4 md:px-6 py-2 sm:py-4 md:py-6"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
