import React from "react";

export default function Account() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-red-600 text-white px-6 py-4 shadow-md">
        <h1 className="text-xl font-bold">Account</h1>
      </div>

      {/* User Info */}
      <div className="flex flex-col items-center px-6 py-10">
        <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-3xl font-bold shadow-md">
          S
        </div>
        <h2 className="mt-4 text-xl font-semibold text-gray-800">Shubham</h2>
        <p className="text-gray-500">shubham@example.com</p>
      </div>

      {/* Account Options */}
      <div className="px-6 space-y-4">
        <button className="w-full flex justify-between items-center p-4 bg-gray-50 rounded-xl shadow hover:bg-gray-100">
          <span className="text-gray-800 font-medium">Edit Profile</span>
          <span className="text-red-600 font-bold">{">"}</span>
        </button>

        <button className="w-full flex justify-between items-center p-4 bg-gray-50 rounded-xl shadow hover:bg-gray-100">
          <span className="text-gray-800 font-medium">Logout</span>
          <span className="text-red-600 font-bold">{">"}</span>
        </button>
      </div>
    </div>
  );
}
