var React = require("react")

var Loop = require("./scripts/Loop")
var Input = require("./scripts/Input")
var Renderer = require("./scripts/Renderer")

var WIDTH = 854, HEIGHT = 480, TILE = 32

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

class Tile {
    constructor(data) {
        for(var key in data) {
            this[key] = data[key]
        }
    }
}

class World {
    constructor(tilemap) {
        this.tileset = new Array()
        tilemap.tilesets.forEach((tileset) => {
            var image = new Image()
            image.src = tileset.image
            image.onload = () => {
                var canvas = document.createElement("canvas")
                var canvas2d = canvas.getContext("2d")
                canvas.width = TILE
                canvas.height = TILE
                for(var y = 0; y < image.height; y += TILE) {
                    for(var x = 0; x < image.width; x += TILE) {
                        canvas2d.drawImage(image, x, y, TILE, TILE, 0, 0, TILE, TILE)
                        this.tileset.push(canvas.toDataURL())
                    }
                }
            }
        })
        this.tilemap = new Object()
        tilemap.layers.forEach((layer) => {
            if(layer.type === "tilelayer") {
                layer.data.forEach((gid, index) => {
                    var tx = index % layer.width
                    var ty = Math.floor(index / layer.width)
                    this.tilemap[tx + "x" + ty] = new Tile({
                        position: {tx: tx, ty: ty},
                        gid: gid - 1 //off by one
                    })
                })
            }
        })
    }
    render() {
        return (
            <div id="world">
                {Object.keys(this.tilemap).map((key) => {
                    var tile = this.tilemap[key]
                    return (
                        <div key={key} style={{
                            width: TILE + "em",
                            height: TILE + "em",
                            position: "absolute",
                            top: tile.position.ty * TILE + "em",
                            left: tile.position.tx * TILE + "em",
                            backgroundImage: this.tileset[tile.gid] ? "url(" + this.tileset[tile.gid] + ")" : "",
                            backgroundSize: TILE + "em",
                        }}/>
                    )
                })}
            </div>
        )
    }
}

var game = window.game = new Object()
game.gardener = new Gardener()
game.world = new World(require("./tilemaps/farm.tiled.json"))

class InGameState {
    render() {
        return (
            <div id="in-game-state">
                {game.world.render()}
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
