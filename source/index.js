var React = require("react")

var Loop = require("./scripts/Loop")
var Input = require("./scripts/Input")
var Renderer = require("./scripts/Renderer")

var WIDTH = 854, HEIGHT = 480

class Gardener {
    constructor() {
        this.width = 32
        this.height = 32

        this.position = {x: 64, y: 64}
        this.velocity = {x: 0, y: 0}

        this.speed = 0.25 //pixels per millisecond
    }
    update(tick) {
        if(Input.isDown("W")
        || Input.isDown("<up>")) {
            this.velocity.y = -1 * this.speed
        }
        if(Input.isDown("S")
        || Input.isDown("<down>")) {
            this.velocity.y = +1 * this.speed
        }
        if(Input.isDown("A")
        || Input.isDown("<left>")) {
            this.velocity.x = -1 * this.speed
        }
        if(Input.isDown("D")
        || Input.isDown("<right>")) {
            this.velocity.x = +1 * this.speed
        }

        this.position.x += this.velocity.x * tick
        this.position.y += this.velocity.y * tick

        // var friction = 0.0000000000000000000001
        // this.velocity.x *= Math.pow(friction, tick / 1000)
        // this.velocity.y *= Math.pow(friction, tick / 1000)
        if(this.velocity.x > 0) {
            this.velocity.x *= 0.8
            if(this.velocity <= 0.1) {
                this.velocity.x = 0
            }
        } else if(this.velocity.x < 0) {
            this.velocity.x *= 0.8
            if(this.velocity >= -0.1) {
                this.velocity.x = 0
            }
        }
        if(this.velocity.y > 0) {
            this.velocity.y *= 0.8
            if(this.velocity <= 0.1) {
                this.velocity.y = 0
            }
        } else if(this.velocity.y < 0) {
            this.velocity.y *= 0.8
            if(this.velocity >= -0.1) {
                this.velocity.y = 0
            }
        }
    }
    render() {
        return (
            <div style={{
                position: "absolute",
                width: this.width + "em",
                height: this.height + "em",
                top: Math.round(this.position.y - (this.height / 2)) + "em",
                left: Math.round(this.position.x - (this.width / 2)) + "em",
                backgroundColor: "#0C0"
            }}/>
        )
    }
}

var game = new Object()
game.gardener = new Gardener()

class InGameState {
    render() {
        return (
            <div id="in-game-state">
                {game.gardener.render()}
            </div>
        )
    }
    update(tick) {
        game.gardener.update(tick)
    }
}

var state = new InGameState()

var renderer = new Renderer(document.getElementById("mount"))

var loop = new Loop(function(tick) {
    state.update(tick)
    renderer.render(function() {
        return (
            <div id="frame">
                {state.render()}
            </div>
        )
    })
})
