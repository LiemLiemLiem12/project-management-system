import React from "react";
import { Calendar, Users2, BarChart3, ChevronRight } from "lucide-react";

const features = [
  {
    title: "Intuitive Scheduling",
    description:
      "Drag-and-drop tasks directly onto your calendar with our seamless interface. Visualize your week at a glance.",
    icon: <Calendar className="text-blue-600" size={24} />,
    bgColor: "bg-blue-50/50",
    linkColor: "text-blue-600",
    iconBg: "bg-white",
  },
  {
    title: "Team Collaboration",
    description:
      "Real-time updates and seamless communication for your entire squad. Keep everyone aligned without the meetings.",
    icon: <Users2 className="text-indigo-600" size={24} />,
    bgColor: "bg-indigo-50/50",
    linkColor: "text-indigo-600",
    iconBg: "bg-white",
  },
  {
    title: "Smart Analytics",
    description:
      "Gain insights into productivity trends with automated reporting. Identify bottlenecks before they become blockers.",
    icon: <BarChart3 className="text-emerald-600" size={24} />,
    bgColor: "bg-emerald-50/50",
    linkColor: "text-emerald-600",
    iconBg: "bg-white",
  },
];

const FeaturesSection = () => {
  return (
    <section className="bg-white py-24 px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-20 space-y-4">
          <p className="text-primary font-bold tracking-[0.2em] text-sm uppercase">
            Everything you need
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-dark tracking-tight">
            Designed for Productivity
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
            Focus on the work that matters. Our toolset is built to help teams
            organize projects and reach goals faster than ever.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`${feature.bgColor} rounded-[32px] p-10 flex flex-col items-start transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border border-transparent hover:border-white/50`}
            >
              {/* Icon Container */}
              <div
                className={`${feature.iconBg} p-4 rounded-2xl shadow-sm mb-8 flex items-center justify-center`}
              >
                {feature.icon}
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-dark mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed mb-8 flex-grow">
                {feature.description}
              </p>

              {/* Link */}
              <a
                href="#"
                className={`flex items-center gap-1 font-bold ${feature.linkColor} hover:gap-2 transition-all group`}
              >
                Learn more
                <ChevronRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
