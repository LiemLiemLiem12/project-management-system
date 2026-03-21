import React from "react";
import { Filter } from "lucide-react";

export default function DashboardFilter() {
  return (
    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200">
      <Filter className="w-5 h-5" />
    </button>
  );
}
