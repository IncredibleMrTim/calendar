import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { UserRole } from "@prisma/client";

export const getIdToken = () => localStorage.getItem("idToken");
export const getRefreshToken = () => localStorage.getItem("refreshToken");

export const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("idToken");
  localStorage.removeItem("refreshToken");
  window.location.href = "/auth/signin";
};

export const setTokens = (
  accessToken?: string,
  idToken?: string,
  refreshToken?: string,
) => {
  if (accessToken) {
    localStorage.setItem("accessToken", accessToken);
  }
  if (idToken) {
    localStorage.setItem("idToken", idToken);
  }
  if (refreshToken) {
    localStorage.setItem("refreshToken", refreshToken);
  }
};

export const removeTokens = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("idToken");
  localStorage.removeItem("refreshToken");
};

export const parseJwt = (token: string) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    return null;
  }
};

export const requireAuth = async (requiredRole?: UserRole) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    return { error: "Unauthorized", status: 401 };
  }

  if (requiredRole && session.user?.role !== requiredRole) {
    return { error: "Forbidden", status: 403 };
  }

  return { session };
};
