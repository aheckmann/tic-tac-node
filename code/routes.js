
var sys = require('sys')
  , log = function(what){
      sys.puts(sys.inspect(what))
    }


//get("/public/*", function(){})


get("/", function(){
  log(this.session)  
  log(players)
  this.render("home.html.haml")
})



var players = {}
  , chars = ["X","O"]
  , opps = {}
  , uid = 0
  , ready 

post("/available", function(){
  // when two people are available start the game
  if (ready && ready.session && ready.session.id == this.session.id){
    log("still waiting...")
    ready = this
    return
  }

  this.session.name = this.param('uname')

  if (ready){
    log("starting a game...")
    opps[this.session.id] = ready.session.id
    opps[ready.session.id] = this.session.id
    players[this.session.id] = { req: this, moves: [] } 
    players[ready.session.id] = { req: ready, moves: [] }
    ;[this, ready].forEach(function(player, i){
      player.contentType("json")
      player.respond(200, JSON.stringify({ me: chars[i], op: chars[i===0 ? 1 : 0]}))
    })
    ready = null
    return
  }

  ready = this
})

// post your moves here
post("/nextmove", function(){
  var cell = this.param('cell')
  if (!cell) return this.respond(204)

  log(cell)
  var opp = players[opps[this.session.id]]
  if (opp)
    opp.req.respond(200, cell) 
  else 
    players[this.session.id].moves.push(cell) 
  this.respond(204)
})

// waiting for the next move
get("/nextmove", function(){
  players[this.session.id].req = this
  // check for new move
  var opp = players[opps[this.session.id]]
  if (opp.moves.length)
    return this.respond(200, opp.moves[0])
})

