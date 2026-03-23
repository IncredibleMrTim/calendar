"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthRedirect } from "@/components/auth/AuthRedirect";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo/Logo";
import {
  ManualAuth,
  ManualAuthAction,
} from "@/components/auth/manualAuth/ManualAuth";
import { GoogleLogo } from "@/components/logo/GoogleLogo";

export default function SignIn() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [manualAuthAction, setManualAuthAction] = useState<ManualAuthAction>(
    ManualAuthAction.SIGNIN,
  );

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
        <div className="flex flex-col gap-4 max-w-md w-full ">
          <div className="flex flex-col justify-center w-full gap-4">
            <div className="w-[80vw] md:w-75 mx-auto">
              <Logo />
            </div>
            <ManualAuth
              action={manualAuthAction}
              onAuthActionChange={(action) => setManualAuthAction(action)}
            />
          </div>
          {manualAuthAction !== ManualAuthAction.REGISTER && (
            <div className="flex flex-col gap-4 justify-center">
              <p className="text-center">or</p>
              <Button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex"
              >
                <div className="flex justify-center gap-4">
                  <GoogleLogo />
                  {isLoading ? "Signing in..." : "Sign in with Google"}
                </div>
              </Button>
              <Button
                variant="secondary"
                onClick={() => router.push("/")}
                className="w-full flex"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
