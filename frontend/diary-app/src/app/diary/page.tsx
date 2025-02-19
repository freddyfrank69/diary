"use client";
import { useState } from "react";
import { createDiary } from "@/lib/api";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

export default function DiaryPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const { token } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    await createDiary(token, title, body);
    router.push("/dashboard");
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 max-w-md mx-auto">
      <h2 className="text-lg font-bold mb-4">New Diary Entry</h2>
      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required />
      <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write your entry..." required />
      <button type="submit">Save</button>
    </form>
  );
}
