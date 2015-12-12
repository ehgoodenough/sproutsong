var raf = require("raf")

function Loop(func) {
    return (function loop(tick) {
        tick = (Date.now() - tick) / 1000
        tick = Math.min(tick, 0.5)
        func(tick)
        raf(loop.bind(this, Date.now()))
    })(Date.now())
}

module.exports = Loop
