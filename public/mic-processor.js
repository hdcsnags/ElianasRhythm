class MicProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    this._inputRate = sampleRate
    this._targetRate = 16000
    this._chunkSamples = 1600
    this._accumulator = []
    this._resampleFraction = 0
  }

  process(inputs) {
    const input = inputs[0]
    if (!input || !input[0]) return true

    const channel = input[0]
    const ratio = this._inputRate / this._targetRate
    let srcPos = this._resampleFraction

    while (srcPos < channel.length) {
      const idx = Math.floor(srcPos)
      const frac = srcPos - idx
      const s0 = channel[idx]
      const s1 = idx + 1 < channel.length ? channel[idx + 1] : s0
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

      srcPos += ratio
    }

    this._resampleFraction = srcPos - channel.length

    return true
  }
}

registerProcessor('mic-processor', MicProcessor)
