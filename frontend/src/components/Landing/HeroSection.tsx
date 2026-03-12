import React from "react";
import { ArrowRight, PlayCircle } from "lucide-react";
import Image from "next/image";

const HeroSection = () => {
  return (
    <section className="bg-secondary py-16 px-6 md:px-12 lg:px-24 flex items-center">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col space-y-8">
          <h1 className="text-5xl md:text-7xl font-extrabold text-dark leading-[1.1] tracking-tight">
            Master Your Workflow with{" "}
            <span className="text-primary">Popket</span>
          </h1>

          <p className="text-gray-600 text-lg md:text-xl max-w-lg leading-relaxed">
            The all-in-one workspace for teams who want to stay organized, hit
            deadlines, and eliminate the stress of planning.
          </p>

          <div className="flex flex-wrap gap-4">
            <button className="flex items-center cursor-pointer gap-2 bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg shadow-blue-200">
              Get Started for Free <ArrowRight size={20} />
            </button>
            <button className="flex items-center gap-2 bg-white border border-gray-200 text-dark px-8 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all">
              Watch Demo <PlayCircle size={20} className="text-gray-400" />
            </button>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-white bg-background overflow-hidden"
                >
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`}
                    alt="user"
                  />
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 font-medium">
              Join <span className="text-dark font-bold">2,000+ teams</span>{" "}
              boosting productivity
            </p>
          </div>
        </div>

        <div className="relative flex justify-center lg:justify-end">
          <div className="relative w-full max-w-[500px] aspect-[4/3] bg-[#fdfaf6] rounded-[40px] shadow-2xl overflow-hidden p-8 flex items-center justify-center border border-white/50">
            <div className="relative w-[280px] h-[500px] bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
              <div className="w-full h-full bg-gray-50 p-4">
                <div className="space-y-4">
                  <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((idx) => (
                      <div
                        key={idx}
                        className="h-12 w-full bg-white border border-gray-100 rounded-lg flex items-center px-3 gap-3"
                      >
                        <div className="w-4 h-4 rounded-sm border border-gray-300"></div>
                        <div className="h-2 w-full bg-gray-100 rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute top-10 right-10 w-20 h-20 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
