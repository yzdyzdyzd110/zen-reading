import { useState, useRef, useCallback, useEffect } from 'react';

const TRACKS = [
  { label: 'Rain', icon: '🌧', freq: 200 },
  { label: 'Forest', icon: '🌲', freq: 400 },
  { label: 'Ocean', icon: '🌊', freq: 150 },
  { label: 'Fire', icon: '🔥', freq: 100 },
];

function createNoiseBuffer(ctx: AudioContext, type: 'white' | 'pink' | 'brown'): AudioBuffer {
  const size = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < size; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  if (type === 'pink') {
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < size; i++) {
      const white = data[i];
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
  } else if (type === 'brown') {
    let last = 0;
    for (let i = 0; i < size; i++) {
      data[i] = (last + 0.02 * data[i]) / 1.02;
      last = data[i];
      data[i] *= 3.5;
    }
  }

  return buffer;
}

export default function MusicPlayer() {
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [volume, setVolume] = useState(0.3);
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const stop = useCallback(() => {
    sourceRef.current?.stop();
    sourceRef.current = null;
    setPlaying(false);
  }, []);

  const start = useCallback(
    (trackIdx: number, vol: number) => {
      const ctx = ctxRef.current || new AudioContext();
      ctxRef.current = ctx;
      const gain = gainRef.current || ctx.createGain();
      gainRef.current = gain;
      gain.connect(ctx.destination);
      gain.gain.value = vol;

      const noiseType = trackIdx === 0 ? 'pink' : trackIdx === 2 ? 'brown' : 'white';
      const buffer = createNoiseBuffer(ctx, noiseType);

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = TRACKS[trackIdx].freq * 2;
      source.connect(filter);
      filter.connect(gain);

      source.start();
      sourceRef.current = source;

      setPlaying(true);
      setCurrent(trackIdx);
    },
    []
  );

  const toggle = () => {
    if (playing) {
      stop();
    } else {
      start(current, volume);
    }
  };

  const selectTrack = (idx: number) => {
    stop();
    start(idx, volume);
  };

  const changeVolume = (v: number) => {
    setVolume(v);
    if (gainRef.current) gainRef.current.gain.value = v;
  };

  useEffect(() => {
    return () => {
      ctxRef.current?.close();
    };
  }, []);

  return (
    <div className="music-player">
      <div className="mp-track-row">
        {TRACKS.map((t, i) => (
          <button
            key={t.label}
            className={`mp-track-btn ${i === current && playing ? 'active' : ''}`}
            onClick={() => selectTrack(i)}
            title={t.label}
          >
            {t.icon}
          </button>
        ))}
      </div>
      <div className="mp-controls">
        <button className="mp-play-btn" onClick={toggle}>
          {playing ? '⏸' : '▶'}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={(e) => changeVolume(Number(e.target.value))}
          className="mp-volume"
        />
      </div>
    </div>
  );
}
