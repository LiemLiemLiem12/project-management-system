"use client";
import { useState } from "react";
import { Trash2, Plus, X } from "lucide-react";

// 1. Mock Data ban đầu
const initialData = [
  { id: 1, label: "Define typography hierarchy", done: true },
  { id: 2, label: "Establish primary color usage", done: true },
  { id: 3, label: "Implement sidebar automation section", done: false },
  { id: 4, label: "Connect linked work items API", done: false },
];

export default function TaskChecklist() {
  const [items, setItems] = useState(initialData);
  const [isAdding, setIsAdding] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const completedCount = items.filter((i) => i.done).length;
  const progress =
    items.length === 0 ? 0 : (completedCount / items.length) * 100;

  const toggleItem = (id: number) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item,
      ),
    );
  };

  const deleteItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleAddItem = () => {
    if (!inputValue.trim()) return;
    const newItem = {
      id: Date.now(),
      label: inputValue,
      done: false,
    };
    setItems([...items, newItem]);
    setInputValue("");
    setIsAdding(false);
  };

  return (
    <section id="section-checklist" className="scroll-mt-6 ">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Checklist</h2>
          {items.length > 0 && (
            <span className="px-2 py-0.5 text-xs font-semibold bg-slate-100 rounded-full text-slate-600">
              {completedCount}/{items.length}
            </span>
          )}
        </div>
        {items.length > 0 && (
          <button
            onClick={() => setItems([])}
            className="text-sm font-medium text-slate-500 hover:text-red-600 transition-colors"
          >
            Delete list
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {items.length > 0 && (
        <div className="w-full bg-slate-100 rounded-full h-1.5 mb-6 overflow-hidden">
          <div
            className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      {/* Items List */}
      <div className="space-y-1">
        {items.map((item) => (
          <div
            key={item.id}
            className="group flex items-center justify-between p-2 -mx-2 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <label className="flex items-start gap-3 cursor-pointer flex-1">
              <input
                type="checkbox"
                checked={item.done}
                onChange={() => toggleItem(item.id)}
                className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-600 cursor-pointer"
              />
              <span
                className={`text-sm transition-all ${
                  item.done ? "line-through text-slate-400" : "text-slate-700"
                }`}
              >
                {item.label}
              </span>
            </label>

            {/* Nút xóa hiện khi hover */}
            <button
              onClick={() => deleteItem(item.id)}
              className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-3">
        {isAdding ? (
          <div className="space-y-2">
            <input
              autoFocus
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddItem();
                if (e.key === "Escape") setIsAdding(false);
              }}
              className="py-2 px-4 w-full border border-blue-500 outline-none rounded-md bg-white text-sm shadow-sm"
              placeholder="What needs to be done?"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddItem}
                className="px-3 py-1.5 bg-primary text-sm font-medium rounded hover:bg-primary"
              >
                Add
              </button>
              <button
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 text-slate-600 text-sm font-medium hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors py-1"
          >
            <Plus size={16} />
            Add an item
          </button>
        )}
      </div>
    </section>
  );
}
