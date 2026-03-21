"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const ROLES = ["All Roles", "Developer", "Designer", "Manager", "QA"];

export default function RoleDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(ROLES[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (role: string) => {
    setSelectedRole(role);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Nút Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-[130px] bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700 font-semibold py-2 px-3 rounded-lg text-sm"
      >
        <span className="truncate">{selectedRole}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Menu Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-full min-w-[130px] origin-top-right bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-10 duration-200">
          <ul className="py-1">
            {ROLES.map((role) => (
              <li key={role}>
                <button
                  onClick={() => handleSelect(role)}
                  className={`block w-full text-left px-4 py-2 text-sm transition-colors
                    ${
                      selectedRole === role
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                >
                  {role}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
