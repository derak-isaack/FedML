// StarfieldSVG.jsx
// import { useMemo } from 'react';
import React from 'react';
import Particles from '@tsparticles/react';
import { loadFull } from 'tsparticles';



const StarryBackground = ({ children }) => {
  const particlesInit = async (main) => {
    await loadFull(main); // Load the full tsparticles bundle
  };

  const particlesConfig = {
    background: {
      color: {
        value: 'transparent', // Set to transparent to use CSS gradient
      },
    },
    fpsLimit: 60,
    particles: {
      number: {
        value: 100, // Number of stars
        density: {
          enable: true,
          value_area: 800, // Adjusts density
        },
      },
      color: {
        value: ['#ffffff', '#f0e6ff', '#d9faff'], // Star colors (white, light purple, light blue)
      },
      shape: {
        type: 'circle', // Star shape
      },
      opacity: {
        value: 0.8,
        random: true,
        anim: {
          enable: true,
          speed: 1,
          opacity_min: 0.3,
          sync: false,
        },
      },
      size: {
        value: 2,
        random: { enable: true, minimumValue: 0.5 }, // Random star sizes
        anim: {
          enable: true,
          speed: 2,
          size_min: 0.3,
          sync: false,
        },
      },
      move: {
        enable: true,
        speed: 0.5, // Slow movement for a subtle drift
        direction: 'none',
        random: true,
        straight: false,
        outModes: {
          default: 'out',
        },
      },
      twinkle: {
        particles: {
          enable: true,
          frequency: 0.05,
          opacity: 1,
        },
      },
    },
    detectRetina: true,
  };

  return (
    <div className="starry-background">
      <Particles id="tsparticles" init={particlesInit} options={particlesConfig} />
      {children} {/* Render child components */}
    </div>
  );
};

export default StarryBackground;
