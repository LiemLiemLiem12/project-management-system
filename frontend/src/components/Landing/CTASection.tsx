"use client";
import React from "react";

const CTASection = () => {
  return (
    <section className="relative py-20 px-6">
      <div
        className="max-w-7xl mx-auto bg-primary py-24 px-8 md:px-16 text-center text-white overflow-hidden relative"
        style={{
          clipPath: "polygon(0 5%, 100% 0%, 100% 95%, 0% 100%)",
        }}
      >
        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center space-y-8">
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Elevate your team’s <br />
            <span className="text-blue-200">productivity today</span>
          </h2>

          <p className="text-lg md:text-xl text-blue-100 opacity-90 max-w-2xl">
            Don’t let outdated workflows slow you down. Join thousands of
            businesses using Popket to manage projects smarter and faster.
          </p>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="w-full max-w-md flex flex-col sm:flex-row items-center gap-3 bg-white/10 p-2 rounded-2xl backdrop-blur-md border border-white/20"
          >
            <input
              type="email"
              placeholder="Enter your work email..."
              className="w-full bg-white text-dark px-6 py-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-300 transition-all font-medium"
              required
            />
            <button
              type="submit"
              className="w-full sm:w-auto bg-dark hover:bg-black text-white px-8 py-4 rounded-xl font-bold transition-all whitespace-nowrap active:scale-95"
            >
              Get Started
            </button>
          </form>

          <p className="text-sm text-blue-200/70">
            * No credit card required. Cancel anytime.
          </p>
        </div>

        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-400 rounded-full blur-[120px] opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-300 rounded-full blur-[150px] opacity-20 translate-x-1/3 translate-y-1/3"></div>
      </div>
    </section>
  );
};

export default CTASection;
