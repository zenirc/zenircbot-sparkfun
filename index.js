var ZenIRCBot = require('zenircbot-api').ZenIRCBot
  , zen = new ZenIRCBot()
  , request = require('request')

zen.register_commands(
  "sparkfun.js",
  [{
    name: "/\\w\\w\\w-\\d\\d\\d\\d\\d/",
    description: "Looks up the part number on SparkFun"
  }]
)

function chop(str) {
  new_str = str.split('.')
  return new_str[0] + '.' + new_str[1].slice(0, 2)
}

var filtered = zen.filter({version: 1, type: 'privmsg'})
filtered.on('data', function(msg){
  var part = /\w\w\w-(\d\d\d\d\d)/i.exec(msg.data.message)
  if (part) {
    var number = parseInt(part[1], 10)
    var url = 'https://www.sparkfun.com/products/' + number.toString()
    request({
      url: url + '.json'
    }, function process(err, res, body) {
      if (err || res.statusCode !== 200) {
        return
      }
      var product = JSON.parse(body)
      if (part[0].toUpperCase() === product.sku.toUpperCase()) {
        var string = product.sku
        string += ': '
        string += product.name
        string += ' | $'
        string += chop(product.price)
        string += ' ('
        string += product.quantity
        string += ' left) | '
        string += url
        zen.send_privmsg(msg.data.channel, string)
      }
    })
  }
})
