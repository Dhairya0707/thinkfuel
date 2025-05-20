"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../../service/firebase.config";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextAlign } from "@tiptap/extension-text-align";
import { Underline } from "@tiptap/extension-underline";
import { Image } from "@tiptap/extension-image";
import { Link as TiptapLink } from "@tiptap/extension-link";

export default function SharePage() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [loading, setLoading] = useState(true);
  const [ideaData, setIdeaData] = useState<any>(null);

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
    editable: false,
  });

  useEffect(() => {
    const fetchIdea = async () => {
      try {
        if (!id) {
          toast.error("Invalid idea ID");
          router.replace("/404");
          return;
        }

        const ideaDocRef = doc(db, "ideas", id);
        const ideaSnap = await getDoc(ideaDocRef);

        if (!ideaSnap.exists()) {
          toast.error("Idea not found");
          router.replace("/404");
          return;
        }

        const ideaDataCurrent = ideaSnap.data();

        // Check if idea is public
        if (ideaDataCurrent.visibility !== "public") {
          toast.error("This idea is private");
          router.replace("/404");
          return;
        }

        setIdeaData(ideaDataCurrent);
        editor?.commands.setContent(ideaDataCurrent.body || "");
        toast.success("Idea loaded");
      } catch (error) {
        console.error("Error fetching idea:", error);
        toast.error("Failed to load idea");
      } finally {
        setLoading(false);
      }
    };

    fetchIdea();
  }, [id, router, editor]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex h-16 shrink-0 items-center border-b justify-between gap-2 px-2 sm:px-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-muted"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="truncate font-medium text-lg sm:text-xl">
            {ideaData?.title}
          </span>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <div className="h-full p-1 sm:p-2 md:p-4">
          <div className="h-full bg-card rounded-lg shadow-lg overflow-hidden flex flex-col">
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
