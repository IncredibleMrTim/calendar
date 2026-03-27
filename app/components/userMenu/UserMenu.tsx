"use client";

import React, { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  LuAlignJustify,
  LuHeartHandshake,
  LuLogIn,
  LuLogOut,
  LuMail,
} from "react-icons/lu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export enum MenuItemType {
  CONTACT,
  PROMO,
}

type UserMenuProps = React.HTMLAttributes<HTMLDivElement> & {
  onMenuItemClick?: (item: MenuItemType) => void;
};

export const UserMenu = ({
  onMenuItemClick = () => {},
  ...props
}: UserMenuProps) => {
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
    <div {...props} className="flex">
      {session?.user && (
        <Avatar>
          <AvatarImage src={session.user.image || undefined} />
          <AvatarFallback className="bg-red-100">
            {session?.user.name
              ?.split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2) || "?"}
          </AvatarFallback>
        </Avatar>
      )}
      <DropdownMenu onOpenChange={setAdminMenuOpen} open={adminMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost">
            Menu <LuAlignJustify />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-white" align="start" avoidCollisions>
          {session?.user && (
            <div className="flex items-center bg-gray-100 -mx-1 -mt-1 p-1 shadow">
              <DropdownMenuLabel className="text-black">
                Welcome {session?.user?.firstName} {session?.user?.lastName}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
            </div>
          )}
          <DropdownMenuGroup className="flex flex-col pt-2">
            <DropdownMenuItem>
              <Button
                variant="link"
                className="m-0 p-0 h-auto text-gray-500"
                onClick={() => onMenuItemClick(MenuItemType.CONTACT)}
              >
                <LuMail /> Contact Us
              </Button>
            </DropdownMenuItem>
            {/* <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Button
                variant="link"
                className="m-0 p-0 h-auto text-gray-500"
                onClick={() => onMenuItemClick(MenuItemType.PROMO)}
              >
                <LuHeartHandshake /> Vendors
              </Button>
            </DropdownMenuItem> */}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              {session?.user ? (
                <Button
                  variant="link"
                  onClick={async (e) => {
                    e.preventDefault();
                    await handleSignOut();
                  }}
                  className="m-0 p-0 h-auto text-gray-500"
                >
                  <LuLogOut />
                  {isSigningOut ? "Signing out..." : "Logout"}
                </Button>
              ) : (
                <Button
                  variant="link"
                  onClick={() => router.push("/auth/signin")}
                  className="m-0 p-0 h-auto text-gray-500"
                >
                  <LuLogIn /> Login / Register
                </Button>
              )}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
