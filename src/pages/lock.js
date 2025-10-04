import { useState } from "react";
import { useRouter } from "next/router";

export default function LockScreen() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    if (e.target.value.length <= 4) {
      setPin(e.target.value);
    }
  };

  const handleSubmit = () => {
    const savedPin = localStorage.getItem("userPin");
    if (pin === savedPin) {
      router.push("/vault");
    } else {
      setError("Incorrect PIN");
      setPin("");
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <h1 className="text-2xl font-bold text-red-600 mb-6">Enter PIN</h1>
      <input
        type="password"
        value={pin}
        onChange={handleChange}
        maxLength={4}
        className="border-2 border-red-600 text-center text-2xl p-2 rounded w-32 tracking-widest"
      />
      {error && <p className="text-red-500 mt-2">{error}</p>}
      <button
        onClick={handleSubmit}
        className="mt-6 bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
      >
        Unlock
      </button>
    </div>
  );
}
