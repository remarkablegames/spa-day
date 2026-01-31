export enum Sound {
  MaskApply = 'score-mask-apply',
  TreatmentComplete = 'score-treatment-complete',
  BackgroundMusic = 'score-background-music',
}

// Map all sounds to the available score.mp3 file
export const SOUND_FILES = {
  [Sound.MaskApply]: 'sounds/score.mp3',
  [Sound.TreatmentComplete]: 'sounds/score.mp3',
  [Sound.BackgroundMusic]: 'sounds/score.mp3',
}
