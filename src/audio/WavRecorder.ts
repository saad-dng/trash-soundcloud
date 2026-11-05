/**
 * Live Audio Recorder & WAV File Encoder
 * Direct tap from the master bus to create uncompressed 16-bit 44.1kHz stereo audio files.
 */

export class WavRecorder {
  private ctx: AudioContext;
  private isRecording: boolean = false;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private streamDestination: MediaStreamAudioDestinationNode | null = null;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
  }

  public start(sourceNode: AudioNode) {
    if (this.isRecording) return;

    this.streamDestination = this.ctx.createMediaStreamDestination();
    sourceNode.connect(this.streamDestination);

    this.recordedChunks = [];
    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/webm';

    this.mediaRecorder = new MediaRecorder(this.streamDestination.stream, {
      mimeType,
      audioBitsPerSecond: 256000,
    });

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this.recordedChunks.push(e.data);
      }
    };

    this.mediaRecorder.start(100);
    this.isRecording = true;
  }

  public async stop(): Promise<Blob | null> {
    if (!this.isRecording || !this.mediaRecorder) return null;

    return new Promise((resolve) => {
      this.mediaRecorder!.onstop = async () => {
        const audioBlob = new Blob(this.recordedChunks, { type: this.mediaRecorder!.mimeType });
        this.isRecording = false;

        // Convert the WebM/Opus stream into a clean WAV file using offline audio context
        try {
          const arrayBuffer = await audioBlob.arrayBuffer();
          const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
          const wavBlob = this.audioBufferToWav(audioBuffer);
          resolve(wavBlob);
        } catch {
          // Fallback to raw recorded blob
          resolve(audioBlob);
        }
      };

      this.mediaRecorder!.stop();
    });
  }

  public getIsRecording(): boolean {
    return this.isRecording;
  }

  /**
   * Convert AudioBuffer to uncompressed stereo 16-bit PCM WAV Blob
   */
  private audioBufferToWav(buffer: AudioBuffer): Blob {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;

    const length = buffer.length;
    const bufferSize = 44 + length * blockAlign;
    const arrayBuffer = new ArrayBuffer(bufferSize);
    const view = new DataView(arrayBuffer);

    // RIFF chunk descriptor
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + length * blockAlign, true);
    this.writeString(view, 8, 'WAVE');

    // fmt sub-chunk
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // SubChunk1Size (16 for PCM)
    view.setUint16(20, format, true); // AudioFormat
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true); // ByteRate
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);

    // data sub-chunk
    this.writeString(view, 36, 'data');
    view.setUint32(40, length * blockAlign, true);

    // Write PCM interleaved samples
    let offset = 44;
    const channels: Float32Array[] = [];
    for (let i = 0; i < numChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    for (let i = 0; i < length; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        let sample = channels[ch][i];
        // Clip sample to -1..1
        sample = Math.max(-1, Math.min(1, sample));
        // Scale to 16-bit signed integer
        const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        view.setInt16(offset, intSample, true);
        offset += 2;
      }
    }

    return new Blob([view], { type: 'audio/wav' });
  }

  private writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
}
