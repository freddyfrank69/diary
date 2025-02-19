"use client";
import { useEffect, useState } from "react";
import { fetchDiaries, deleteDiary, DiaryEntry } from "@/lib/api";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { token } = useAuth();
  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push("/login");
    } else {
      fetchDiaries(token)
        .then((data) => {
          setDiaries(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching diaries:", err);
          setError("Failed to load diaries");
          setLoading(false);
        });
    }
  }, [token, router]);
  

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  const handleDelete = async (id?: string) => {
    if (!id) {
      console.error("Diary ID is undefined");
      return;
    }
    if (!token) return;
    if (confirm("Are you sure you want to delete this diary entry?")) {
      try {
        await deleteDiary(id, token);
        setDiaries(diaries.filter((entry) => entry._id !== id));
      } catch (error) {
        console.error("Failed to delete diary:", error);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">My Diary Entries</h2>

      <button
        onClick={() => router.push("/add-diary")}
        className="bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600 transition"
      >
        + Add New Diary
      </button>

      <ul className="mt-4 space-y-4">
        {diaries.map((entry: DiaryEntry) => (
          <li key={entry._id} className="border-2 p-4 rounded-lg shadow-sm bg-gray-50">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{entry.title}</h3>
              <p className="text-gray-700 mt-1">{entry.body}</p>
              <p className="text-sm text-gray-500 mt-1">Created on: {new Date(entry.created_at.$date).toLocaleDateString()}</p>
            </div>
            <div className="flex justify-end space-x-2 mt-2">
              <button
                onClick={() => router.push(`/edit-diary/${entry._id}`)}
                className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(entry._id)}
                className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}