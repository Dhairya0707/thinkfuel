"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { auth, db } from "../../../service/firebase.config";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock, Calendar, Eye, EyeOff, Lock, Globe } from "lucide-react";
import { format } from "date-fns";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createIdea } from "../Utils/function/createidea";
import "dotenv/config";

require("dotenv").config();

interface Idea {
  id: string;
  title: string;
  body: string;
  createdAt: any;
  updatedAt: any;
  ownerId: string;
  visibility: string;
}

export default function Page() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [ideaTitle, setIdeaTitle] = useState("");
  const [ideaType, setIdeaType] = useState<"private" | "public">("private");
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

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

            // Fetch ideas for the current user
            const ideasQuery = query(
              collection(db, "ideas"),
              where("ownerId", "==", authUser.uid)
            );

            const querySnapshot = await getDocs(ideasQuery);
            const ideasList: Idea[] = [];

            querySnapshot.forEach((doc) => {
              const data = doc.data();
              ideasList.push({
                id: doc.id,
                title: data.title,
                body: data.body,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
                ownerId: data.ownerId,
                visibility: data.visibility || "private",
              });
            });

            setIdeas(ideasList);
          } else {
            setUser({
              auth: authUser,
              firestore: null,
            });
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          toast.error("Failed to fetch data");
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
    const down = (e: KeyboardEvent) => {
      if (e.key === "p" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleIdeaClick = (id: string) => {
    router.push(`/dashboard/idea/${id}`);
  };

  const filteredIdeas = ideas.filter((idea) => {
    const searchLower = searchQuery.toLowerCase();
    const titleMatch = idea.title.toLowerCase().includes(searchLower);
    const contentMatch = idea.body.toLowerCase().includes(searchLower);
    return titleMatch || contentMatch;
  });

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
            <span
              className="truncate font-medium"
              // onClick={async () => {
              //   console.log(process.env.NEXT_PUBLIC_TEST_MESSAGE);
              // }}
            >
              Dashboard
            </span>
            {/* <div className="text-sm text-muted-foreground">
              {process.env.NEXT_PUBLIC_TEST_MESSAGE}
            </div> */}
          </div>
          <div className="flex items-center gap-2 px-4">
            <Button
              variant="outline"
              className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
              onClick={() => setOpen(true)}
            >
              <Search className="h-4 w-4 xl:mr-2" />
              <span className="hidden xl:inline-flex">Search ideas...</span>
              <span className="sr-only">Search ideas</span>
              <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
                <span className="text-xs">⌘</span>P
              </kbd>
            </Button>
            <Button
              className="gap-2 px-4 h-10"
              onClick={() => setCreateDialogOpen(true)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="hidden sm:inline">New Idea</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-2 pt-0">
          <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min">
            <div className="p-4">
              {ideas.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                  <h2 className="text-xl font-semibold mb-2">No ideas yet</h2>
                  <p className="text-muted-foreground mb-4">
                    Start by creating your first idea!
                  </p>
                  <Button
                    onClick={() => setCreateDialogOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Create New Idea
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredIdeas.map((idea) => (
                    <Card
                      key={idea.id}
                      className="group cursor-pointer hover:shadow-lg transition-all duration-200 flex flex-col h-full"
                      onClick={() => handleIdeaClick(idea.id)}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="line-clamp-1 text-lg group-hover:text-primary transition-colors">
                          {idea.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 text-xs">
                          <Clock className="h-3 w-3" />
                          {idea.updatedAt &&
                            format(idea.updatedAt.toDate(), "MMM d, yyyy")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 pb-2">
                        <p className="text-sm text-muted-foreground overflow-clip line-clamp-3">
                          {/* <p className="text-sm text-muted-foreground overflow-clip line-clamp-3 min-h-[4.5rem]"> */}
                          {idea.body.replace(/<[^>]*>/g, "") ||
                            "No content yet..."}
                        </p>
                      </CardContent>
                      <CardFooter className="pt-2 border-t mt-auto">
                        <div className="flex justify-between items-center w-full text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {idea.createdAt &&
                              format(idea.createdAt.toDate(), "MMM d, yyyy")}
                          </div>
                          <div
                            className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                              idea.visibility === "public"
                                ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                                : "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                            }`}
                          >
                            {idea.visibility === "public" ? (
                              <Eye className="h-3 w-3" />
                            ) : (
                              <EyeOff className="h-3 w-3" />
                            )}
                            <span className="capitalize">
                              {idea.visibility}
                            </span>
                          </div>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search ideas by title or content..."
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          <CommandEmpty>No ideas found.</CommandEmpty>
          <CommandGroup heading="Results">
            {filteredIdeas.map((idea) => (
              <CommandItem
                key={idea.id}
                onSelect={() => {
                  handleIdeaClick(idea.id);
                  setOpen(false);
                }}
                className="flex items-center gap-2"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{idea.title}</span>
                  <span className="text-xs text-muted-foreground line-clamp-1">
                    {idea.body.replace(/<[^>]*>/g, "") || "No content yet..."}
                  </span>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {idea.updatedAt &&
                      format(idea.updatedAt.toDate(), "MMM d, yyyy")}
                  </span>
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                      idea.visibility === "public"
                        ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                        : "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                    }`}
                  >
                    {idea.visibility === "public" ? (
                      <Eye className="h-3 w-3" />
                    ) : (
                      <EyeOff className="h-3 w-3" />
                    )}
                    <span className="capitalize">{idea.visibility}</span>
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Idea</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter your idea title"
                value={ideaTitle}
                onChange={(e) => setIdeaTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Visibility</Label>
              <Select
                value={ideaType}
                onValueChange={(value) =>
                  setIdeaType(value as "private" | "public")
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      <span>Private</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="public">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <span>Public</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <span className="m-2"></span>
            <Button
              disabled={loading}
              variant="default"
              onClick={async () => {
                if (!ideaTitle.trim()) {
                  toast.error("Please enter a title for your idea");
                  return;
                }
                setLoading(true);
                try {
                  const ideaId = await createIdea(
                    {
                      title: ideaTitle,
                      body: "",
                      tags: [],
                      visibility: ideaType,
                    },
                    auth.currentUser?.uid
                  );
                  setLoading(false);
                  setCreateDialogOpen(false);
                  setIdeaTitle("");
                  setIdeaType("private");
                  toast.success("Idea created successfully!");
                  router.push(`/dashboard/idea/${ideaId}`);
                } catch (error) {
                  console.error("Error creating idea:", error);
                  toast.error("Failed to create idea");
                  setLoading(false);
                }
              }}
            >
              {loading ? (
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-muted border-t-primary" />
              ) : null}
              Create Idea
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
