<template>
  <div class="game-containter" />
</template>

<script>
import * as PIXI from 'pixi.js'

import firebase from 'firebase/app'
import 'firebase/database'

import keyboard from '@/utils/keyboard'

export default {
  name: 'Game',
  data () {
    return {
      players: {},
      playerId: null,
      throttle: 0,
      ticker: null,
      bunnyTexture: null,
      bunnyDedTexture: null
    }
  },
  mounted () {
    this.bunnyTexture = PIXI.Texture.from('assets/bunny.png')
    this.bunnyDedTexture = PIXI.Texture.from('assets/bunnyded.png')
    const app = new PIXI.Application({
      width: 800, height: 600, backgroundColor: 0x1099bb, resolution: window.devicePixelRatio || 1
    })
    document.querySelector('.game-containter').appendChild(app.view)

    this.playerId = Math.random().toString(36).substring(2, 15)

    const bunny = this.createBunny()
    const tintColor = Math.random() * 0xFFFFFF
    bunny.tint = tintColor
    this.players[this.playerId] = bunny
    app.stage.addChild(bunny)

    const thisPlayerDb = firebase.database().ref('users/' + this.playerId)
    thisPlayerDb.onDisconnect().set(null)
    thisPlayerDb.set({
      x: bunny.x,
      y: bunny.y,
      tint: tintColor
    })

    this.ticker = app.ticker
    this.ticker.add((delta) => {
      for (const [key, player] of Object.entries(this.players)) {
        if (key === this.playerId) {
          player.x += player.vx
          player.y += player.vy
          const object = {
            x: player.x,
            y: player.y,
            tint: tintColor
          }

          if (Math.abs(player.vx) + Math.abs(player.vy)) {
            if (this.throttle === 0) {
              thisPlayerDb.set(object)
            }
            this.throttle += delta
            if (Object.keys(this.players).length === 1) {
              if (this.throttle > 10) {
                this.throttle = 0
              }
            } else {
              if (this.throttle > 5) {
                this.throttle = 0
              }
            }
          }
        } else {
          if (Math.abs(player.x - player.dest.x) > 2) {
            player.x = this.smooth(player.x, player.dest.x, 0.2)
          }
          if (Math.abs(player.y - player.dest.y) > 2) {
            player.y = this.smooth(player.y, player.dest.y, 0.2)
          }
        }
      }
    })

    firebase.database().ref('users/').on('child_added', (snapshot) => {
      const key = snapshot.key
      if (key === this.playerId) return

      const snapshotVal = snapshot.val()
      const player = this.createBunny()
      this.$set(this.players, key, player)
      player.dest.x = snapshotVal.x
      player.dest.y = snapshotVal.y
      player.tint = snapshotVal.tint

      player.interactive = true
      player.buttonMode = true
      player.on('pointerdown', () => {
        player.texture = this.bunnyDedTexture
      })

      app.stage.addChild(player)
    })

    firebase.database().ref('users/').on('child_removed', (snapshot) => {
      const key = snapshot.key
      this.players[key].parent.removeChild(this.players[key])
      delete this.players[key]
    })

    firebase.database().ref('users/').on('child_changed', (snapshot) => {
      const key = snapshot.key
      if (key === this.player) return

      const snapshotVal = snapshot.val()

      this.players[key].dest.x = snapshotVal.x
      this.players[key].dest.y = snapshotVal.y
    })
  },
  beforeDestroy () {
    this.ticker.stop()
    this.ticker.destroy()
  },
  methods: {
    createBunny () {
      const texture = this.bunnyTexture

      const bunny = new PIXI.Sprite(texture)
      bunny.x = 96
      bunny.y = 96
      bunny.dest = {}
      bunny.dest.x = bunny.x
      bunny.dest.y = bunny.y
      bunny.vx = 0
      bunny.vy = 0

      const up = keyboard('w')
      const right = keyboard('d')
      const down = keyboard('s')
      const left = keyboard('a')

      left.press = () => {
        bunny.vx = -5
      }

      left.release = () => {
        if (!right.isDown) {
          bunny.vx = 0
        }
      }

      up.press = () => {
        bunny.vy = -5
      }
      up.release = () => {
        if (!down.isDown) {
          bunny.vy = 0
        }
      }

      right.press = () => {
        bunny.vx = 5
      }
      right.release = () => {
        if (!left.isDown) {
          bunny.vx = 0
        }
      }

      down.press = () => {
        bunny.vy = 5
      }
      down.release = () => {
        if (!up.isDown) {
          bunny.vy = 0
        }
      }
      return bunny
    },
    smooth (start, end, amt) {
      return (1 - amt) * start + amt * end
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
