import { useCallback } from 'react'

export function useSound() {
  const playTick = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      ctx.resume().then(() => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'sine'
        osc.frequency.setValueAtTime(900, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.08)
        gain.gain.setValueAtTime(0.15, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.08)
        osc.onended = () => ctx.close()
      })
    } catch {}
  }, [])

  return { playTick }
}
