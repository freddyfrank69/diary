"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push("/login");
    } else {
      router.push("/dashboard");
    }
  }, [token, router]);

  return <p className="text-center text-gray-500">Redirecting...</p>;
}
