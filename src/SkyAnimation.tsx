import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion';

// Sky color phases: night -> sunrise -> day -> sunset -> night
const SKY_COLORS = {
  night: {
    top: '#0a0a1a',
    bottom: '#1a1a3a',
  },
  sunrise: {
    top: '#1a1a4a',
    bottom: '#ff6b4a',
  },
  day: {
    top: '#4a90d9',
    bottom: '#87ceeb',
  },
  sunset: {
    top: '#2d1b4e',
    bottom: '#ff4500',
  },
};

// Generate deterministic stars
const generateStars = (count: number): Array<{ x: number; y: number; size: number; twinkleOffset: number }> => {
  const stars = [];
  for (let i = 0; i < count; i++) {
    // Use deterministic pseudo-random based on index
    const seed1 = Math.sin(i * 12.9898) * 43758.5453;
    const seed2 = Math.sin(i * 78.233) * 43758.5453;
    const seed3 = Math.sin(i * 37.719) * 43758.5453;
    const seed4 = Math.sin(i * 94.673) * 43758.5453;

    stars.push({
      x: (seed1 - Math.floor(seed1)) * 100,
      y: (seed2 - Math.floor(seed2)) * 60, // Stars in upper 60% of sky
      size: 1 + (seed3 - Math.floor(seed3)) * 2,
      twinkleOffset: (seed4 - Math.floor(seed4)) * Math.PI * 2,
    });
  }
  return stars;
};

const STARS = generateStars(150);

interface StarProps {
  x: number;
  y: number;
  size: number;
  twinkleOffset: number;
  opacity: number;
  frame: number;
}

const Star: React.FC<StarProps> = ({ x, y, size, twinkleOffset, opacity, frame }) => {
  // Twinkle effect
  const twinkle = 0.5 + 0.5 * Math.sin(frame * 0.1 + twinkleOffset);
  const finalOpacity = opacity * twinkle;

  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: 'white',
        opacity: finalOpacity,
        boxShadow: `0 0 ${size * 2}px ${size}px rgba(255, 255, 255, ${finalOpacity * 0.5})`,
      }}
    />
  );
};

interface CelestialBodyProps {
  progress: number; // 0 to 1 for full cycle
  type: 'sun' | 'moon';
}

const CelestialBody: React.FC<CelestialBodyProps> = ({ progress, type }) => {
  const { width, height } = useVideoConfig();

  // Sun is visible from ~0.15 to ~0.65 (rising at 0.15, peak at 0.4, setting at 0.65)
  // Moon is visible from ~0.65 to ~1.15 (wrapping around)

  let bodyProgress: number;
  let isVisible: boolean;

  if (type === 'sun') {
    // Sun rises at 0.15, peaks at 0.4, sets at 0.65
    if (progress >= 0.15 && progress <= 0.65) {
      bodyProgress = (progress - 0.15) / 0.5; // 0 to 1
      isVisible = true;
    } else {
      bodyProgress = 0;
      isVisible = false;
    }
  } else {
    // Moon rises at 0.65, peaks at 0.9, sets at 0.15 (wraps around)
    if (progress >= 0.65) {
      bodyProgress = (progress - 0.65) / 0.5; // 0 to 1 for first half
      isVisible = true;
    } else if (progress <= 0.15) {
      bodyProgress = 0.7 + (progress / 0.15) * 0.3; // Continue from 0.7 to 1
      isVisible = true;
    } else {
      bodyProgress = 0;
      isVisible = false;
    }
  }

  if (!isVisible) return null;

  // Arc path: parabolic motion
  const x = interpolate(bodyProgress, [0, 1], [10, 90]);
  const peakHeight = 20; // Highest point (% from top)
  const horizonHeight = 85; // Horizon level (% from top)

  // Parabolic arc: y = horizon - (1 - (2x - 1)^2) * (horizon - peak)
  const normalizedX = (bodyProgress - 0.5) * 2; // -1 to 1
  const arcHeight = horizonHeight - (1 - normalizedX * normalizedX) * (horizonHeight - peakHeight);

  const size = type === 'sun' ? 80 : 60;

  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${arcHeight}%`,
        transform: 'translate(-50%, -50%)',
        width: size,
        height: size,
        borderRadius: '50%',
        background: type === 'sun'
          ? 'radial-gradient(circle, #fff9c4 0%, #ffeb3b 30%, #ff9800 100%)'
          : 'radial-gradient(circle at 30% 30%, #f5f5f5 0%, #e0e0e0 50%, #bdbdbd 100%)',
        boxShadow: type === 'sun'
          ? '0 0 60px 30px rgba(255, 235, 59, 0.6), 0 0 100px 60px rgba(255, 152, 0, 0.3)'
          : '0 0 30px 10px rgba(255, 255, 255, 0.3)',
      }}
    >
      {type === 'moon' && (
        // Moon craters
        <>
          <div style={{
            position: 'absolute',
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: 'rgba(0,0,0,0.1)',
            top: '20%',
            left: '25%',
          }} />
          <div style={{
            position: 'absolute',
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: 'rgba(0,0,0,0.08)',
            top: '50%',
            left: '60%',
          }} />
          <div style={{
            position: 'absolute',
            width: 15,
            height: 15,
            borderRadius: '50%',
            backgroundColor: 'rgba(0,0,0,0.12)',
            top: '60%',
            left: '30%',
          }} />
        </>
      )}
    </div>
  );
};

// Interpolate between two colors
const interpolateColor = (color1: string, color2: string, t: number): string => {
  const hex2rgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : { r: 0, g: 0, b: 0 };
  };

  const rgb2hex = (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  const c1 = hex2rgb(color1);
  const c2 = hex2rgb(color2);

  return rgb2hex(
    c1.r + (c2.r - c1.r) * t,
    c1.g + (c2.g - c1.g) * t,
    c1.b + (c2.b - c1.b) * t
  );
};

export const SkyAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  // Progress through the day cycle (0 to 1)
  const progress = frame / durationInFrames;

  // Define color transition keyframes
  // 0.0 - 0.15: Night
  // 0.15 - 0.25: Sunrise
  // 0.25 - 0.55: Day
  // 0.55 - 0.70: Sunset
  // 0.70 - 1.0: Night

  const getSkyColors = (p: number): { top: string; bottom: string } => {
    if (p < 0.15) {
      // Night
      return SKY_COLORS.night;
    } else if (p < 0.25) {
      // Night to Sunrise transition
      const t = (p - 0.15) / 0.1;
      return {
        top: interpolateColor(SKY_COLORS.night.top, SKY_COLORS.sunrise.top, t),
        bottom: interpolateColor(SKY_COLORS.night.bottom, SKY_COLORS.sunrise.bottom, t),
      };
    } else if (p < 0.35) {
      // Sunrise to Day transition
      const t = (p - 0.25) / 0.1;
      return {
        top: interpolateColor(SKY_COLORS.sunrise.top, SKY_COLORS.day.top, t),
        bottom: interpolateColor(SKY_COLORS.sunrise.bottom, SKY_COLORS.day.bottom, t),
      };
    } else if (p < 0.55) {
      // Day
      return SKY_COLORS.day;
    } else if (p < 0.65) {
      // Day to Sunset transition
      const t = (p - 0.55) / 0.1;
      return {
        top: interpolateColor(SKY_COLORS.day.top, SKY_COLORS.sunset.top, t),
        bottom: interpolateColor(SKY_COLORS.day.bottom, SKY_COLORS.sunset.bottom, t),
      };
    } else if (p < 0.75) {
      // Sunset to Night transition
      const t = (p - 0.65) / 0.1;
      return {
        top: interpolateColor(SKY_COLORS.sunset.top, SKY_COLORS.night.top, t),
        bottom: interpolateColor(SKY_COLORS.sunset.bottom, SKY_COLORS.night.bottom, t),
      };
    } else {
      // Night
      return SKY_COLORS.night;
    }
  };

  const skyColors = getSkyColors(progress);

  // Star visibility: visible during night, fade during sunrise/sunset
  const starOpacity = useMemo(() => {
    if (progress < 0.15) return 1;
    if (progress < 0.25) return 1 - (progress - 0.15) / 0.1;
    if (progress < 0.65) return 0;
    if (progress < 0.75) return (progress - 0.65) / 0.1;
    return 1;
  }, [progress]);

  return (
    <AbsoluteFill>
      {/* Sky gradient */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: `linear-gradient(to bottom, ${skyColors.top} 0%, ${skyColors.bottom} 100%)`,
        }}
      />

      {/* Stars */}
      {starOpacity > 0 && STARS.map((star, index) => (
        <Star
          key={index}
          x={star.x}
          y={star.y}
          size={star.size}
          twinkleOffset={star.twinkleOffset}
          opacity={starOpacity}
          frame={frame}
        />
      ))}

      {/* Sun */}
      <CelestialBody progress={progress} type="sun" />

      {/* Moon */}
      <CelestialBody progress={progress} type="moon" />

      {/* Ground/Horizon silhouette */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '15%',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 50%, #0a0a0a 100%)',
        }}
      />

      {/* Rolling hills silhouette */}
      <svg
        style={{
          position: 'absolute',
          bottom: '10%',
          left: 0,
          width: '100%',
          height: '20%',
        }}
        viewBox="0 0 1920 200"
        preserveAspectRatio="none"
      >
        <path
          d="M0,200 L0,120 Q240,40 480,100 T960,80 T1440,110 T1920,90 L1920,200 Z"
          fill="rgba(0,20,0,0.6)"
        />
        <path
          d="M0,200 L0,150 Q320,80 640,130 T1280,100 T1920,140 L1920,200 Z"
          fill="rgba(0,30,0,0.7)"
        />
        <path
          d="M0,200 L0,170 Q400,120 800,160 T1600,140 T1920,165 L1920,200 Z"
          fill="rgba(0,40,0,0.85)"
        />
      </svg>
    </AbsoluteFill>
  );
};
