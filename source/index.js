// how do you get seeds from store? remove "holding" change to seed
// change how you pick up stuff that's lame as heck right now
// fix dropping seeds to be around and below you, not just below you

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

        that = that || {}
        if(!!that.w) {
            this.w = that.w
        } if(!!that.h) {
            this.h = that.h
        } for(var key in that) {
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
    toSpace(space = new Object()) {
        return new Space({
            x: this.x + (space.x ? space.x : 0),
            y: this.y + (space.y ? space.y : 0),
            w: this.w + (space.w ? space.w : 0),
            h: this.h + (space.h ? space.h : 0),
        })
    }
    toString(space = new Object()) {
        return (this.tx0 + (space.tx0 || 0)) + "x" + (this.ty0 + (space.ty0 || 0))
    }
    getNeighbors() {
        return [
            this.toString({tx0: -1}),
            this.toString({tx0: +1}),
            this.toString({ty0: -1}),
            this.toString({ty0: +1}),
            this.toString({tx0: -1, ty0: -1}),
            this.toString({tx0: -1, ty0: +1}),
            this.toString({tx0: +1, ty0: -1}),
            this.toString({tx0: +1, ty0: +1}),
        ]
    }
}

class Point {
    constructor(that) {
        this.x = 0
        this.y = 0

        that = that || {}
        for(var key in that) {
            this[key] = that[key]
        }
    }

    get tx() {
        return Math.floor(this.x / TILE)
    }
    get ty() {
        return Math.floor(this.y / TILE)
    }
    set tx(tx) {
        this.x = tx * TILE
    }
    set ty(ty) {
        this.y = ty * TILE
    }
    toPoint(point) {
        return new Point({
            x: this.x + (space.x ? space.x : 0),
            y: this.y + (space.y ? space.y : 0)
        })
    }
    toString() {
        return this.tx + "x" + this.ty
    }
}

class Shop {
    constructor() {
        this.position = new Space({
            tx0: 20, ty0: 5
        })
        this.tw = 7
        this.th = 4
    }
    render() {
        return (
            <div style={{
                top: Math.floor(this.position.ty0 - this.th) * TILE + "em",
                left: Math.floor(this.position.tx0) * TILE + "em",
                zIndex: Math.floor(this.position.ty0) * TILE,
                position: "absolute",
                width: (this.tw * TILE) + "em",
                height: (this.th * TILE) + "em",
                backgroundSize: "contain",
                backgroundPosition: "bottom",
                backgroundRepeat: "no-repeat",
                backgroundImage: "url(" + images["shop.png"] + ")"
            }}/>
        )
    }
    update(tick) {
        return
    }
}

class Gardener {
    constructor() {
        this.inventory = new Array()
        this.direction = {tx: 0, ty: 0}
        this.velocity = {x: 0, y: 0}
        this.position = new Space({
            tx0: 4, ty0: 4,
            w: TILE, h: TILE,
        })

        this.speed = TILE * 0.0075

        this.gold = 0
        this.animating = 0
        this.seed = plants[0]
        this.holding = this.seed
        this.step = true
    }
    update(tick) {
        this.animating -= tick

        if(Input.isDown("W")
        || Input.isDown("<up>")) {
            this.direction = {tx: 0, ty: -1}
            this.velocity.y = -1 * this.speed * tick
        } else if(Input.isDown("S")
        || Input.isDown("<down>")) {
            this.direction = {tx: 0, ty: +1}
            this.velocity.y = +1 * this.speed * tick
        } else {
            this.velocity.y = 0
        } if(Input.isDown("A")
        || Input.isDown("<left>")) {
            this.direction = {tx: -1, ty: 0}
            this.velocity.x = -1 * this.speed * tick
        } else if(Input.isDown("D")
        || Input.isDown("<right>")) {
            this.direction = {tx: +1, ty: 0}
            this.velocity.x = +1 * this.speed * tick
        } else {
            this.velocity.x = 0
        }

        // do not collide with shop.
        if(this.position.x0 + this.velocity.x >= (game.shop.position.tx0) * TILE
        && this.position.y0 >= (game.shop.position.ty0 - 1) * TILE
        && this.position.x0 + this.velocity.x < (game.shop.position.tx0 + game.shop.tw) * TILE
        && this.position.y0 < (game.shop.position.ty0) * TILE) {
            this.velocity.x = 0
        }
        if(this.position.x0 + this.velocity.x >= (game.shop.position.tx0) * TILE
        && this.position.y0 + this.velocity.y >= (game.shop.position.ty0 - 1) * TILE
        && this.position.x0 + this.velocity.x < (game.shop.position.tx0 + game.shop.tw) * TILE
        && this.position.y0 + this.velocity.y < (game.shop.position.ty0) * TILE) {
            this.velocity.y = 0
        }
        if(Math.floor((this.position.x0 + this.velocity.x) / TILE) == 6
        && Math.floor((this.position.y0) / TILE) == 15) {
            this.velocity.x = 0
        }
        if(Math.floor((this.position.x0 + this.velocity.x) / TILE) == 6
        && Math.floor((this.position.y0 + this.velocity.y) / TILE) == 15) {
            this.velocity.y = 0
        }

        // do not collide with world.
        // world.getTile(this.position.toSpace({x: this.velocity.x})).some((tile) => {
        //     if(tile.unpassable == true) {
        //         this.velocity.x = 0
        //         return true
        //     }
        // })

        if(Math.floor((this.position.x0 + this.velocity.x) / TILE) != this.position.tx0
        || Math.floor((this.position.y0 + this.velocity.y) / TILE) != this.position.ty0) {
            if(game.poofs == undefined) {
                game.poofs = new Poof({
                    position: new Space({
                        tx0: this.position.tx0 + (this.direction.tx * -1),
                        ty0: this.position.ty0 + (this.direction.ty * -1),
                    })
                })
                this.step = !this.step
                if(this.step) {
                    sounds["walk2"].play()
                } else {
                    sounds["walk1"].play()
                }
            }
        }

        // translate.
        this.position.x0 += this.velocity.x
        this.position.y0 += this.velocity.y

        // do not leave the world.
        if(this.position.x0 < 0) {
            this.position.x0 = 0
        } if(this.position.x0 > game.world.width - TILE) {
            this.position.x0 = game.world.width - TILE
        } if(this.position.ty0 < 1) {
            this.position.ty0 = 1
        } if(this.position.y0 > game.world.height - TILE) {
            this.position.y0 = game.world.height - TILE
        }

        // get position
        var key = this.position.tx0 + "x" + this.position.ty0

        // harvest plants by walking on them.
        if(!!game.plants[key]) {
            var plant = game.plants[key]
            if(plant.harvestable) {
                this.inventory.push(plant)
                game.plants.remove(plant)
                sounds["harvesting"].play()
            }
        }

        if(Input.isJustDown("<space>")) {

            if((this.position.tx0 == 21 && this.position.ty0 == 5
            && this.direction.tx == 0 && this.direction.ty == -1)
            || (this.position.tx0 == 20 && this.position.ty0 == 4
            && this.direction.tx == +1 && this.direction.ty == 0)) {
                game.state = new ShoppingState()
            } else  if((this.position.tx0 == 25 && this.position.ty0 == 5
            && this.direction.tx == 0 && this.direction.ty == -1)
            || (this.position.tx0 == 26 && this.position.ty0 == 4
            && this.direction.tx == -1 && this.direction.ty == 0)) {
                if(this.inventory.length > 0) {
                    this.inventory.forEach((plant) => {
                        this.gold += plant.gold
                    })
                    this.inventory = []
                    sounds["store-sell"].play()
                }
            } else if(this.seed != undefined) {
                var positions = []
                if(this.seed.formation >= 8) {
                    positions = positions.concat(this.position.getNeighbors())
                } if(this.seed.formation == 1 || this.seed.formation == 9) {
                    positions.push(this.position.toString())
                }
                var canPlant = false
                positions.forEach((position) => {
                    var tile = game.world.tilemap[position]
                    var plant = game.plants[position]
                    if(!!tile && tile.isSoil && !plant) {
                        canPlant = true
                        game.plants.add(new Plant({
                            position: new Space({
                                tx0: tile.position.tx0,
                                ty0: tile.position.ty0,
                                w: TILE, h: TILE,
                            }),
                            images: [images["plants/seed.png"]].concat(this.seed.images),
                            update: this.seed.update,
                            initialize: this.seed.initialize,
                            gold: this.seed.gold,
                        }))
                    }
                })
                if(canPlant == true) {
                    this.animating = 500
                    this.animation = "drop"
                    delete this.holding
                    delete this.seed
                    sounds["tilling" + (Math.floor(Math.random() * 3) + 1)].play()
                }
            }
        }
    }
    getImage() {
        if(this.animating > 0) {
            if(this.animation == "spin") {
                return images["gardener/magic_spin.gif"]
            } else if(this.animation == "drop") {
                if(this.direction.tx == 0 && this.direction.ty == -1) {
                    return images["gardener/magic_back.gif"]
                } else if(this.direction.tx == 0 && this.direction.ty == +1) {
                    return images["gardener/magic_front.gif"]
                } else if(this.direction.tx == -1 && this.direction.ty == 0) {
                    return images["gardener/magic_left.gif"]
                } else if(this.direction.tx == +1 && this.direction.ty == 0) {
                    return images["gardener/magic_right.gif"]
                } else {
                    return images["gardener/magic_front.gif"]
                }
            }
        } else if(this.holding != undefined) {
            if(this.direction.tx == 0 && this.direction.ty == -1) {
                return images["gardener/magic_still_back.png"]
            } else if(this.direction.tx == 0 && this.direction.ty == +1) {
                return images["gardener/magic_still_front.png"]
            } else if(this.direction.tx == -1 && this.direction.ty == 0) {
                return images["gardener/magic_still_left.png"]
            } else if(this.direction.tx == +1 && this.direction.ty == 0) {
                return images["gardener/magic_still_right.png"]
            } else {
                return images["gardener/magic_still_front.png"]
            }
        } else {
            if(this.velocity.x == 0 && this.velocity.y == 0) {
                if(this.direction.tx == 0 && this.direction.ty == -1) {
                    return images["gardener/idle_back.gif"]
                } else if(this.direction.tx == 0 && this.direction.ty == +1) {
                    return images["gardener/idle_front.gif"]
                } else if(this.direction.tx == -1 && this.direction.ty == 0) {
                    return images["gardener/idle_left.gif"]
                } else if(this.direction.tx == +1 && this.direction.ty == 0) {
                    return images["gardener/idle_right.gif"]
                }
            } else {
                if(this.direction.tx == 0 && this.direction.ty == -1) {
                    return images["gardener/walk_back.gif"]
                } else if(this.direction.tx == 0 && this.direction.ty == +1) {
                    return images["gardener/walk_front.gif"]
                } else if(this.direction.tx == -1 && this.direction.ty == 0) {
                    return images["gardener/walk_left.gif"]
                } else if(this.direction.tx == +1 && this.direction.ty == 0) {
                    return images["gardener/walk_right.gif"]
                }
            }
        }

        return images["gardener/idle_front.gif"]
    }
    render() {
        return (
            <div id="gardener" style={{
                backgroundSize: "contain",
                backgroundPosition: "bottom",
                backgroundRepeat: "no-repeat",
                backgroundImage: "url(" + this.getImage() + ")",
                top: (this.position.ty0 - 1) * TILE + "em",
                left: this.position.tx0 * TILE + "em",
                width: this.position.w + "em",
                height: this.position.h + TILE + "em",
                zIndex: this.position.ty0 * TILE,
                transitionProperty: "top left",
                transitionDuration: "0.25s",
                position: "absolute"
            }}>
                {!!this.holding ? (
                    <div style={{
                        width: TILE + "em",
                        height: TILE + "em",
                        position: "absolute",
                        top: -0.5 * TILE + "em",
                        backgroundSize: "contain",
                        backgroundPosition: "bottom",
                        backgroundRepeat: "no-repeat",
                        backgroundImage: "url(" + this.holding.holdimage + ")",
                    }}/>
                ) : ""}
            </div>
        )
    }
    renderGUI() {
        return (
            <div id="gui" style={{
                position: "absolute",
                width: 142 + "em",
                height: 129 + "em",
                zIndex: 10000,
                right: "0em",
                bottom: "0em",
                backgroundImage: "url(" + images["gui.png"] + ")",
                backgroundRepeat: "no-repeat",
                backgroundSize: "contain",
            }}>
                <div style={{
                    right: 23 + "em",
                    bottom: 23 + "em",
                    fontWeight: "bold",
                    position: "absolute",
                    textAlign: "center",
                    color: "rgb(185,102,39)"
                }}>
                    <div style={{fontSize: "28em", lineHeight: "1em"}}>
                        {this.gold}
                    </div>
                    <div style={{fontSize: "16em"}}>
                        GOLD
                    </div>
                </div>
            </div>
        )
    }
}

var images = new Object()
images["poof.png"] = require("./images/poff.png")
images["gui.png"] = require("./images/gui.png")
images["shop.png"] = require("./images/shop.png")
images["textbox.png"] = require("./images/textbox.png")
images["about.png"] = require("./images/about.png")

images["gardener/idle_back.gif"] = require("./images/gardener/idle_back.gif")
images["gardener/idle_front.gif"] = require("./images/gardener/idle_front.gif")
images["gardener/idle_left.gif"] = require("./images/gardener/idle_left.gif")
images["gardener/idle_right.gif"] = require("./images/gardener/idle_right.gif")
images["gardener/walk_back.gif"] = require("./images/gardener/walk_back.gif")
images["gardener/walk_front.gif"] = require("./images/gardener/walk_front.gif")
images["gardener/walk_left.gif"] = require("./images/gardener/walk_left.gif")
images["gardener/walk_right.gif"] = require("./images/gardener/walk_right.gif")
images["gardener/magic_front.gif"] = require("./images/gardener/magic_front.gif")
images["gardener/magic_back.gif"] = require("./images/gardener/magic_back.gif")
images["gardener/magic_left.gif"] = require("./images/gardener/magic_left.gif")
images["gardener/magic_right.gif"] = require("./images/gardener/magic_right.gif")
images["gardener/magic_spin.gif"] = require("./images/gardener/magic_spin.gif")
images["gardener/magic_still_front.png"] = require("./images/gardener/magic_still_front.png")
images["gardener/magic_still_back.png"] = require("./images/gardener/magic_still_back.png")
images["gardener/magic_still_left.png"] = require("./images/gardener/magic_still_left.png")
images["gardener/magic_still_right.png"] = require("./images/gardener/magic_still_right.png")

images["plants/seed.png"] = require("./images/plants/seed.png")
images["plants/rabbit-foot-1.png"] = require("./images/plants/rabbit-foot-1.png")
images["plants/rabbit-foot-2.gif"] = require("./images/plants/rabbit-foot-2.gif")
images["plants/crystal-sprout-1.png"] = require("./images/plants/crystal-sprout-1.png")
images["plants/crystal-sprout-2.png"] = require("./images/plants/crystal-sprout-2.png")
images["plants/crystal-sprout-3.gif"] = require("./images/plants/crystal-sprout-3.gif")
images["plants/newt-eye-1.png"] = require("./images/plants/newt-eye-1.png")
images["plants/newt-eye-2.png"] = require("./images/plants/newt-eye-2.png")
images["plants/newt-eye-3.gif"] = require("./images/plants/newt-eye-3.gif")
images["plants/lullaby-lily-1.png"] = require("./images/plants/lullaby-lily-1.png")
images["plants/lullaby-lily-2.gif"] = require("./images/plants/lullaby-lily-2.gif")

images["plants/bag_rabbit-foot.png"] = require("./images/plants/bag_rabbit-foot.png")
images["plants/bag_crystal-sprout.png"] = require("./images/plants/bag_crystal-sprout.png")
images["plants/bag_newt-eye.png"] = require("./images/plants/bag_newt-eye.png")
images["plants/bag_lullaby-lily.png"] = require("./images/plants/bag_lullaby-lily.png")

var sounds = new Object()
sounds["walk1"] = new Audio(require("./sounds/walking1-loud.mp3"))
sounds["walk2"] = new Audio(require("./sounds/walking2-loud.mp3"))
sounds["store-buy"] = new Audio(require("./sounds/store-buy.mp3"))
sounds["store-sell"] = new Audio(require("./sounds/store-sell.mp3"))
sounds["harvesting"] = new Audio(require("./sounds/harvesting-plant.mp3"))
sounds["tilling1"] = new Audio(require("./sounds/tilling1.mp3"))
sounds["tilling2"] = new Audio(require("./sounds/tilling2.mp3"))
sounds["tilling3"] = new Audio(require("./sounds/tilling3.mp3"))

sounds["saving"] = new Audio(require("./sounds/saving.mp3"))
sounds["blip2"] = new Audio(require("./sounds/blip2.mp3"))
sounds["blip3"] = new Audio(require("./sounds/blip3.mp3"))
sounds["grow1"] = new Audio(require("./sounds/growing1.mp3"))
sounds["grow2"] = new Audio(require("./sounds/growing2.mp3"))
sounds["grow3"] = new Audio(require("./sounds/growing3.mp3"))

sounds["walk1"].volume = 0.5
sounds["walk2"].volume = 0.5

var music = new Audio(require("./sounds/Sproutsong.mp3"))
music.loop = true
music.volume = 0.75
music.play()

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

var plants = window.plants = [
    {
        name: "Rabbit Foot",
        blurb: "A fast-growing plant; a rabbit's foot yeilds a quick award!",
        formation: 9,
        price: 2, //buy from shop
        gold: 1, //sell to shop
        images: [
            images["plants/rabbit-foot-1.png"],
            images["plants/rabbit-foot-2.gif"]
        ],
        holdimage: images["plants/bag_rabbit-foot.png"],
        update: function(tick) {
            this.growth += tick
            if(this.stage == 0) {
                if(this.growth > 1 * 2000) {
                    this.stage = 1
                }
            }
            if(this.stage == 1) {
                if(this.growth > 1 * 4000) {
                    this.stage = 2
                }
            }
            if(this.stage == 2) {
                this.harvestable = true
            }
        }
    },
    {
        name: "Crystal Sprout",
        blurb: "A slow-growing plant; it might take a while to grow, but it's sells for a lot.",
        formation: 8,
        price: 10,
        gold: 3,
        images: [
            images["plants/crystal-sprout-1.png"],
            images["plants/crystal-sprout-2.png"],
            images["plants/crystal-sprout-3.gif"]
        ],
        holdimage: images["plants/bag_crystal-sprout.png"],
        update: function(tick) {
            this.growth += tick
            if(this.stage == 0) {
                if(this.growth > 10 * 1000) {
                    this.stage = 1
                }
            }
            if(this.stage == 1) {
                if(this.growth > 20 * 1000) {
                    this.stage = 2
                }
            }
            if(this.stage == 2) {
                if(this.growth > 40 * 1000) {
                    this.stage = 3
                }
            }
            if(this.stage == 3) {
                this.harvestable = true
                this.unpassable = true
            }
        }
    },
    {
        name: "Newt Eye",
        blurb: "A volatile plant; if not harvested quickly, it'll rot, and be worthless.",
        formation: 8,
        price: 12,
        gold: 4,
        images: [
            images["plants/newt-eye-1.png"],
            images["plants/newt-eye-2.png"],
            images["plants/newt-eye-3.gif"]
        ],
        holdimage: images["plants/bag_newt-eye.png"],
        update: function(tick) {
            this.growth += tick
            if(this.stage == 0) {
                if(this.growth > 1 * 1000) {
                    this.stage = 1
                }
            }
            if(this.stage == 1) {
                if(this.growth > 10 * 1000) {
                    this.stage = 2
                }
            }
            if(this.stage == 2) {
                this.harvestable = true
                if(this.growth > 13 * 1000) {
                    this.stage = 3
                }
            }
            if(this.stage == 3) {
                this.gold = 0
            }
        }
    },
    {
        name: "Lullaby Lily",
        blurb: "A helpful plant; a lullably lily will sing to your other plants to make them grow!",
        formation: 1,
        price: 28,
        gold: 10,
        images: [
            images["plants/lullaby-lily-1.png"],
            images["plants/lullaby-lily-2.gif"]
        ],
        holdimage: images["plants/bag_lullaby-lily.png"],
        initialize: function() {
            this.neighbors = this.position.getNeighbors()
        },
        update: function(tick) {
            this.growth += tick
            if(this.stage == 0) {
                if(this.growth > 10 * 1000) {
                    this.stage = 1
                }
            }
            if(this.stage == 1) {
                if(this.growth > 20 * 1000) {
                    this.stage = 2
                }
            }
            if(this.stage == 2) {
                this.neighbors.forEach(function(position) {
                    if(game.plants[position] != undefined) {
                        game.plants[position].growth += 10
                    }
                })
            }
        }
    }
]

class Plant {
    constructor(that) {
        this.position = that.position
        this.images = that.images
        this.update = that.update
        this.gold = that.gold

        if(that.initialize != undefined) {
            this.initialize = that.initialize
            this.initialize()
        }

        this.key = this.position.tx0 + "x" + this.position.ty0

        this.growth = Math.random() * 1000
        this.stage = 0
    }
    render() {
        return (
            <div id="plant" key={this.key} style={{
                top: this.position.y0 - TILE + "em",
                left: this.position.x0 + "em",
                zIndex: this.position.y0,
                position: "absolute",
                width: TILE + "em",
                height: (TILE * 2) + "em",
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundImage: "url(" + this.images[this.stage] + ")",
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
                        gid: gid - 1, //off by one
                        isSoil: gid - 1 == 18 || gid - 1 == 19 || gid - 1 == 20,
                        isShop: gid - 1 == 27,
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
            transitionProperty: "top left",
            transitionDuration: "1s"
        }
    }
}

class Collection {
    add(entity) {
        if(entity.key == undefined) {
            entity.key = ShortID.generate()
        }
        this[entity.key] = entity
    }
    remove(entity) {
        delete this[entity.key]
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
        Object.keys(this).map((key) => {
            return this[key].update(tick)
        })
    }
}

class Poof {
    constructor(data) {
        this.position = data.position
        this.fading = 200
        this.maxfading = 100
    }
    update(tick) {
        this.fading -= tick
        if(this.fading < 0) {
            delete game.poofs
        }
    }
    render() {
        return (
            <div key={this.key} style={{
                position: "absolute",
                zIndex: 1,
                top: this.position.y0 + "em",
                left: this.position.x0 + "em",
                opacity: (this.fading / this.maxfading) * 0.25,
                backgroundImage: "url(" + images["poof.png"] + ")",
                backgroundRepeat: "no-repeat",
                backgroundSize: "contain",
                height: TILE + "em",
                width: TILE + "em",
            }}/>
        )
    }
}

var game = window.game = new Object()
game.gardener = new Gardener()
game.world = new World(require("./tilemaps/farm.tiled.json"))
game.camera = new Camera(game.gardener)
game.plants = new Collection()
game.torches = new Collection()
game.shop = new Shop()
game.gardener.gold = 100

class FarmingState {
    render() {
        return (
            <div id="farming-state">
                <div id="camera" style={game.camera.render()}>
                    {game.world.render()}
                    {game.shop.render()}
                    {game.plants.render()}
                    {game.poofs ? game.poofs.render() : ""}
                    {game.gardener.render()}
                </div>
                {game.gardener.renderGUI()}
                <div id="pause-menu" style={{bottom: game.paused ? 0 : -2 * HEIGHT + "em"}}>
                    <section>
                        <h2>Paused!</h2>
                        <div>---</div>
                        <div style={{color: game.cursor == 0 ? colors.red : "inherit"}}>resume game</div>
                        <div style={{color: game.cursor == 1 ? colors.red : "inherit"}}>return to menu</div>
                    </section>
                </div>
            </div>
        )
    }
    update(tick) {
        if(Input.isJustDown("<escape>")) {
            game.paused = !game.paused
            if(game.paused == true) {
                game.cursor = 0
            }
        }
        if(game.paused) {
            if(Input.isDown("W")
            || Input.isDown("<up>")) {
                game.cursor = 0
            }
            if(Input.isDown("S")
            || Input.isDown("<down>")) {
                game.cursor = 1
            }
            if(Input.isDown("<space>")
            || Input.isDown("<enter>")) {
                Input.setUp("<space>")
                Input.setUp("<enter>")
                if(game.cursor == 0) {
                    game.paused = false
                } else if(game.cursor == 1) {
                    game.state = new TitleState()
                    game.paused = false
                    game.cursor = 0
                }
            }
        } else {
            game.gardener.update(tick)
            game.camera.update(tick)
            game.plants.update(tick)
            game.shop.update(tick)
            if(game.poofs) game.poofs.update(tick)
        }
    }
}

var colors = {
    red: "rgb(185,103,39)",
    background: "rgb(255,203,124)",
    blue: "rgb(106,151,197)",
    white: "#EEE",
    black: "#111",
}

class TitleState {
    render() {
        return (
            <div id="title-screen">
                <div id="backdrop"></div>
                <header>
                    <div id="sign">
                        <div id="signpost-1"/>
                        <div id="signpost-2"/>
                        <div id="signboard"/>
                    </div>
                </header>
                <div id="navigation">
                    <div style={{color: game.cursor === 0 ? colors.white : colors.black}}>Play</div>
                    <div style={{color: game.cursor === 1 ? colors.white : colors.black}}>About</div>
                </div>
                <div id="controls">
                    <div>Move with the</div>
                    <div>arrow keys or</div>
                    <div>wasd, interact</div>
                    <div>with the world</div>
                    <div>using space</div>
                </div>
                <div id="portrait"/>
            </div>
        )
    }
    update(tick) {
        if(Input.isJustDown("<up>")
        || Input.isJustDown("W")) {
            game.cursor -= 1
            if(game.cursor < 0) {
                game.cursor = 0
            }
        }
        if(Input.isJustDown("<down>")
        || Input.isJustDown("S")) {
            game.cursor += 1
            if(game.cursor > 1) {
                game.cursor = 1
            }
        }
        if(Input.isJustDown("<space>")
        || Input.isJustDown("<enter>")) {
            Input.setUp("<space>")
            Input.setUp("<enter>")
            if(game.cursor == 0) {
                game.state = new FarmingState()
            } else if(game.cursor == 1) {
                game.state = new AboutState()
            }
        }
    }
}

class AboutState {
    render() {
        return (
            <div id="about-screen">
                <section>
                    <div>
                        Grow your garden of magical
                        plants to sell at the market!
                    </div>
                    <div>
                        ...put better blurb here...
                    </div>
                    <div>
                        We are Jam Sandwich!
                    </div>
                    <div>
                        We hope you enjoy the game!
                    </div>
                    <div>
                        Developed for Ludum Dare 34, where the theme was <b>Growing.</b>
                    </div>
                    <div>
                        <a href="http://twitter.com/ehgoodenough" target="_blank">Code: @ehgoodenough</a>
                        <a href="http://twitter.com/madameberry" target="_blank">Art: @madameberry</a>
                        <a href="http://twitter.com/mcfunkypants" target="_blank">Sound: @mcfunkypants</a>
                    </div>
                </section>
            </div>
        )
    }
    update(tick) {
        if(Input.isDown("<escape>")) {
            Input.setUp("<escape>")
            game.state = new TitleState()
        }
    }
}

class ShoppingState {
    constructor() {
        this.catalog = [
            plants[0],
            plants[1],
            plants[2],
            plants[3],
        ]
    }
    render() {
        return (
            <div id="shopping-state">
                <section>
                    <div style={{fontSize: "2em"}}>Shoppe</div>
                    <div style={{margin: "1em 0em"}}>------------</div>
                    <ul>
                        {this.catalog.map((plant, key) => {
                            return (
                                <li key={key} style={{
                                    color: game.cursor == key ? "#C00" : "#111",
                                    listStyleType: game.cursor == key ? "circle" : "inherit"}}>
                                    <b>{plant.name}</b> seeds
                                </li>
                            )
                        })}
                    </ul>
                    <div style={{
                        marginTop: "1em",
                        color: game.cursor == this.catalog.length ? "#C00" : "#111"}}>
                        Exit shoppe
                    </div>
                </section>
                <div id="details">
                    <section>
                        {game.cursor < this.catalog.length ? (
                            <div>
                                <div style={{textAlign: "center"}}>
                                    {this.catalog[game.cursor].images.map((image, index) => {
                                        return (
                                            <div key={index} style={{display: "inline-block"}}>
                                                <div style={{
                                                    display: "inline-block",
                                                    backgroundImage: "url(" + image + ")",
                                                    backgroundSize: "contain",
                                                    width: "2em",
                                                    height: "4em",
                                                }}/>
                                                {index < this.catalog[game.cursor].images.length - 1 ? (
                                                    <div style={{
                                                        display: "inline-block",
                                                        verticalAlign: "bottom",
                                                        width: "2em",
                                                        height: "2em",
                                                    }}>
                                                        &#8594;
                                                    </div>
                                                ) : ""}
                                            </div>
                                        )
                                    })}
                                </div>
                                <div style={{margin: "1em 0em"}}>
                                    {this.catalog[game.cursor].blurb}
                                </div>
                                <div>
                                    <span>Price: </span>
                                    <span style={{textDecoration: "underline"}}>
                                        {this.catalog[game.cursor].price} gold
                                    </span>
                                </div>
                            </div>
                        ) : "Thanks for coming!!"}
                    </section>
                </div>
                <div>
                </div>
                {game.gardener.renderGUI()}
            </div>
        )
    }
    update(tick) {
        if(Input.isDown("<escape>")) {
            Input.setUp("<escape>")
            game.state = new FarmingState()
        }
        if(Input.isJustDown("W")
        || Input.isJustDown("<up>")) {
            game.cursor -= 1
            if(game.cursor < 0) {
                game.cursor = 0
            }
        }
        if(Input.isJustDown("S")
        || Input.isJustDown("<down>")) {
            game.cursor += 1
            if(game.cursor > this.catalog.length) {
                game.cursor = this.catalog.length
            }
        }
        if(Input.isJustDown("<space>")
        || Input.isJustDown("<enter>")) {
            Input.setUp("<space>")
            Input.setUp("<enter>")
            if(game.cursor < this.catalog.length) {
                var plant = this.catalog[game.cursor]
                game.gardener.gold -= plant.price
                game.gardener.holding = plant
                game.gardener.animation = "spin"
                game.gardener.animating = 1000
                game.gardener.seed = plant
                game.cursor = 0
                game.state = new FarmingState()
                sounds["store-buy"].play()
            } else {
                game.cursor = 0
                game.state = new FarmingState()
            }
        }
    }
}

if(STAGE == "PRODUCTION") {
    game.state = new TitleState()
} else if(STAGE == "DEVELOPMENT") {
    game.state = new FarmingState()
    music.pause()
}
game.cursor = 0

var renderer = new Renderer(document.getElementById("mount"))

var loop = new Loop(function(tick) {
    game.state.update(tick)
    renderer.render(function() {
        return (
            <div id="frame">
                {game.state.render()}
            </div>
        )
    })
})
