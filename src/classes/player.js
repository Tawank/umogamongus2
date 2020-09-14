
import * as PIXI from 'pixi.js'
import keyboard from '@/utils/keyboard'

const bunnyTexture = PIXI.Texture.from('assets/bunny.png')
const bunnyDedTexture = PIXI.Texture.from('assets/bunnyded.png')

export default class Player {
  constructor (my, x, y, name) {
    const style = new PIXI.TextStyle({
      fontFamily: 'Arial',
      fontSize: 10,
      fontStyle: 'italic',
      fontWeight: 'bold',
      fill: ['#ffffff', '#00ff99'],
      stroke: '#4a1850',
      strokeThickness: 5,
      dropShadow: true,
      dropShadowColor: '#000000',
      dropShadowBlur: 4,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 6
    })

    const nameText = new PIXI.Text(name, style)
    const sprite = new PIXI.Sprite(bunnyTexture)
    sprite.addChild(nameText)
    nameText.x = -20
    nameText.y = -20

    sprite.x = x
    sprite.y = y
    sprite.dest = {}
    sprite.dest.x = sprite.x
    sprite.dest.y = sprite.y
    sprite.vx = 0
    sprite.vy = 0

    if (my) {
      const up = keyboard('w')
      const right = keyboard('d')
      const down = keyboard('s')
      const left = keyboard('a')

      left.press = () => {
        sprite.vx = -5
      }

      left.release = () => {
        if (!right.isDown) {
          sprite.vx = 0
        }
      }

      up.press = () => {
        sprite.vy = -5
      }
      up.release = () => {
        if (!down.isDown) {
          sprite.vy = 0
        }
      }

      right.press = () => {
        sprite.vx = 5
      }
      right.release = () => {
        if (!left.isDown) {
          sprite.vx = 0
        }
      }

      down.press = () => {
        sprite.vy = 5
      }
      down.release = () => {
        if (!up.isDown) {
          sprite.vy = 0
        }
      }
    }
    this.sprite = sprite
  }

  dead () {
    this.sprite.texture = bunnyDedTexture
  }
}
