var vkey = require("vkey")

class Event {
    constructor(protoevent) {
        this.type = protoevent.type
        this.key = protoevent.key
    }
    is(type, key) {
        return this.type == type
            && this.key == key
    }
}

var Input = {
    isDown: function(key) {
        if(this.poll[key] == undefined) {
            this.poll[key] = -1
        }
        return this.poll[key] >= 0
    },
    isJustDown: function(key) {
        if(this.poll[key] == undefined) {
            this.poll[key] = -1
        }
        if(this.poll[key] == 0) {
            this.poll[key] += 1
            return true
        } else {
            return false
        }
    },
    setDown: function(key) {
        this.poll[key] = 0
    },
    isUp: function(key) {
        if(this.poll[key] == undefined) {
            this.poll[key] = -1
        }
        return this.poll[key] <= 0
    },
    isJustUp: function(key) {
        if(this.poll[key] == undefined) {
            this.poll[key] = -1
        }
        if(this.poll[key] == -1) {
            this.poll[key] -= 1
            return true
        } else {
            return false
        }
    },
    setUp: function(key) {
        this.poll[key] = -1
    },
    addDown: function(key) {
        this.queue.push(new Event({
            type: "press", key: key
        }))
    },
    addUp: function(key) {
        this.queue.push(new Event({
            type: "release", key: key
        }))
    },
    getQueue: function(key) {
        var queue = this.queue
        this.queue = new Array()
        return queue
    },
    poll: new Object(),
    queue: new Array(),
}

document.addEventListener("keydown", function(event) {
    Input.addDown(vkey[event.keyCode])
    if(Input.isUp(vkey[event.keyCode])) {
        Input.setDown(vkey[event.keyCode])
    }
})

document.addEventListener("keyup", function(event) {
    Input.addUp(vkey[event.keyCode])
    Input.setUp(vkey[event.keyCode])
})

class Keyboard {
    constructor(key) {
        this.key = key
    }
    isDown() {
        return Input.isDown(this.key)
    }
    isJustDown() {
        return Input.isJustDown(this.key)
    }
    isUp() {
        return Input.isUp(this.key)
    }
    isJustUp() {
        return Input.isJustUp(this.key)
    }
}

module.exports = Input
module.exports.Keyboard = Keyboard
