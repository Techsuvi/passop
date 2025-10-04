import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function PinLock() {
  const router = useRouter();
  const [pin, setPin] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [savedPin, setSavedPin] = useState(null);
  const [mounted, setMounted] = useState(false);

  // Only access localStorage on client
  useEffect(() => {
    const pinFromStorage = localStorage.getItem("userPin");
    if (pinFromStorage) setSavedPin(pinFromStorage);
    setMounted(true);
  }, []);

  if (!mounted) return null; // Avoid SSR errors

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value && index < 3) {
      document.getElementById(`pin-${index + 1}`).focus();
    }
  };

  const handleSubmit = () => {
    const enteredPin = pin.join("");
    if (savedPin) {
      if (enteredPin === savedPin) {
        router.push("/vault");
      } else {
        setError("Incorrect PIN. Try again.");
        setPin(["", "", "", ""]);
        document.getElementById("pin-0").focus();
      }
    } else {
      localStorage.setItem("userPin", enteredPin);
      router.push("/vault");
    }
  };

  return (
    <div className="flex flex-col items-center justify-between h-screen bg-white px-6">
      <div className="flex flex-1 flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-black mb-2">
          {savedPin ? "Enter PIN" : "Set Your PIN"}
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          {savedPin
            ? "Unlock your vault"
            : "Create a 4-digit PIN to protect your vault"}
        </p>

        <div className="flex space-x-3 mb-4">
          {pin.map((digit, idx) => (
            <input
              key={idx}
              id={`pin-${idx}`}
              type="password"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(e.target.value, idx)}
              className="w-12 h-12 text-center text-2xl font-bold border-2 border-red-500 rounded-lg focus:outline-none focus:border-black"
            />
          ))}
        </div>

        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={pin.some((digit) => digit === "")}
          className="bg-red-500 text-white font-semibold px-8 py-2 rounded-lg hover:bg-red-600 disabled:bg-gray-300"
        >
          {savedPin ? "Unlock" : "Set PIN"}
        </button>
      </div>

      <p className="text-sm text-gray-600 pb-6">Secure. Simple. Safe.</p>
    </div>
  );
}
