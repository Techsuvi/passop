import { useRouter } from "next/router";

export default function CredentialCard({ credential, refresh }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this credential?")) return;

    await fetch(`/api/credentials/${credential._id}`, {
      method: "DELETE",
    });

    refresh(); // Refresh vault list
  };

  const handleEdit = () => {
    router.push(`/vault/${credential._id}`);
  };

  return (
    <div className="bg-white shadow rounded p-4 flex flex-col justify-between">
      <div>
        <h2 className="font-bold text-lg">{credential.website}</h2>
        <p className="text-sm text-gray-600">{credential.username}</p>
        <p className="text-sm mt-1">Password: {credential.password}</p>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          onClick={handleEdit}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
