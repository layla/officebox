var app = require('app');
var BrowserWindow = require('browser-window');


app.on('ready', function() {
  var win = new BrowserWindow({
    width: 800,
    height: 600,
    show: false
  });

  win.toggleDevTools();

  win.loadUrl('file://' + __dirname + '/dist/index.html');
  win.show();
});
