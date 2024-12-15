"use client";

import { useCallback, useEffect, useState } from "react";
import { loadFull } from "tsparticles";

const ParticlesBackground = () => {
  const [Particles, setParticles] = useState(null);

  useEffect(() => {
    const loadParticles = async () => {
      try {
        const particlesModule = await import("react-tsparticles");
        setParticles(() => particlesModule.default);
      } catch (error) {
        console.error("Error loading particles:", error);
      }
    };

    loadParticles();
  }, []);

  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  if (!Particles) return null;

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: { enable: false },
        particles: {
          number: {
            value: 100,
            density: {
              enable: true,
              value_area: 800,
            },
          },
          color: {
            value: "#ffffff",
          },
          opacity: {
            value: 0.5,
            random: true,
            animation: {
              enable: true,
              speed: 1,
              minimumValue: 0.1,
              sync: false,
            },
          },
          size: {
            value: 3,
            random: true,
            animation: {
              enable: true,
              speed: 2,
              minimumValue: 0.1,
              sync: false,
            },
          },

          firefly: {
            enable: true,
            speed: 1,
            direction: "none",
            random: true,
            straight: false,
            out_mode: "out",
            bounce: false,
          },
          move: {
            enable: true,
            speed: 1,
            direction: "none",
            random: true,
            straight: false,
            out_mode: "out",
            bounce: false,
          },
        },
        interactivity: {
          detect_on: "canvas",
          events: {
            onhover: {
              enable: true,
              mode: "grab",
            },
            resize: true,
          },
          modes: {
            grab: {
              distance: 140,
              line_linked: {
                opacity: 0.5,
              },
            },
          },
        },
        retina_detect: true,
        background: {
          color: "transparent",
          position: "50% 50%",
          repeat: "no-repeat",
          size: "cover",
        },
      }}
      className="absolute inset-0 z-0"
    />
  );
};

export default ParticlesBackground;
