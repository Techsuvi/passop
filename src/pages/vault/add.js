import { useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

export default function AddCredential() {
  const { data: session } = useSession();
  const router = useRouter();
  const [website, setWebsite] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!session) return <p className="text-center mt-10">Please login to add credentials.</p>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!website || !username || !password) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/credentials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ website, username, password }),
    });

    if (res.ok) {
      router.push("/vault");
    } else {
      const data = await res.json();
      setError(data.message || "Failed to add credential");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4">Add New Credential</h1>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <input
          type="text"
          placeholder="Username / Email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <input
          type="text"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Credential"}
        </button>
      </form>
    </div>
  );
}
