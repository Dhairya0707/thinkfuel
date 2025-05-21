"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import Link from "next/link";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { toast } from "sonner";
import { auth } from "../../service/firebase.config";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"; // Make sure you have the Firebase config set up
import { redirect, useRouter } from "next/navigation";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../service/firebase.config";

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !name || !termsAccepted) {
      toast.warning("Missing fields", {
        description: "Please fill all required fields and accept the terms.",
      });
      return;
    }

    if (password.length < 6) {
      toast.warning("Weak password", {
        description: "Password must be at least 6 characters long.",
      });
      return;
    }
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Update display name
      await updateProfile(user, {
        displayName: name,
      });

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name,
        email,
        isPro: true,
        provider: "ThinkFuel",
        createdAt: new Date().toISOString(),
      });

      await toast.success("Signup successful", {
        description: `Welcome, ${name}!`,
      });

      router.push("/dashboard");
    } catch (error: any) {
      toast.error("Signup failed", {
        description: error.message || "Something went wrong. Try again later.",
      });
    } finally {
      setIsLoading(false); // STOP loading
    }
  };

  const LoginwithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const user = result.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: user.displayName || "",
        email: user.email || "",
        isPro: false,
        provider: "google",
        createdAt: new Date().toISOString(),
      });

      toast.success("Login successful", {
        description: `Welcome, ${user.displayName || "User"}!`,
      });

      router.push("/");
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      toast.error("Google sign-in failed", {
        description: error?.message || "Something went wrong. Try again later.",
      });
    }
  };

  return (
    <div className={cn("flex flex-col gap-6")}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Create an account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your details below to create your account
        </p>
      </div>
      <div className="grid gap-6">
        <div className="">
          <div className="grid gap-2">
            <Label htmlFor="first-name">Enter name</Label>
            <Input
              id="first-name"
              placeholder="John"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="password">Create Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={termsAccepted}
            onCheckedChange={(e: boolean) => {
              setTermsAccepted(e);
            }}
          />
          <label
            htmlFor="terms"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I agree to the{" "}
            <a href="#" className="underline underline-offset-4">
              terms of service
            </a>{" "}
            and{" "}
            <a href="#" className="underline underline-offset-4">
              privacy policy
            </a>
          </label>
        </div>
        <Button
          type="submit"
          className="w-full"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? "Signing up..." : "Sign up"}
        </Button>
        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-background text-muted-foreground relative z-10 px-2">
            Or continue with
          </span>
        </div>
        <Button
          variant="outline"
          className="w-full"
          disabled={isLoading}
          onClick={LoginwithGoogle}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="h-5 w-5 mr-2"
          >
            <path
              d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
              fill="currentColor"
            />
          </svg>
          Sign up with Google
        </Button>
      </div>
      <div className="text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="underline underline-offset-4">
          Login
        </Link>
      </div>
    </div>
  );
}
