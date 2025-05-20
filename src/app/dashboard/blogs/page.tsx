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
import { auth, db } from "../../../../service/firebase.config";
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
  Search,
  Clock,
  Tag,
  BookOpen,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { doc, getDoc, collection, query, getDocs } from "firebase/firestore";

interface Blog {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  date: any;
  readTime: string;
  tags: string[];
  category: string;
}

export default function Blogs() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
            // Fetch blogs
            const blogsQuery = query(collection(db, "blog_posts"));
            const blogsSnapshot = await getDocs(blogsQuery);
            const blogsList = blogsSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as Blog[];
            setBlogs(blogsList);
          } else {
            setUser({
              auth: authUser,
              firestore: null,
            });
          }
        } catch (error) {
          console.error("Error fetching Firestore data:", error);
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

  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch = blog.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      !selectedCategory || blog.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(blogs.map((blog) => blog.category)));

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-muted/10">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading blogs...</p>
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
              <span className="text-base md:text-lg font-medium">Blogs</span>
            </div>
          </div>
        </header>

        <ScrollArea className="h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)]">
          <div className="p-3 md:p-6 space-y-4 md:space-y-8">
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search blogs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  onClick={() => setSelectedCategory(null)}
                  className="whitespace-nowrap"
                >
                  All
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={
                      selectedCategory === category ? "default" : "outline"
                    }
                    onClick={() => setSelectedCategory(category)}
                    className="whitespace-nowrap"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Blog Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredBlogs.map((blog) => (
                <Card
                  key={blog.id}
                  className="overflow-hidden cursor-pointer transition-all hover:shadow-md"
                  onClick={() => {
                    setSelectedBlog(blog);
                    setIsDialogOpen(true);
                  }}
                >
                  <CardHeader className="p-4 md:p-4">
                    <CardTitle className="text-base md:text-lg line-clamp-2">
                      {blog.title}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {new Date(blog.date?.toDate()).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-2 md:p-4">
                    <p className="text-sm md:text-base text-muted-foreground line-clamp-3 mb-4">
                      {blog.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{blog.readTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Tag className="h-4 w-4" />
                        <span>{blog.category}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {blog.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </ScrollArea>

        {/* Blog Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedBlog && (
              <>
                <DialogHeader className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <DialogTitle className="text-2xl font-bold">
                        {selectedBlog.title}
                      </DialogTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>By {selectedBlog.author}</span>
                        <span>•</span>
                        <span>
                          {new Date(
                            selectedBlog.date?.toDate()
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {/* <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsDialogOpen(false)}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button> */}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-muted rounded-md">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedBlog.readTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-muted rounded-md">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedBlog.category}</span>
                    </div>
                  </div>
                </DialogHeader>

                <div className="mt-6 space-y-6">
                  {/* Tags Section */}
                  <div className="flex flex-wrap gap-2">
                    {selectedBlog.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="px-3 py-1"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Excerpt Section */}
                  <div className="rounded-lg bg-muted/50 p-4">
                    <h3 className="text-sm font-medium mb-2">Summary</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedBlog.excerpt}
                    </p>
                  </div>

                  {/* Main Content */}
                  {/* <div className="prose prose-sm md:prose-base max-w-none dark:prose-invert">
                    <div className="space-y-4">
                      {selectedBlog.content
                        .split("\n")
                        .map((paragraph, index) => (
                          <p key={index} className="leading-relaxed">
                            {paragraph}
                          </p>
                        ))}
                    </div>
                  </div> */}

                  {/* Footer */}
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span>Published on</span>
                        <span className="font-medium">
                          {new Date(
                            selectedBlog.date?.toDate()
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>Reading time:</span>
                        <span className="font-medium">
                          {selectedBlog.readTime}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
}
