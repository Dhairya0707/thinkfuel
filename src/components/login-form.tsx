"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { toast } from "sonner"; // Assuming you're using sonner for toasts
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth, db } from "../../service/firebase.config"; // Make sure you have the Firebase config set up
import { redirect, useRouter } from "next/navigation";
import { doc, getDoc, setDoc } from "firebase/firestore";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation: Ensure both fields are filled
    if (!email || !password) {
      toast.warning("Validation Error", {
        description: "Please enter both email and password.",
      });

      return;
    }

    try {
      setLoading(true);
      // Firebase login attempt
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      toast.success("Login successful", {
        description: `Welcome back, ${user.email}`,
      });
      setLoading(false);

      router.push("/dashboard");
    } catch (error: any) {
      setLoading(false);
      console.error("Error logging in:", error);

      toast.error("Something went wrong", {
        description: "An unexpected error occurred. Please try again later.",
      });
    }
  };

  // const LoginwithGoogle = async () => {
  //   try {
  //     const provider = new GoogleAuthProvider();
  //     const result = await signInWithPopup(auth, provider);

  //     const user = result.user;
  //     toast.success("Login successful", {
  //       className: "bg-white text-black", // whole box
  //       descriptionClassName: "text-gray-500",
  //       description: `Welcome, ${user.displayName || "User"}!`,
  //     });

  //     router.push("/");
  //   } catch (error: any) {
  //     console.error("Google sign-in error:", error);
  //     toast.error("Google sign-in failed", {
  //       description: error?.message || "Something went wrong. Try again later.",
  //     });
  //   }
  // };

  const LoginwithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          name: user.displayName || "",
          email: user.email || "",
          isPro: false,
          provider: "google",
          createdAt: new Date().toISOString(),
        });

        router.push("/");
      } else {
        toast.success("Login successful", {
          description: `Welcome back, ${user.displayName || "User"}!`,
        });
        router.push("/");
      }
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      toast.error("Google sign-in failed", {
        description: error?.message || "Something went wrong. Try again later.",
      });
    }
  };

  return (
    <div className={cn("flex flex-col gap-6 ", className)}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email below to login to your account
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button
          className="w-full"
          disabled={loading}
          onClick={(e) => {
            handleSubmit(e);
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </Button>
        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-background text-muted-foreground relative z-10 px-2">
            Or continue with
          </span>
        </div>
        <Button variant="outline" className="w-full" onClick={LoginwithGoogle}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path
              d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
              fill="currentColor"
            />
          </svg>
          Login with Google
        </Button>
      </div>
      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="underline underline-offset-4">
          Sign up
        </Link>
      </div>
    </div>
  );
}

// import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import Link from "next/link";
// import { motion } from "motion/react";

// export function LoginForm({
//   className,
//   ...props
// }: React.ComponentProps<"form">) {
//   return (
//     <form className={cn("flex flex-col gap-6", className)} {...props}>
//       <div className="flex flex-col items-center gap-2 text-center">
//         <h1 className="text-2xl font-bold">Login to your account</h1>
//         <p className="text-muted-foreground text-sm text-balance">
//           Enter your email below to login to your account
//         </p>
//       </div>
//       <div className="grid gap-6">
//         <div className="grid gap-3">
//           <Label htmlFor="email">Email</Label>
//           <Input id="email" type="email" placeholder="m@example.com" required />
//         </div>
//         <div className="grid gap-3">
//           <div className="flex items-center">
//             <Label htmlFor="password">Password</Label>
//             <Link
//               href="/forgot"
//               className="ml-auto text-sm underline-offset-4 hover:underline"
//             >
//               Forgot your password?
//             </Link>
//           </div>
//           <Input id="password" type="password" required />
//         </div>
//         <Button type="submit" className="w-full">
//           Login
//         </Button>
//         <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
//           <span className="bg-background text-muted-foreground relative z-10 px-2">
//             Or continue with
//           </span>
//         </div>
//         <Button variant="outline" className="w-full">
//           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
//             <path
//               d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
//               fill="currentColor"
//             />
//           </svg>
//           Login with Google
//         </Button>
//       </div>
//       <div className="text-center text-sm">
//         Don&apos;t have an account?{" "}
//         <Link href="/signup" className="underline underline-offset-4">
//           Sign up
//         </Link>
//       </div>
//     </form>
//   );
// }
