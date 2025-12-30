
import { Language } from "../types";

class SoundManager {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  private decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  private async decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }

  /**
   * Fallback to browser's built-in TTS if the cloud API fails.
   */
  private speakFallback(text: string, lang: Language) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Stop current speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'he' ? 'he-IL' : 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.2; // Slightly higher pitch for "kid-friendly" feel
    window.speechSynthesis.speak(utterance);
  }

  async speak(text: string, lang: Language) {
    if (!this.enabled || !text) return;
    this.init();

    try {
      // Call the backend API route instead of direct Gemini API
      const response = await fetch('/api/gemini-tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, lang }),
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      const base64Audio = data.audio;
      
      if (base64Audio) {
        const audioData = this.decode(base64Audio);
        const audioBuffer = await this.decodeAudioData(audioData, this.ctx!, 24000, 1);
        const source = this.ctx!.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.ctx!.destination);
        source.start();
      } else {
        // Fallback if the API returned success but no audio data
        this.speakFallback(text, lang);
      }
    } catch (error) {
      console.warn("Gemini TTS failed, using browser fallback. Error:", error);
      // Catch quota (429), internal (500), and invalid argument (400) errors gracefully
      this.speakFallback(text, lang);
    }
  }

  playMove() {
    if (!this.enabled) return;
    this.init();
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, this.ctx!.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, this.ctx!.currentTime + 0.1);

    gain.gain.setValueAtTime(0.1, this.ctx!.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx!.destination);

    osc.start();
    osc.stop(this.ctx!.currentTime + 0.1);
  }

  playCapture() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx!.currentTime;
    
    [880, 1108, 1318].forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.05);

      gain.gain.setValueAtTime(0, now + i * 0.05);
      gain.gain.linearRampToValueAtTime(0.1, now + i * 0.05 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.4);
    });
  }

  playCheck() {
    if (!this.enabled) return;
    this.init();
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, this.ctx!.currentTime);
    osc.frequency.linearRampToValueAtTime(600, this.ctx!.currentTime + 0.1);
    osc.frequency.linearRampToValueAtTime(300, this.ctx!.currentTime + 0.2);

    gain.gain.setValueAtTime(0.1, this.ctx!.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx!.destination);

    osc.start();
    osc.stop(this.ctx!.currentTime + 0.2);
  }
}

export const soundManager = new SoundManager();
