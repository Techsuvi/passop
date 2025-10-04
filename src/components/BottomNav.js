// BottomNav.jsx
import React from "react";

export default function BottomNav({ activeTab, setActiveTab }) {
  return (
    <div className="flex justify-around items-center h-16 border-t border-[#2A2C3E] bg-[#1B1D2B] shadow-t-lg z-20">
      
      {/* Home Tab */}
      <button
        onClick={() => setActiveTab("home")}
        className="flex flex-col items-center justify-center focus:outline-none"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          {/* paste Home SVG path here */}
        </svg>
        <span
          className={`text-xs mt-1 font-medium ${
            activeTab === "home" ? "text-[#FF4B4B]" : "text-[#7E7F9A]"
          }`}
        >
          Home
        </span>
      </button>

      {/* Add Button (Center/Floating) */}
      <button
        onClick={() => setActiveTab("add")}
        className="flex items-center justify-center -mt-6 w-14 h-14 rounded-full bg-gradient-to-r from-[#FF4B4B] to-[#D12A2A] shadow-lg shadow-red-500/30 hover:scale-105 transition-transform"
      >
        <svg width="36" height="36" viewBox="0 0 24 24" fill="white">
          {/* paste Plus SVG path here */}
        </svg>
      </button>

      {/* Account Tab */}
      <button
        onClick={() => setActiveTab("account")}
        className="flex flex-col items-center justify-center focus:outline-none"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          {/* paste Account SVG path here */}
        </svg>
        <span
          className={`text-xs mt-1 font-medium ${
            activeTab === "account" ? "text-[#FF4B4B]" : "text-[#7E7F9A]"
          }`}
        >
          Account
        </span>
      </button>
    </div>
  );
}
