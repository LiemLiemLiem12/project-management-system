import { Check, FileEdit, Layers, CalendarClock } from "lucide-react";
import QuickStaticCard from "./QuickStaticCard";

const QuickStatisticCardList = () => {
  const statsData = [
    {
      label: "Task Complete",
      quantity: "12",
      time: "in the last 7 days",
      color: "bg-green-500",
      icon: Check,
    },
    {
      label: "Task Updated",
      quantity: "2",
      time: "in the last 7 days",
      color: "bg-orange-500",
      icon: FileEdit,
    },
    {
      label: "Task Created",
      quantity: "5",
      time: "in the last 7 days",
      color: "bg-cyan-500",
      icon: Layers,
    },
    {
      label: "Task Due Soon",
      quantity: "2",
      time: "in the last 7 days",
      color: "bg-red-500",
      icon: CalendarClock,
    },
  ];

  return (
    <div className="mt-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <QuickStaticCard
            key={index}
            label={stat.label}
            quantity={stat.quantity}
            time={stat.time}
            color={stat.color}
            icon={stat.icon}
          />
        ))}
      </div>
    </div>
  );
};

export default QuickStatisticCardList;
