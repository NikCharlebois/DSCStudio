let React = require("react");
let ReactDOM = require("react-dom");

var AthenaApp = require("./components/AthenaApp.react");

ReactDOM.render(
  React.createElement(AthenaApp, null, null),
  document.getElementById("athenaapp")
);
