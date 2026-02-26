// AudioWorklet processor: Float32 -> PCM16 with 16kHz resampling
// Accumulates ~100ms chunks (1600 samples at 16kHz) before posting

class MicProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    this._buffer = []
    this._inputRate = sampleRate
    this._targetRate = 16000
    this._chunkSamples = 1600
    this._accumulator = []
    this._ratio = this._inputRate / this._targetRate
  }

  process(inputs) {
    const input = inputs[0]
    if (!input || !input[0]) return true

    const channel = input[0]

    for (let i = 0; i < channel.length; i++) {
      const srcIdx = i * this._ratio
      const idx = Math.floor(srcIdx)
      const frac = srcIdx - idx
      const s0 = channel[Math.min(idx, channel.length - 1)]
      const s1 = channel[Math.min(idx + 1, channel.length - 1)]
      const sample = s0 + frac * (s1 - s0)
      this._accumulator.push(sample)

      if (this._accumulator.length >= this._chunkSamples) {
        const chunk = this._accumulator.splice(0, this._chunkSamples)
        const pcm16 = new Int16Array(chunk.length)
        for (let j = 0; j < chunk.length; j++) {
          const clamped = Math.max(-1, Math.min(1, chunk[j]))
          pcm16[j] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff
        }
        this.port.postMessage({ type: 'chunk', buffer: pcm16.buffer }, [pcm16.buffer])
      }
    }

    return true
  }
}

registerProcessor('mic-processor', MicProcessor)
