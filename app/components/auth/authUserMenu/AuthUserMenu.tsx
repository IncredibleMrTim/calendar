"use client";

import React, { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { LuLogOut } from "react-icons/lu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type AuthUserMenuProps = React.HTMLAttributes<HTMLDivElement>;

export const AuthUserMenu = (props: AuthUserMenuProps) => {
  const { data: session } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div {...props}>
      {session?.user ? (
        <Popover onOpenChange={setAdminMenuOpen} open={adminMenuOpen}>
          <PopoverTrigger className="cursor-pointer">
            <Avatar>
              <AvatarImage src={session?.user.image || undefined} />
              <AvatarFallback className="bg-red-100">
                {session?.user.name
                  ?.split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2) || "?"}
              </AvatarFallback>
            </Avatar>
          </PopoverTrigger>
          <PopoverContent className="mr-4 mt-1 bg-white rounded-sm border-gray-200!">
            <div className="flex flex-col gap-2">
              <p>
                Welcome {session?.user?.firstName} {session?.user?.lastName}
              </p>
              <ul className="flex flex-col gap-2 mt-4">
                <li className="flex gap-4">
                  <LuLogOut size={22} className="text-gray-400" />
                  <button
                    onClick={async (e) => {
                      e.preventDefault();
                      await handleSignOut();
                    }}
                    className="text-black flex gap-4"
                  >
                    {isSigningOut ? "Signing out..." : "Logout"}
                  </button>
                </li>
              </ul>
            </div>
          </PopoverContent>
        </Popover>
      ) : (
        <Button onClick={() => router.push("/auth/signin")}>Login</Button>
      )}
    </div>
  );
};
