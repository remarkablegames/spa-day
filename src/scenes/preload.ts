import { Scene, Sprite } from '../constants'

scene(Scene.Preload, () => {
  loadSprite(Sprite.Bean, 'sprites/bean.png')
  loadSprite(Sprite.Ghosty, 'sprites/ghosty.png')
  go(Scene.SpaGame) // Go to our spa game scene instead of the original game scene
})
