import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

export default function EditCredential() {
  const { data: session } = useSession();
  const router = useRouter();
  const { id } = router.query;

  const [website, setWebsite] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id || !session) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/credentials/${id}`);
        if (!res.ok) throw new Error("Failed to fetch credential");
        const data = await res.json();
        setWebsite(data.website);
        setUsername(data.username);
        setPassword(data.password);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [id, session]);

  if (!session) return <p className="text-center mt-10">Please login to edit credentials.</p>;
  if (loading) return <p className="text-center mt-10">Loading...</p>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const res = await fetch(`/api/credentials/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ website, username, password }),
    });

    if (res.ok) {
      router.push("/vault");
    } else {
      const data = await res.json();
      setError(data.message || "Failed to update credential");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4">Edit Credential</h1>
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
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Update Credential
        </button>
      </form>
    </div>
  );
}
