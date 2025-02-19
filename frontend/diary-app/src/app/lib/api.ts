const API_URL = "http://localhost:5000"; // Adjust if necessary

export interface DiaryEntry {
  _id: string;
  title: string;
  body: string;
  created_at: string;
}

export const registerUser = async (username: string, password: string) => {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return res.json();
};

export const loginUser = async (username: string, password: string) => {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return res.json();
};

export const fetchDiaries = async (token: string): Promise<DiaryEntry[]> => {
  const res = await fetch(`${API_URL}/diary`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  let data;
  try {
    data = await res.json();
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return [];
  }

  if (!Array.isArray(data)) {
    console.error("Unexpected API response:", data);
    return [];
  }

  return data;
};


export const createDiary = async (title: string, body: string, token: string) => {
  const res = await fetch("http://localhost:5000/diary", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, body }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to create diary entry");
  }

  return res.json();
};


export const editDiary = async (id: string, title: string, body: string, token: string) => {
  const res = await fetch(`${API_URL}/diary/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, body }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to edit diary entry");
  }

  return res.json();
};


export const deleteDiary = async (id: string, token: string) => {
  if (!id) throw new Error("Invalid diary ID");

  const res = await fetch(`http://localhost:5000/diary/${id}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` },
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to delete diary entry");
  }

  return res.json();
};


