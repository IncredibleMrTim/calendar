"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthRedirect } from "@/components/auth/AuthRedirect";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo/Logo";
import { object } from "zod";

export default function SignIn() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signIn("google", {
        redirect: true,
      });
    } catch (error) {
      console.error("Sign in error:", error);
      setIsLoading(false);
    }
  };

  return (
    <>
      <AuthRedirect />
      <div className="min-h-[90vh] flex items-end lg:items-center justify-end lg:justify-center py-4 lg:py-12 px-4 sm:px-6 lg:px-8 sticky bottom-0">
        <div className="max-w-md w-full space-y-8">
          <div className="flex flex-col justify-center w-full">
            <div className="w-[80vw] md:w-75 mx-auto">
              <Logo />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Use your Google account to continue
            </p>
          </div>

          <div className="mt-8 space-y-6">
            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex"
            >
              {isLoading ? "Signing in..." : "Sign in with Google"}
            </Button>

            <Button
              variant="secondary"
              onClick={() => router.push("/")}
              className="w-full flex"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
