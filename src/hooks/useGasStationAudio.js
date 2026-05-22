import { useRef, useCallback } from 'react';

export default function useGasStationAudio(isMuted) {
  const audioCtxRef  = useRef(null);
  const motorOscRef  = useRef(null);
  const motorGainRef = useRef(null);

  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try { audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)(); } catch {}
  }, []);

  const playTone = useCallback((freq, type, gain, duration, rampTo = 0.0001) => {
    if (isMuted || !audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const g   = ctx.createGain();
      osc.connect(g); g.connect(ctx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      g.gain.setValueAtTime(gain, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(rampTo, ctx.currentTime + duration);
      osc.start(); osc.stop(ctx.currentTime + duration);
    } catch {}
  }, [isMuted]);

  const playClick = useCallback(() => {
    if (isMuted || !audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const g   = ctx.createGain();
      osc.connect(g); g.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.05);
      g.gain.setValueAtTime(0.04, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
      osc.start(); osc.stop(ctx.currentTime + 0.05);
    } catch {}
  }, [isMuted]);

  const playCentTick = useCallback((pitch) => {
    if (isMuted || !audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const g   = ctx.createGain();
      osc.connect(g); g.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(pitch || 950, ctx.currentTime);
      g.gain.setValueAtTime(0.015, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.012);
      osc.start(); osc.stop(ctx.currentTime + 0.012);
    } catch {}
  }, [isMuted]);

  const startMotorHum = useCallback(() => {
    if (isMuted || !audioCtxRef.current || motorOscRef.current) return;
    try {
      const ctx  = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const osc  = ctx.createOscillator();
      const filt = ctx.createBiquadFilter();
      const g    = ctx.createGain();
      filt.type = 'lowpass'; filt.frequency.setValueAtTime(110, ctx.currentTime);
      osc.connect(filt); filt.connect(g); g.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(60, ctx.currentTime);
      g.gain.setValueAtTime(0.008, ctx.currentTime);
      osc.start();
      motorOscRef.current = osc; motorGainRef.current = g;
    } catch {}
  }, [isMuted]);

  const updateMotorHum = useCallback((vel) => {
    if (!motorOscRef.current || !motorGainRef.current || !audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      motorOscRef.current.frequency.setTargetAtTime(60 + vel * 18, ctx.currentTime, 0.04);
      motorGainRef.current.gain.setTargetAtTime(0.008 + vel * 0.012, ctx.currentTime, 0.04);
    } catch {}
  }, []);

  const stopMotorHum = useCallback(() => {
    try {
      motorOscRef.current?.stop(); motorOscRef.current?.disconnect(); motorOscRef.current = null;
      motorGainRef.current?.disconnect(); motorGainRef.current = null;
    } catch {}
  }, []);

  const playPerfect = useCallback(() => {
    if (isMuted || !audioCtxRef.current) return;
    try {
      const ctx   = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      [987.77, 1318.51, 1567.98].forEach((freq, i) => {
        const osc = ctx.createOscillator(); const g = ctx.createGain();
        osc.connect(g); g.connect(ctx.destination);
        osc.type = 'sine'; osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.05);
        g.gain.setValueAtTime(0, ctx.currentTime + i * 0.05);
        g.gain.linearRampToValueAtTime(0.05, ctx.currentTime + i * 0.05 + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.05 + 0.6);
        osc.start(ctx.currentTime + i * 0.05); osc.stop(ctx.currentTime + i * 0.05 + 0.65);
      });
    } catch {}
  }, [isMuted]);

  const playBust = useCallback(() => {
    if (isMuted || !audioCtxRef.current) return;
    try {
      const ctx  = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const osc  = ctx.createOscillator(); const filt = ctx.createBiquadFilter(); const g = ctx.createGain();
      osc.connect(filt); filt.connect(g); g.connect(ctx.destination);
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(180, ctx.currentTime);
      filt.type = 'bandpass'; filt.frequency.setValueAtTime(300, ctx.currentTime);
      g.gain.setValueAtTime(0.08, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
      osc.start(); osc.stop(ctx.currentTime + 0.5);
    } catch {}
  }, [isMuted]);

  return {
    initAudio,
    playTone,
    playClick,
    playCentTick,
    startMotorHum,
    updateMotorHum,
    stopMotorHum,
    playPerfect,
    playBust
  };
}
