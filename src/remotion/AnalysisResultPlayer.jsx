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
  const circumference = 603.19;
  const progress = Math.round(
    interpolate(frame, [0, 2.75 * fps, 3.55 * fps], [8, 94, 100], {
      ...clamp,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    }),
  );

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        backgroundColor: 'transparent',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          height: 286,
          position: 'relative',
          scale: interpolate(frame, [0, 0.55 * fps], [0.82, 1], {
            ...clamp,
            easing: Easing.spring({ damping: 180 }),
            output: 'perceptual-scale',
          }),
          width: 286,
        }}
      >
        <div
          style={{
            backgroundColor: '#ffd629',
            borderRadius: '50%',
            filter: 'blur(34px)',
            inset: 39,
            opacity: interpolate(frame, [0, 2.8 * fps, 3.25 * fps, 4.35 * fps], [0.08, 0.14, 0.46, 0.28], {
              ...clamp,
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
            position: 'absolute',
            scale: interpolate(frame, [0, 2.8 * fps, 3.3 * fps], [0.72, 0.92, 1.22], {
              ...clamp,
              easing: Easing.spring({ damping: 160 }),
              output: 'perceptual-scale',
            }),
          }}
        />

        <svg
          aria-hidden="true"
          viewBox="0 0 286 286"
          style={{
            height: '100%',
            overflow: 'visible',
            rotate: `${interpolate(frame, [0, 2.9 * fps], [-92, 508], {
              ...clamp,
              easing: Easing.bezier(0.42, 0, 0.58, 1),
            })}deg`,
            width: '100%',
          }}
        >
          <circle cx="143" cy="143" r="112" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="2" />
          <circle cx="143" cy="143" r="96" fill="rgba(5,5,5,.92)" stroke="rgba(255,255,255,.1)" strokeWidth="2" />
          <circle
            cx="143"
            cy="143"
            r="96"
            fill="none"
            pathLength="100"
            stroke="#ffd629"
            strokeDasharray="18 82"
            strokeLinecap="round"
            strokeWidth="9"
            style={{
              filter: 'drop-shadow(0 0 10px rgba(255,214,41,.58))',
              opacity: interpolate(frame, [0, 2.7 * fps, 3.15 * fps], [1, 1, 0], {
                ...clamp,
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              }),
            }}
          />
        </svg>

        <svg
          aria-hidden="true"
          viewBox="0 0 286 286"
          style={{ height: '100%', inset: 0, overflow: 'visible', position: 'absolute', width: '100%' }}
        >
          <circle
            cx="143"
            cy="143"
            r="96"
            fill="none"
            stroke="#ffd629"
            strokeDasharray={circumference}
            strokeDashoffset={interpolate(frame, [0.2 * fps, 3 * fps], [circumference, 0], {
              ...clamp,
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            })}
            strokeLinecap="round"
            strokeWidth="9"
            style={{ filter: 'drop-shadow(0 0 9px rgba(255,214,41,.4))' }}
            transform="rotate(-90 143 143)"
          />
          <circle
            cx="143"
            cy="143"
            r="82"
            fill="#ffd629"
            style={{
              opacity: interpolate(frame, [2.82 * fps, 3.25 * fps], [0, 1], {
                ...clamp,
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              }),
              scale: interpolate(frame, [2.82 * fps, 3.25 * fps, 3.7 * fps], [0.72, 1.06, 1], {
                ...clamp,
                easing: Easing.spring({ damping: 180 }),
                output: 'perceptual-scale',
              }),
              transformBox: 'fill-box',
              transformOrigin: 'center',
            }}
          />
          <path
            d="M101 145 L132 174 L190 111"
            fill="none"
            pathLength="100"
            stroke="#070707"
            strokeDasharray="100"
            strokeDashoffset={interpolate(frame, [3.15 * fps, 3.72 * fps], [100, 0], {
              ...clamp,
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            })}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="17"
          />
        </svg>

        <div
          style={{
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'column',
            inset: 0,
            justifyContent: 'center',
            opacity: interpolate(frame, [0, 2.65 * fps, 3 * fps], [1, 1, 0], {
              ...clamp,
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
            position: 'absolute',
          }}
        >
          <strong style={{ color: '#fff', fontFamily: 'Arial, sans-serif', fontSize: 54, fontWeight: 900, lineHeight: 0.9 }}>
            {progress}
          </strong>
          <span style={{ color: 'rgba(255,255,255,.5)', fontFamily: 'Arial, sans-serif', fontSize: 13, fontWeight: 800, letterSpacing: 2.4, marginTop: 12 }}>
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
      compositionHeight={320}
      compositionWidth={320}
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
