var React = require("react")
var ShortID = require("shortid")

var Loop = require("./scripts/Loop")
var Input = require("./scripts/Input")
var Renderer = require("./scripts/Renderer")

var WIDTH = 854, HEIGHT = 480, TILE = 32

class Space {
    constructor(that) {
        this.x = 0
        this.y = 0
        this.w = 0
        this.h = 0

        if(that.w) {
            this.w = that.w
        } if(that.h) {
            this.h = that.h
        }
        for(var key in that) {
            this[key] = that[key]
        }
    }
    get x0() {
        return this.x - (this.w / 2)
    }
    get y0() {
        return this.y - (this.h / 2)
    }
    get x1() {
        return this.x + (this.w / 2)
    }
    get y1() {
        return this.y + (this.h / 2)
    }
    set x0(x0) {
        this.x = x0 + (this.w / 2)
    }
    set y0(y0) {
        this.y = y0 + (this.h / 2)
    }
    set x1(x1) {
        this.x = x1 - (this.w / 2)
    }
    set y1(y1) {
        this.y = y1 - (this.h / 2)
    }
    get tx() {
        return Math.floor(this.x / TILE)
    }
    get ty() {
        return Math.floor(this.y / TILE)
    }
    get tx0() {
        return Math.floor(this.x0 / TILE)
    }
    get ty0() {
        return Math.floor(this.y0 / TILE)
    }
    get tx1() {
        return Math.floor(this.x1 / TILE)
    }
    get ty1() {
        return Math.floor(this.y1 / TILE)
    }
    set tx(tx) {
        this.x = tx * TILE
    }
    set ty(ty) {
        this.y = ty * TILE
    }
    set tx0(tx0) {
        this.x0 = tx0 * TILE
    }
    set ty0(ty0) {
        this.y0 = ty0 * TILE
    }
    set tx1(tx1) {
        this.x1 = tx1 * TILE
    }
    set ty1(ty1) {
        this.y1 = ty1 * TILE
    }
    toSpace(space) {
        return new Space({
            x: this.x + (space.x ? space.x : 0),
            y: this.y + (space.y ? space.y : 0),
            w: this.w + (space.w ? space.w : 0),
            h: this.h + (space.h ? space.h : 0),
        })
    }
}

class Gardener {
    constructor() {
        this.position = new Space({
            x: TILE * 5, y: TILE * 10,
            w: TILE, h: TILE
        })

        this.direction = {x: 0, y: +1}
        this.velocity = {x: 0, y: 0}
        this.speed = 0.05 //pixels per millisecond
    }
    update(tick) {
        if(Input.isDown("W")
        || Input.isDown("<up>")) {
            this.velocity.y -= this.speed * tick
            this.direction = {x: 0, y: -1}
        }
        if(Input.isDown("S")
        || Input.isDown("<down>")) {
            this.velocity.y += this.speed * tick
            this.direction = {x: 0, y: +1}
        }
        if(Input.isDown("A")
        || Input.isDown("<left>")) {
            this.velocity.x -= this.speed * tick
            this.direction = {x: -1, y: 0}
        }
        if(Input.isDown("D")
        || Input.isDown("<right>")) {
            this.velocity.x += this.speed * tick
            this.direction = {x: +1, y: 0}
        }

        if(this.position.x0 + this.velocity.x < 0) {
            this.position.x0 = 0
            this.velocity.x = 0
        } if(this.position.x1 + this.velocity.x > game.world.width) {
            this.position.x1 = game.world.width
            this.velocity.x = 0
        } if(this.position.y0 + this.velocity.y < 0) {
            this.position.y0 = 0
            this.velocity.y = 0
        } if(this.position.y1 + this.velocity.y > game.world.height) {
            this.position.y1 = game.world.height
            this.velocity.y = 0
        }

        this.position.x += this.velocity.x * tick
        this.position.y += this.velocity.y * tick

        this.velocity.x = 0
        this.velocity.y = 0

        if(Input.isJustDown("<space>")) {
            if(game.world.getTile(this.position).fertile) {
                var tx = this.position.tx0 + this.direction.x
                var ty = this.position.ty0 + this.direction.y
                game.plants.add(new Plant({
                    position: new Space({
                        tx0: tx, ty0: ty,
                        w: TILE, h: TILE,
                    })
                }))
            }
        }
    }
    render() {
        return (
            <div style={{
                position: "absolute",
                width: this.position.w + "em",
                height: this.position.h + "em",
                top: (this.position.ty0 * TILE) + "em",
                left: (this.position.tx0 * TILE) + "em",
                backgroundColor: "purple",
                transitionProperty: "top left",
                transitionDuration: "0.2s",
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

class Plant {
    constructor(that) {
        for(var key in that) {
            this[key] = that[key]
        }
    }
    render() {
        return (
            <div key={this.key} style={{
                position: "absolute",
                top: this.position.y0 + "em",
                left: this.position.x0 + "em",
                width: this.position.w + "em",
                height: this.position.h + "em",
                backgroundColor: "#C00",
            }}/>
        )
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
                        position: new Space({
                            w: TILE, h: TILE,
                            x0: tx * TILE,
                            y0: ty * TILE,
                        }),
                        fertile: gid - 1 == 18 || gid - 1 == 19,
                        gid: gid - 1 //off by one
                    })
                })
            }
        })
    }
    getTile(space) {
        if(!!this.tilemap[space.tx + "x" + space.ty]) {
            return this.tilemap[space.tx + "x" + space.ty]
        } else {
            return new Tile({
                unpassable: true,
                position: new Space({
                    tx: space.tx, ty: space.ty
                })
            })
        }
    }
    getTiles(space) {
        var tiles = new Array()

        for(var tx = space.tx0; tx < space.tx1; tx++) {
            for(var ty = space.ty0; ty < space.ty1; ty++) {
                tiles.push(this.getTile(new Space({
                    tx: tx, ty: ty
                })))
            }
        }

        return tiles
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
                                    (tile.gid * TILE) % this.tileset.width,
                                    Math.floor((tile.gid * TILE) / this.tileset.width) * TILE,
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

class Camera {
    constructor(target) {
        this.target = target
        this.position = new Space({
            x: this.target.position.x,
            y: this.target.position.y,
            w: WIDTH, h: HEIGHT
        })
    }
    update(tick) {
        this.position.x = this.target.position.x
        this.position.y = this.target.position.y

        if(this.position.x0 < 0) {
            this.position.x0 = 0
        } if(this.position.x1 > game.world.width) {
            this.position.x1 = game.world.width
        } if(this.position.y0 < 0) {
            this.position.y0 = 0
        } if(this.position.y1 > game.world.height) {
            this.position.y1 = game.world.height
        }
    }
    render() {
        return {
            position: "absolute",
            top: -1 * this.position.y0 + "em",
            left: -1 * this.position.x0 + "em",
            //fontSize: this.position.z + "em"
        }
    }
}

class Collection {
    add(entity) {
        entity.key = ShortID.generate()
        this[entity.key] = entity
    }
    remove(entity) {
        delete this[entity.id]
    }
    render() {
        return (
            <div>
                {Object.keys(this).map((key) => {
                    return this[key].render()
                })}
            </div>
        )
    }
    update(tick) {
        return
    }
}

var game = window.game = new Object()
game.gardener = new Gardener()
game.world = new World(require("./tilemaps/farm.tiled.json"))
game.camera = new Camera(game.gardener)
game.plants = new Collection("plants")

class InGameState {
    render() {
        return (
            <div id="in-game-state">
                {/*<div id="camera" style={game.camera.render()}>*/}
                    {game.world.render()}
                    {game.plants.render()}
                    {game.gardener.render()}
            </div>
        )
    }
    update(tick) {
        game.gardener.update(tick)
        game.camera.update(tick)
        game.plants.update(tick)
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
