"use client";
import { Lightbulb } from "lucide-react";
import Transition from "../Utils/Transition";
import { LoginForm } from "@/components/login-form";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../../service/firebase.config";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/dashboard"); // Redirect if already logged in
      }
    });

    return () => unsubscribe(); // Clean up listener on unmount
  }, [router]);
  return (
    <Transition direction="right">
      <div className="grid min-h-svh lg:grid-cols-2">
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex justify-center gap-2 md:justify-start">
            <a href="#" className="flex items-center gap-2 font-medium">
              <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                <Lightbulb className="size-4" />
              </div>
              ThinkFuel
            </a>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs">
              <LoginForm />
            </div>
          </div>
        </div>
        <div className="bg-muted relative hidden lg:block">
          <img
            src="/patterns.svg"
            alt="Image"
            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.8]"
          />
        </div>
      </div>
    </Transition>
  );
}
