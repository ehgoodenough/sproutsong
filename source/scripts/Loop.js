var raf = require("raf")

function Loop(func) {
    return (function loop(tick) {
        tick = (Date.now() - tick)
        tick = Math.min(tick, 500)
        func(tick)
        raf(loop.bind(this, Date.now()))
    })(Date.now())
}

module.exports = Loop
