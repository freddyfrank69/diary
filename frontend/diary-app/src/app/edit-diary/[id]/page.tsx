"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchDiaries, editDiary, DiaryEntry } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function EditDiaryPage() {
  const { id } = useParams() as { id: string };
  const { token } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id && token) {
      fetchDiaries(token)
        .then((diaries) => {
          const diary = diaries.find((d: DiaryEntry) => d._id === id);
          if (!diary) throw new Error("Diary not found");

          setTitle(diary.title);
          setBody(diary.body);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError("Failed to load diary");
          setLoading(false);
        });
    }
  }, [id, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !token) return;

    try {
      await editDiary(id, title, body, token);
      alert("Diary updated successfully!");
      router.push("/dashboard");
    } catch (error) {
      alert("Failed to update diary.");
    }
  };

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Edit Diary Entry</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your diary..."
          required
          rows={5}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black"
        />
        <button
          type="submit"
          className="w-full bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
        >
          Update Entry
        </button>
      </form>
    </div>
  );
}