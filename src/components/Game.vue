<template>
  <div class="game-containter" />
</template>

<script>
import * as PIXI from 'pixi.js'

import firebase from 'firebase/app'
import 'firebase/database'
import Player from '@/classes/player'
import smooth from '@/utils/smooth'

export default {
  name: 'Game',
  data () {
    return {
      players: {},
      myPlayer: null,
      myPlayerId: null,
      myPlayerDb: null,
      myPlayerAlive: true,
      throttle: 0,
      ticker: null
    }
  },
  mounted () {
    const bunnyDedTexture = PIXI.Texture.from('assets/bunnyded.png')

    let myPlayerName = localStorage.getItem('name')
    if (!myPlayerName) {
      myPlayerName = prompt('Enter Name')
      localStorage.setItem('name', myPlayerName)
    }

    const app = new PIXI.Application({
      width: 800, height: 600, backgroundColor: 0x1099bb, resolution: window.devicePixelRatio || 1
    })
    const defaultIcon = "url('assets/knife.png'),auto"
    const hoverIcon = "url('assets/knife_hover.png'),auto"

    app.renderer.plugins.interaction.cursorStyles.default = defaultIcon
    app.renderer.plugins.interaction.cursorStyles.hover = hoverIcon

    document.querySelector('.game-containter').appendChild(app.view)

    this.myPlayerId = Math.random().toString(36).substring(2, 15)

    this.myPlayer = new Player(true, 80, 80, myPlayerName)
    const tintColor = Math.random() * 0xFFFFFF
    this.myPlayer.sprite.tint = tintColor
    app.stage.addChild(this.myPlayer.sprite)

    this.myPlayerDb = firebase.database().ref('users/' + this.myPlayerId)
    this.myPlayerDb.onDisconnect().set(null)
    this.myPlayerDb.set({
      x: this.myPlayer.sprite.x,
      y: this.myPlayer.sprite.y,
      tint: tintColor,
      name: myPlayerName
    })

    this.ticker = app.ticker
    this.ticker.add(this.gameLoop)

    firebase.database().ref('users/').on('child_added', (snapshot) => {
      const key = snapshot.key
      if (key === this.myPlayerId) return

      const snapshotVal = snapshot.val()
      const player = new Player(false, snapshotVal.x, snapshotVal.y, snapshotVal.name)
      this.$set(this.players, key, player)
      player.sprite.dest.x = snapshotVal.x
      player.sprite.dest.y = snapshotVal.y
      player.sprite.tint = snapshotVal.tint

      player.sprite.interactive = true
      player.sprite.buttonMode = true
      player.sprite.cursor = 'hover'
      player.sprite.on('pointerdown', () => {
        if (this.myPlayerAlive) {
          firebase.database().ref('users/' + key + '/dead').set(true)
          player.dead()
        }
      })

      app.stage.addChild(player.sprite)
    })

    firebase.database().ref('users/').on('child_removed', (snapshot) => {
      const key = snapshot.key
      if (key === this.myPlayerId) return

      this.players[key].parent.removeChild(this.players[key])
      delete this.players[key]
    })

    firebase.database().ref('users/').on('child_changed', (snapshot) => {
      const key = snapshot.key
      const snapshotVal = snapshot.val()

      if (key === this.myPlayerId) {
        if (snapshotVal.dead && this.myPlayerAlive) {
          this.myPlayerAlive = false
          this.myPlayer.sprite.texture = bunnyDedTexture
        }
        return
      }

      this.players[key].sprite.dest.x = snapshotVal.x
      this.players[key].sprite.dest.y = snapshotVal.y
    })
  },
  beforeDestroy () {
    this.ticker.stop()
    this.ticker.destroy()
    firebase.database().ref('users/').off()
  },
  methods: {
    gameLoop (delta) {
      const myPlayerSprite = this.myPlayer.sprite

      if (this.myPlayerAlive) {
        myPlayerSprite.x += myPlayerSprite.vx * delta
        myPlayerSprite.y += myPlayerSprite.vy * delta
      }

      const object = {
        x: myPlayerSprite.x,
        y: myPlayerSprite.y
      }

      if (Math.abs(myPlayerSprite.vx) + Math.abs(myPlayerSprite.vy)) {
        if (this.throttle === 0) {
          this.myPlayerDb.update(object)
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

      for (const [key, player] of Object.entries(this.players)) {
        if (key === this.playerId) {
        } else {
          if (Math.abs(player.sprite.x - player.sprite.dest.x) > 2) {
            player.sprite.x = smooth(player.sprite.x, player.sprite.dest.x, 0.2)
          }
          if (Math.abs(player.sprite.y - player.sprite.dest.y) > 2) {
            player.sprite.y = smooth(player.sprite.y, player.sprite.dest.y, 0.2)
          }
        }
      }
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
