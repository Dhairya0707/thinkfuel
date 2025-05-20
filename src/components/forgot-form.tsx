"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../service/firebase.config";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ForgotComponent() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleReset = async () => {
    if (!email) {
      toast("Missing email", {
        description: "Please enter your email address.",
      });
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast("Reset link sent", {
        description:
          "Check your inbox for instructions to reset your password.",
      });
      router.push("/login");
    } catch (error: any) {
      toast("Failed to send reset link", {
        description:
          error?.message || "Something went wrong. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Forgot your password?</h1>
        <p className="text-muted-foreground text-sm">
          Enter your email address to receive a password reset link.
        </p>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-2">
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

        <Button onClick={handleReset} disabled={loading} className="w-full">
          {loading ? "Sending..." : "Send Reset Link"}
        </Button>
      </div>

      <div className="text-center text-sm">
        Remember your password?{" "}
        <Link href="/login" className="underline underline-offset-4">
          Back to login
        </Link>
      </div>
    </div>
  );
}

// /**
//  * v0 by Vercel.
//  * @see https://v0.dev/t/8XoDQnhFcwd
//  * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
//  */
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardContent,
// } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import Link from "next/link";

// export default function ForgotComponent() {
//   return (
//     <Card className="mx-auto max-w-sm">
//       <CardHeader className="space-y-1">
//         <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
//         <CardDescription>
//           Enter your email below to receive a password reset link
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-4">
//           <div className="space-y-2">
//             <Label htmlFor="email">Email</Label>
//             <Input
//               id="email"
//               type="email"
//               placeholder="m@example.com"
//               required
//             />
//             <p className="text-sm text-gray-500">
//               A password reset link will be sent to the provided email address.
//             </p>
//           </div>
//           <Button type="submit" className="w-full">
//             Send Reset Link
//           </Button>
//         </div>
//         <div className="mt-4 text-center text-sm">
//           Remembered your password?{" "}
//           <Link href="/login" className="underline" prefetch={false}>
//             Go back to login
//           </Link>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
