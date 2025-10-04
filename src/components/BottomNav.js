// BottomNav.jsx
import React from "react";

export default function BottomNav({ activeTab, setActiveTab }) {
  return (
    <div className="flex justify-around items-center h-16 border-t bg-white">
      {/* Home Tab */}
      <button onClick={() => setActiveTab("home")}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          {/* paste Home SVG path here */}
        </svg>
        <span className={`text-xs ${activeTab === "home" ? "text-blue-500" : "text-gray-500"}`}>Home</span>
      </button>

      {/* Account Tab */}
      <button onClick={() => setActiveTab("account")}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          {/* paste Accounts SVG path here */}
        </svg>
        <span className={`text-xs ${activeTab === "account" ? "text-blue-500" : "text-gray-500"}`}>Account</span>
      </button>
    </div>
  );
}
