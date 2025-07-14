import React from 'react';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-space text-white relative overflow-hidden">
      {/* Starfield effect */}
      <div className="absolute inset-0 bg-stars"></div>

      {/* Glowing center gradient */}
      <div className="absolute top-1/3 w-96 h-96 rounded-full bg-glow blur-3xl opacity-50"></div>

      <div className="relative z-10 text-center">
        <div className="mb-4 text-xl font-semibold text-steelblue-300">Giga AI</div>
        <h1 className="text-5xl font-extrabold mb-4">
          Make <span className="text-steelblue-300">Windsurf</span> Smarter
        </h1>
        <p className="text-lg mb-8">
          Giga automatically manages your <strong>rules files</strong>, so your AI <strong>stops hallucinating</strong> and understands <strong>your code style</strong>
        </p>
        <button className="bg-gradient-button hover:scale-105 transition-all text-white font-bold py-3 px-8 rounded-full shadow-2xl">
          Improve my AI 🛠️
        </button>
        <div className="mt-8 text-steelblue-300">★★★★★ 1000+ happy devs</div>
      </div>
    </div>
  );
};

export default LandingPage;
