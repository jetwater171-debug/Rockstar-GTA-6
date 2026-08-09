import React, { createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Player } from '@remotion/player';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

const clamp = {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
};

export function AnalysisResultMotion() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const circumference = 427.26;
  const progress = Math.round(
    interpolate(frame, [0, 2.85 * fps, 3.5 * fps], [6, 94, 100], {
      ...clamp,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    }),
  );

  return (
    <AbsoluteFill style={{ alignItems: 'center', backgroundColor: 'transparent', justifyContent: 'center' }}>
      <div
        style={{
          height: 190,
          position: 'relative',
          scale: interpolate(frame, [0, 0.45 * fps], [0.92, 1], {
            ...clamp,
            easing: Easing.spring({ damping: 200 }),
            output: 'perceptual-scale',
          }),
          width: 190,
        }}
      >
        <div
          style={{
            backgroundColor: '#ffd629',
            borderRadius: '50%',
            filter: 'blur(24px)',
            inset: 38,
            opacity: interpolate(frame, [0, 2.9 * fps, 3.35 * fps], [0.025, 0.06, 0.16], {
              ...clamp,
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
            position: 'absolute',
          }}
        />

        <svg aria-hidden="true" viewBox="0 0 190 190" style={{ height: '100%', overflow: 'visible', width: '100%' }}>
          <circle cx="95" cy="95" r="68" fill="rgba(5,5,5,.94)" stroke="rgba(255,255,255,.11)" strokeWidth="2" />
          <circle
            cx="95"
            cy="95"
            r="68"
            fill="none"
            stroke="#ffd629"
            strokeDasharray={circumference}
            strokeDashoffset={interpolate(frame, [0.15 * fps, 3 * fps], [circumference, 0], {
              ...clamp,
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            })}
            strokeLinecap="round"
            strokeWidth="5"
            style={{ filter: 'drop-shadow(0 0 4px rgba(255,214,41,.26))' }}
            transform="rotate(-90 95 95)"
          />
          <circle
            cx="95"
            cy="95"
            r="59"
            fill="#ffd629"
            style={{
              opacity: interpolate(frame, [2.92 * fps, 3.3 * fps], [0, 1], {
                ...clamp,
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              }),
              scale: interpolate(frame, [2.92 * fps, 3.3 * fps], [0.88, 1], {
                ...clamp,
                easing: Easing.spring({ damping: 200 }),
                output: 'perceptual-scale',
              }),
              transformBox: 'fill-box',
              transformOrigin: 'center',
            }}
          />
          <path
            d="M65 96 L86 116 L126 73"
            fill="none"
            pathLength="100"
            stroke="#080808"
            strokeDasharray="100"
            strokeDashoffset={interpolate(frame, [3.18 * fps, 3.72 * fps], [100, 0], {
              ...clamp,
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            })}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="11"
          />
        </svg>

        <div
          style={{
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'column',
            inset: 0,
            justifyContent: 'center',
            opacity: interpolate(frame, [0, 2.72 * fps, 3.02 * fps], [1, 1, 0], {
              ...clamp,
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
            position: 'absolute',
          }}
        >
          <strong style={{ color: '#fff', fontFamily: 'Arial, sans-serif', fontSize: 32, fontWeight: 850, lineHeight: 1 }}>
            {progress}
          </strong>
          <span style={{ color: 'rgba(255,255,255,.38)', fontFamily: 'Arial, sans-serif', fontSize: 8, fontWeight: 750, letterSpacing: 1.7, marginTop: 7 }}>
            ANALISANDO
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
}

export function mountAnalysisResultPlayer(target) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = createRoot(target);
  const playerRef = createRef();
  root.render(
    <Player
      autoPlay={false}
      clickToPlay={false}
      component={AnalysisResultMotion}
      compositionHeight={240}
      compositionWidth={240}
      controls={false}
      durationInFrames={132}
      fps={30}
      initialFrame={reducedMotion ? 131 : 0}
      loop={false}
      pauseWhenPageIsHidden={false}
      ref={playerRef}
      spaceKeyToPlayOrPause={false}
      style={{ height: '100%', width: '100%' }}
    />,
  );

  const startedAt = performance.now();
  const timeline = window.setInterval(() => {
    const nextFrame = reducedMotion ? 131 : Math.min(131, Math.floor(((performance.now() - startedAt) / 1000) * 30));
    playerRef.current?.seekTo(nextFrame);
    if (nextFrame >= 131) window.clearInterval(timeline);
  }, 1000 / 30);

  return () => {
    window.clearInterval(timeline);
    root.unmount();
  };
}
