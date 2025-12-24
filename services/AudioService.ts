
import { NOTES } from '../constants';

class ChristmasSynth {
  private ctx: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying: boolean = false;
  private currentNoteIndex: number = 0;
  private melodyTimeout: any = null;

  // We Wish You a Merry Christmas Melody
  private melody = [
    { freq: NOTES.G4, duration: 0.5 },
    { freq: NOTES.C5, duration: 0.5 },
    { freq: NOTES.C5, duration: 0.25 },
    { freq: NOTES.D5, duration: 0.25 },
    { freq: NOTES.C5, duration: 0.25 },
    { freq: NOTES.B5, duration: 0.25 },
    { freq: NOTES.A5, duration: 0.5 },
    { freq: NOTES.A5, duration: 0.5 },

    { freq: NOTES.A5, duration: 0.5 },
    { freq: NOTES.D5, duration: 0.5 },
    { freq: NOTES.D5, duration: 0.25 },
    { freq: NOTES.E5, duration: 0.25 },
    { freq: NOTES.D5, duration: 0.25 },
    { freq: NOTES.C5, duration: 0.25 },
    { freq: NOTES.B5, duration: 0.5 },
    { freq: NOTES.G4, duration: 0.5 },
  ];

  constructor() {
    this.initContext();
  }

  private initContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.ctx.createGain();
      this.gainNode.connect(this.ctx.destination);
      this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    }
  }

  async start() {
    if (this.isPlaying) return;
    this.initContext();
    if (this.ctx?.state === 'suspended') {
      await this.ctx.resume();
    }
    this.isPlaying = true;
    this.playNextNote();
  }

  stop() {
    this.isPlaying = false;
    if (this.melodyTimeout) {
      clearTimeout(this.melodyTimeout);
    }
    if (this.gainNode) {
      this.gainNode.gain.setTargetAtTime(0, this.ctx!.currentTime, 0.1);
    }
  }

  private playNextNote() {
    if (!this.isPlaying || !this.ctx || !this.gainNode) return;

    const note = this.melody[this.currentNoteIndex];
    
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(note.freq, this.ctx.currentTime);
    
    const noteGain = this.ctx.createGain();
    noteGain.connect(this.gainNode);
    osc.connect(noteGain);
    
    noteGain.gain.setValueAtTime(0, this.ctx.currentTime);
    noteGain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + 0.05);
    noteGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + note.duration * 0.9);

    osc.start();
    osc.stop(this.ctx.currentTime + note.duration);

    this.currentNoteIndex = (this.currentNoteIndex + 1) % this.melody.length;
    this.melodyTimeout = setTimeout(() => this.playNextNote(), note.duration * 1000);
  }
}

export const audioService = new ChristmasSynth();
