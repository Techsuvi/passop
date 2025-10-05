import React from "react";

export default function Settings() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-red-600 text-white px-6 py-4 shadow-md">
        <h1 className="text-xl font-bold">Settings</h1>
      </div>

      {/* Settings List */}
      <div className="flex-1 px-6 py-4 space-y-4">
        <button className="w-full flex justify-between items-center p-4 bg-gray-50 rounded-xl shadow hover:bg-gray-100">
          <span className="text-gray-800 font-medium">Change PIN</span>
          <span className="text-red-600 font-bold">{">"}</span>
        </button>

        <button className="w-full flex justify-between items-center p-4 bg-gray-50 rounded-xl shadow hover:bg-gray-100">
          <span className="text-gray-800 font-medium">Theme</span>
          <span className="text-red-600 font-bold">Light</span>
        </button>

        <button className="w-full flex justify-between items-center p-4 bg-gray-50 rounded-xl shadow hover:bg-gray-100">
          <span className="text-gray-800 font-medium">About</span>
          <span className="text-red-600 font-bold">{">"}</span>
        </button>
      </div>
    </div>
  );
}
