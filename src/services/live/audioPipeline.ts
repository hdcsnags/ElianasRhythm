export type ChunkCallback = (base64: string) => void

export class MicPipeline {
  private context: AudioContext | null = null
  private workletNode: AudioWorkletNode | null = null
  private source: MediaStreamAudioSourceNode | null = null
  private stream: MediaStream | null = null
  private onChunk: ChunkCallback
  private active = false

  constructor(onChunk: ChunkCallback) {
    this.onChunk = onChunk
  }

  async start(): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    this.context = new AudioContext()
    await this.context.audioWorklet.addModule('/mic-processor.js')
    this.workletNode = new AudioWorkletNode(this.context, 'mic-processor')
    this.workletNode.port.onmessage = (evt) => {
      if (!this.active) return
      const { type, buffer } = evt.data as { type: string; buffer: ArrayBuffer }
      if (type === 'chunk') {
        this.onChunk(arrayBufferToBase64(buffer))
      }
    }
    this.source = this.context.createMediaStreamSource(this.stream)
    this.source.connect(this.workletNode)
    this.active = true
  }

  stop(): void {
    this.active = false
    this.workletNode?.disconnect()
    this.source?.disconnect()
    this.stream?.getTracks().forEach(t => t.stop())
    this.context?.close().catch(() => { /* ignore */ })
    this.workletNode = null
    this.source = null
    this.stream = null
    this.context = null
  }

  isActive(): boolean {
    return this.active
  }
}

export class PlaybackQueue {
  private context: AudioContext | null = null
  private nextAt = 0
  private active = false
  private readonly SAMPLE_RATE = 24000

  start(): void {
    if (this.context) return
    this.context = new AudioContext({ sampleRate: this.SAMPLE_RATE })
    this.nextAt = this.context.currentTime
    this.active = true
  }

  enqueue(base64: string): void {
    if (!this.context || !this.active) return
    const raw = base64ToArrayBuffer(base64)
    const int16 = new Int16Array(raw)
    const float32 = new Float32Array(int16.length)
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / (int16[i] < 0 ? 0x8000 : 0x7fff)
    }
    const buffer = this.context.createBuffer(1, float32.length, this.SAMPLE_RATE)
    buffer.copyToChannel(float32, 0)
    const source = this.context.createBufferSource()
    source.buffer = buffer
    source.connect(this.context.destination)
    const startAt = Math.max(this.context.currentTime, this.nextAt)
    source.start(startAt)
    this.nextAt = startAt + buffer.duration
  }

  interrupt(): void {
    if (!this.context) return
    this.active = false
    const old = this.context
    this.context = null
    this.nextAt = 0
    old.close().catch(() => { /* ignore */ })
    this.context = new AudioContext({ sampleRate: this.SAMPLE_RATE })
    this.nextAt = this.context.currentTime
    this.active = true
  }

  stop(): void {
    this.active = false
    this.context?.close().catch(() => { /* ignore */ })
    this.context = null
    this.nextAt = 0
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}
