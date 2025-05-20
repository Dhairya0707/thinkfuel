// "use client";

// import { useEffect } from "react";
// import { cn } from "@/lib/utils";
// import dynamic from "next/dynamic";

// // Dynamically import the markdown editor to avoid SSR issues
// const MDEditor = dynamic(
//   () => import("@uiw/react-md-editor").then((mod) => mod.default),
//   { ssr: false }
// );

// interface MDXEditorProps {
//   value: string;
//   onChange: (value: string) => void;
//   className?: string;
// }

// export default function MDXEditor({
//   value,
//   onChange,
//   className,
// }: MDXEditorProps) {
//   useEffect(() => {
//     // Fix for dark mode
//     document.documentElement.setAttribute("data-color-mode", "light");
//   }, []);

//   return (
//     <div className={cn("relative w-full", className)} data-color-mode="light">
//       <MDEditor
//         value={value}
//         onChange={(val) => onChange(val || "")}
//         preview="live"
//         height="100%"
//         className="!border-0"
//         textareaProps={{
//           placeholder: "Start writing your idea...",
//         }}
//       />
//     </div>
//   );
// }
