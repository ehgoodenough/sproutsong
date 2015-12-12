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

class Canvas extends React.Component {
    render() {
        return (
            <canvas ref="canvas"
                width={this.props.width}
                height={this.props.height}
                style={{
                    width: this.props.width + "em",
                    height: this.props.height + "em",
                }}/>
        )
    }
    componentDidMount() {
        this.props.callback(this.refs.canvas)
    }
    componentDidUpdate() {
        this.props.callback(this.refs.canvas)
    }
    shouldComponentUpdate() {
        if(this.props.data.rerender == true) {
            this.props.data.rerender = false
            return true
        } else {
            return false
        }
    }
}

class World {
    constructor(tiled) {
        this.width = tiled.width * TILE
        this.height = tiled.height * TILE

        this.tileset = new Image()
        this.tileset.src = tiled.tilesets.pop().image
        this.tileset.onload = () => {this.rerender = true}

        this.tilemap = new Object()
        tiled.layers.forEach((layer) => {
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
                <Canvas data={this}
                    width={this.width}
                    height={this.height}
                    callback={(canvas) => {
                        if(this.tileset != undefined) {
                            var canvas2d = canvas.getContext("2d")
                            Object.keys(this.tilemap).map((key) => {
                                var tile = this.tilemap[key]
                                canvas2d.drawImage(this.tileset,
                                    (tile.gid % this.tileset.width) * TILE,
                                    Math.floor(tile.gid / this.tileset.width) * TILE,
                                    TILE, TILE,
                                    tile.position.tx * TILE,
                                    tile.position.ty * TILE,
                                    TILE, TILE)
                            })
                        }
                    }}
                />
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
