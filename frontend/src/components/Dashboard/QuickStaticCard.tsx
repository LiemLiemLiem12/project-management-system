import React from "react";
import { LucideIcon } from "lucide-react";

type QuickStaticCardProps = {
  label: string;
  quantity: number | string;
  time: string;
  color: string;
  icon: LucideIcon;
};

const QuickStaticCard: React.FC<QuickStaticCardProps> = ({
  label,
  quantity,
  time,
  color,
  icon: Icon,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-gray-800 leading-tight">
          {label}
        </h3>
        <p className="text-2xl font-bold text-gray-900">{quantity}</p>
        <p className="text-[10px] md:text-xs text-gray-400 font-medium">
          {time}
        </p>
      </div>

      {/* Render Icon linh hoạt dựa trên prop 'icon' */}
      <div
        className={`${color} p-2.5 md:p-3 rounded-xl text-white flex items-center justify-center`}
      >
        <Icon size={22} strokeWidth={2.5} />
      </div>
    </div>
  );
};

export default QuickStaticCard;
