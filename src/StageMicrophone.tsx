import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion';

// Art Deco Futurism color palette
const COLORS = {
  gold: '#d4af37',
  goldLight: '#f4d03f',
  teal: '#008080',
  tealLight: '#20b2aa',
  purple: '#4a0e4e',
  purpleLight: '#7b2d8e',
  darkBg: '#0a0a0f',
  stageDark: '#050508',
};

// Generate deterministic light rays
const generateLightRays = (count: number): Array<{
  angle: number;
  width: number;
  color: string;
  speed: number;
  opacity: number;
  offset: number;
}> => {
  const rays = [];
  const colorOptions = [COLORS.gold, COLORS.teal, COLORS.purpleLight, COLORS.goldLight, COLORS.tealLight];

  for (let i = 0; i < count; i++) {
    const seed1 = Math.sin(i * 12.9898) * 43758.5453;
    const seed2 = Math.sin(i * 78.233) * 43758.5453;
    const seed3 = Math.sin(i * 37.719) * 43758.5453;
    const seed4 = Math.sin(i * 94.673) * 43758.5453;
    const seed5 = Math.sin(i * 56.128) * 43758.5453;

    rays.push({
      angle: -40 + (seed1 - Math.floor(seed1)) * 80, // -40 to 40 degrees
      width: 2 + (seed2 - Math.floor(seed2)) * 6, // 2-8% width
      color: colorOptions[Math.floor((seed3 - Math.floor(seed3)) * colorOptions.length)],
      speed: 0.5 + (seed4 - Math.floor(seed4)) * 1.5, // Animation speed multiplier
      opacity: 0.15 + (seed5 - Math.floor(seed5)) * 0.25, // 0.15-0.4 opacity
      offset: (seed1 - Math.floor(seed1)) * Math.PI * 2,
    });
  }
  return rays;
};

const LIGHT_RAYS = generateLightRays(12);

interface LightRayProps {
  angle: number;
  width: number;
  color: string;
  speed: number;
  opacity: number;
  offset: number;
  frame: number;
  baseX: number;
}

const LightRay: React.FC<LightRayProps> = ({ angle, width, color, speed, opacity, offset, frame, baseX }) => {
  // Gentle pulsing and swaying animation
  const pulse = 0.7 + 0.3 * Math.sin(frame * 0.02 * speed + offset);
  const sway = Math.sin(frame * 0.015 * speed + offset) * 3;

  return (
    <div
      style={{
        position: 'absolute',
        top: '-20%',
        left: `${baseX}%`,
        width: `${width}%`,
        height: '140%',
        background: `linear-gradient(to bottom, ${color} 0%, transparent 70%)`,
        opacity: opacity * pulse,
        transform: `rotate(${angle + sway}deg)`,
        transformOrigin: 'top center',
        filter: 'blur(8px)',
      }}
    />
  );
};

// Art Deco geometric accent shapes
interface DecoAccentProps {
  frame: number;
  progress: number;
}

const DecoAccents: React.FC<DecoAccentProps> = ({ frame, progress }) => {
  // Subtle floating geometric shapes
  const float1 = Math.sin(frame * 0.02) * 10;
  const float2 = Math.sin(frame * 0.025 + 1) * 8;
  const float3 = Math.sin(frame * 0.018 + 2) * 12;

  return (
    <>
      {/* Top left deco triangle */}
      <div
        style={{
          position: 'absolute',
          top: '8%',
          left: '5%',
          width: 0,
          height: 0,
          borderLeft: '20px solid transparent',
          borderRight: '20px solid transparent',
          borderBottom: `35px solid ${COLORS.gold}`,
          opacity: 0.15,
          transform: `translateY(${float1}px)`,
          filter: 'blur(1px)',
        }}
      />

      {/* Top right deco diamond */}
      <div
        style={{
          position: 'absolute',
          top: '12%',
          right: '8%',
          width: 25,
          height: 25,
          backgroundColor: COLORS.teal,
          opacity: 0.12,
          transform: `rotate(45deg) translateY(${float2}px)`,
          filter: 'blur(1px)',
        }}
      />

      {/* Left side line accent */}
      <div
        style={{
          position: 'absolute',
          top: '25%',
          left: '3%',
          width: 3,
          height: 80,
          backgroundColor: COLORS.goldLight,
          opacity: 0.2,
          transform: `translateY(${float3}px)`,
        }}
      />

      {/* Right side line accent */}
      <div
        style={{
          position: 'absolute',
          top: '30%',
          right: '4%',
          width: 3,
          height: 60,
          backgroundColor: COLORS.purpleLight,
          opacity: 0.18,
          transform: `translateY(${-float2}px)`,
        }}
      />
    </>
  );
};

// Microphone component
const Microphone: React.FC<{ scale?: number }> = ({ scale = 1 }) => {
  return (
    <div
      style={{
        position: 'relative',
        width: 60 * scale,
        height: 280 * scale,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Mic head */}
      <div
        style={{
          width: 50 * scale,
          height: 70 * scale,
          borderRadius: '50% 50% 45% 45%',
          backgroundColor: '#1a1a1a',
          border: `2px solid ${COLORS.gold}`,
          boxShadow: `0 0 20px rgba(212, 175, 55, 0.3)`,
          position: 'relative',
        }}
      >
        {/* Mic grille lines */}
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: 12 * scale + i * 10 * scale,
              left: '15%',
              right: '15%',
              height: 1,
              backgroundColor: COLORS.gold,
              opacity: 0.4,
            }}
          />
        ))}
      </div>

      {/* Mic neck/connector */}
      <div
        style={{
          width: 12 * scale,
          height: 20 * scale,
          backgroundColor: '#1a1a1a',
          borderLeft: `1px solid ${COLORS.gold}`,
          borderRight: `1px solid ${COLORS.gold}`,
        }}
      />

      {/* Stand pole */}
      <div
        style={{
          width: 8 * scale,
          height: 160 * scale,
          background: `linear-gradient(to right, #0a0a0a, #2a2a2a, #0a0a0a)`,
          borderLeft: `1px solid rgba(212, 175, 55, 0.3)`,
          borderRight: `1px solid rgba(212, 175, 55, 0.3)`,
        }}
      />

      {/* Stand base */}
      <div
        style={{
          width: 60 * scale,
          height: 8 * scale,
          backgroundColor: '#1a1a1a',
          borderRadius: 4 * scale,
          border: `1px solid ${COLORS.gold}`,
          boxShadow: `0 0 15px rgba(212, 175, 55, 0.2)`,
        }}
      />
    </div>
  );
};

// Walking figure silhouette
interface WalkingFigureProps {
  x: number; // -100 to 200 (can be off screen)
  walkCycle: number; // 0 to 1 for walk animation
  scale?: number;
}

const WalkingFigure: React.FC<WalkingFigureProps> = ({ x, walkCycle, scale = 1 }) => {
  // Walk cycle animations
  const legSwing = Math.sin(walkCycle * Math.PI * 2) * 25;
  const armSwing = Math.sin(walkCycle * Math.PI * 2) * 20;
  const bodyBob = Math.abs(Math.sin(walkCycle * Math.PI * 4)) * 3;

  const figureHeight = 320 * scale;
  const figureWidth = 120 * scale;

  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        bottom: '12%',
        width: figureWidth,
        height: figureHeight,
        transform: `translateX(-50%) translateY(${-bodyBob}px)`,
      }}
    >
      {/* Head */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 45 * scale,
          height: 55 * scale,
          borderRadius: '50% 50% 45% 45%',
          backgroundColor: '#0a0a0f',
        }}
      />

      {/* Neck */}
      <div
        style={{
          position: 'absolute',
          top: 50 * scale,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 18 * scale,
          height: 15 * scale,
          backgroundColor: '#0a0a0f',
        }}
      />

      {/* Torso */}
      <div
        style={{
          position: 'absolute',
          top: 60 * scale,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 55 * scale,
          height: 90 * scale,
          backgroundColor: '#0a0a0f',
          borderRadius: '10px 10px 5px 5px',
        }}
      />

      {/* Left arm */}
      <div
        style={{
          position: 'absolute',
          top: 65 * scale,
          left: '20%',
          width: 14 * scale,
          height: 75 * scale,
          backgroundColor: '#0a0a0f',
          borderRadius: 7 * scale,
          transformOrigin: 'top center',
          transform: `rotate(${-armSwing}deg)`,
        }}
      />

      {/* Right arm */}
      <div
        style={{
          position: 'absolute',
          top: 65 * scale,
          right: '20%',
          width: 14 * scale,
          height: 75 * scale,
          backgroundColor: '#0a0a0f',
          borderRadius: 7 * scale,
          transformOrigin: 'top center',
          transform: `rotate(${armSwing}deg)`,
        }}
      />

      {/* Left leg */}
      <div
        style={{
          position: 'absolute',
          top: 145 * scale,
          left: '32%',
          width: 18 * scale,
          height: 95 * scale,
          backgroundColor: '#0a0a0f',
          borderRadius: 8 * scale,
          transformOrigin: 'top center',
          transform: `rotate(${legSwing}deg)`,
        }}
      />

      {/* Right leg */}
      <div
        style={{
          position: 'absolute',
          top: 145 * scale,
          right: '32%',
          width: 18 * scale,
          height: 95 * scale,
          backgroundColor: '#0a0a0f',
          borderRadius: 8 * scale,
          transformOrigin: 'top center',
          transform: `rotate(${-legSwing}deg)`,
        }}
      />

      {/* Left foot */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: '25%',
          width: 28 * scale,
          height: 12 * scale,
          backgroundColor: '#0a0a0f',
          borderRadius: '3px 8px 5px 3px',
          transform: `translateX(${Math.sin(walkCycle * Math.PI * 2) * 15 * scale}px)`,
        }}
      />

      {/* Right foot */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          right: '25%',
          width: 28 * scale,
          height: 12 * scale,
          backgroundColor: '#0a0a0f',
          borderRadius: '8px 3px 3px 5px',
          transform: `translateX(${-Math.sin(walkCycle * Math.PI * 2) * 15 * scale}px)`,
        }}
      />
    </div>
  );
};

// Stage floor with perspective
const StageFloor: React.FC = () => {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '18%',
        background: `linear-gradient(to bottom,
          ${COLORS.stageDark} 0%,
          #0c0c12 50%,
          #0a0a0f 100%
        )`,
        borderTop: `1px solid rgba(212, 175, 55, 0.15)`,
      }}
    >
      {/* Stage edge highlight */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '10%',
          right: '10%',
          height: 2,
          background: `linear-gradient(to right,
            transparent 0%,
            ${COLORS.gold}40 20%,
            ${COLORS.gold}60 50%,
            ${COLORS.gold}40 80%,
            transparent 100%
          )`,
        }}
      />

      {/* Subtle floor reflection lines */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: `${20 + i * 18}%`,
            left: '5%',
            right: '5%',
            height: 1,
            background: `linear-gradient(to right,
              transparent 0%,
              rgba(212, 175, 55, ${0.05 - i * 0.008}) 30%,
              rgba(212, 175, 55, ${0.08 - i * 0.012}) 50%,
              rgba(212, 175, 55, ${0.05 - i * 0.008}) 70%,
              transparent 100%
            )`,
          }}
        />
      ))}
    </div>
  );
};

// Spotlight effect on microphone
const Spotlight: React.FC<{ frame: number }> = ({ frame }) => {
  const flicker = 0.85 + 0.15 * Math.sin(frame * 0.08);

  return (
    <div
      style={{
        position: 'absolute',
        top: '-10%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '40%',
        height: '100%',
        background: `radial-gradient(ellipse at 50% 0%,
          rgba(212, 175, 55, ${0.08 * flicker}) 0%,
          rgba(212, 175, 55, ${0.04 * flicker}) 30%,
          transparent 60%
        )`,
        pointerEvents: 'none',
      }}
    />
  );
};

export const StageMicrophone: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  // Progress through the animation (0 to 1)
  const progress = frame / durationInFrames;

  // Camera pan - creates the looping walk effect
  // Camera starts centered, pans right to follow figure walking in from left,
  // then pans back as figure approaches mic, creating continuous loop feel
  const cameraPan = useMemo(() => {
    // Pan cycle: start at 0, go to -15 (following figure from left), back to 0
    return interpolate(
      progress,
      [0, 0.3, 0.7, 1],
      [0, -8, 5, 0],
      {
        easing: Easing.inOut(Easing.ease),
      }
    );
  }, [progress]);

  // Figure walking position
  // Starts from left (off screen), walks to near microphone, loops
  const figureX = useMemo(() => {
    return interpolate(
      progress,
      [0, 0.15, 0.85, 1],
      [-15, 35, 48, 50],
      {
        easing: Easing.inOut(Easing.ease),
      }
    );
  }, [progress]);

  // Walk cycle speed (faster at start, slows as approaching mic)
  const walkSpeed = useMemo(() => {
    const baseSpeed = interpolate(
      progress,
      [0, 0.5, 0.85, 1],
      [8, 6, 3, 0],
      {
        easing: Easing.out(Easing.ease),
      }
    );
    return (frame * baseSpeed * 0.1) % 1;
  }, [frame, progress]);

  // Ambient light intensity variation
  const ambientPulse = 0.9 + 0.1 * Math.sin(frame * 0.015);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.darkBg,
      }}
    >
      {/* Scene container with camera movement */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          transform: `translateX(${cameraPan}%)`,
        }}
      >
        {/* Background gradient - deep dark with subtle color */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: `radial-gradient(ellipse at 50% 30%,
              ${COLORS.purple}15 0%,
              ${COLORS.darkBg} 50%,
              #000005 100%
            )`,
            opacity: ambientPulse,
          }}
        />

        {/* Light rays from above */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
          }}
        >
          {LIGHT_RAYS.map((ray, index) => (
            <LightRay
              key={index}
              {...ray}
              frame={frame}
              baseX={15 + (index / LIGHT_RAYS.length) * 70}
            />
          ))}
        </div>

        {/* Art deco geometric accents */}
        <DecoAccents frame={frame} progress={progress} />

        {/* Spotlight on mic area */}
        <Spotlight frame={frame} />

        {/* Stage floor */}
        <StageFloor />

        {/* Microphone - positioned center stage */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '12%',
            transform: 'translateX(-50%)',
            zIndex: 10,
          }}
        >
          <Microphone scale={0.9} />
        </div>

        {/* Walking figure */}
        <WalkingFigure
          x={figureX}
          walkCycle={walkSpeed}
          scale={0.85}
        />

        {/* Vignette overlay */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: `radial-gradient(ellipse at 50% 50%,
              transparent 30%,
              rgba(0, 0, 0, 0.4) 70%,
              rgba(0, 0, 0, 0.7) 100%
            )`,
            pointerEvents: 'none',
          }}
        />

        {/* Top fade for depth */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '20%',
            background: `linear-gradient(to bottom,
              rgba(0, 0, 0, 0.6) 0%,
              transparent 100%
            )`,
            pointerEvents: 'none',
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
