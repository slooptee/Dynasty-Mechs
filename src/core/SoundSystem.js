export class SoundSystem {
  constructor() {
    this.currentMusic = null;
  }
  async init() {
    // placeholder for WebAudio init
  }
  playBackgroundMusic() {
    this.currentMusic = 'bgm';
  }
}
