var React = require("react")
var ReactDOM = require("react-dom")

class ReactComponent extends React.Component {
    render(render) {return <div/>}
}

class ReactRenderer {
    constructor(mount) {
        var jsx = <ReactComponent/>
        this.rendering = ReactDOM.render(jsx, mount)
    }
    render(render) {
        this.rendering.render = render || function() {return <div/>}
        this.rendering.forceUpdate()
    }
}

module.exports = ReactRenderer
