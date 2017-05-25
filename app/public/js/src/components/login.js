var Login = React.createClass({
  getInitialState: function () {
    return {}
  },
  render: function () {
    console.log('login.js: render()')
    return <div>ODED LEIBA</div>
  }
})

$(document).ready(function () {
  console.log('REACHED login.js')
  // init router
  var clientRouter = new Router();
  Backbone.history.start();
  React.render(React.createElement(Login, {router: clientRouter, settings: {network: network}}), document.getElementById('appContainer'));
});