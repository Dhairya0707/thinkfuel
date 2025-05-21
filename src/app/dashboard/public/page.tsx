"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { auth, db } from "../../../../service/firebase.config";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock, Calendar, Eye, User } from "lucide-react";
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
} from "@/components/ui/command";
import { Search } from "lucide-react";

interface Idea {
  id: string;
  title: string;
  body: string;
  createdAt: any;
  updatedAt: any;
  ownerId: string;
  visibility: string;
  ownerName?: string;
}

interface UserData {
  name?: string;
  email?: string;
  // Add other user fields as needed
}

export default function PublicPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [publicIdeas, setPublicIdeas] = useState<Idea[]>([]);
  const [open, setOpen] = useState(false);
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

            // Fetch public ideas
            const ideasQuery = query(
              collection(db, "ideas"),
              where("visibility", "==", "public")
            );

            const querySnapshot = await getDocs(ideasQuery);
            const ideasList: Idea[] = [];

            // Fetch user data for each idea
            for (const ideaDoc of querySnapshot.docs) {
              const data = ideaDoc.data();
              const userDocRef = doc(db, "users", data.ownerId);
              const userDocSnap = await getDoc(userDocRef);
              const userData = userDocSnap.data() as UserData | undefined;

              ideasList.push({
                id: ideaDoc.id,
                title: data.title,
                body: data.body,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
                ownerId: data.ownerId,
                visibility: data.visibility,
                ownerName: userData?.name || "Anonymous",
              });
            }

            setPublicIdeas(ideasList);
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
    router.push(`/share/${id}`);
  };

  const filteredIdeas = publicIdeas.filter((idea) => {
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
            <span className="truncate font-medium">Public Ideas</span>
          </div>
          <div className="flex items-center gap-2 px-4">
            <Button
              variant="outline"
              className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
              onClick={() => setOpen(true)}
            >
              <Search className="h-4 w-4 xl:mr-2" />
              <span className="hidden xl:inline-flex">
                Search public ideas...
              </span>
              <span className="sr-only">Search public ideas</span>
              <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
                <span className="text-xs">⌘</span>P
              </kbd>
            </Button>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-2 pt-0">
          <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min">
            <div className="p-4">
              {publicIdeas.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                  <h2 className="text-xl font-semibold mb-2">
                    No public ideas yet
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Be the first to share your ideas with the community!
                  </p>
                  <Button
                    onClick={() => router.push("/dashboard")}
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
                          {idea.body.replace(/<[^>]*>/g, "") ||
                            "No content yet..."}
                        </p>
                      </CardContent>
                      <CardFooter className="pt-2 border-t mt-auto">
                        <div className="flex justify-between items-center w-full text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {idea.ownerName}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {idea.createdAt &&
                              format(idea.createdAt.toDate(), "MMM d, yyyy")}
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
          placeholder="Search public ideas by title or content..."
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          <CommandEmpty>No public ideas found.</CommandEmpty>
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
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span className="text-xs">{idea.ownerName}</span>
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </SidebarProvider>
  );
}
