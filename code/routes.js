
var sys = require('sys')
  , log = function(what){
      sys.puts(sys.inspect(what))
    }



get("/", function(){
  log(this.session)  
  log(players)
  this.render("home.html.haml")
})


var players = {}
  , chars = ["X","O"]
  , opps = {}
  //, uid = require('express/utils').uid
  , ready = [] 

post("/available", function(){
  // when two people are available start the game
  if (ready.length && ready[0].session && ready[0].session.id == this.session.id){
    log("still waiting...")
    ready = [this]
    return
  }

  if (ready.length){
    var rdy = ready[0]
    ready = [] 
    log("starting a game...")
    opps[this.session.id] = rdy.session.id
    opps[rdy.session.id] = this.session.id
    players[this.session.id] = { req: this, moves: [] } 
    players[rdy.session.id] = { req: rdy, moves: [] }
    ;[this, rdy].forEach(function(player, i){
      player.contentType("json")
      player.respond(200, JSON.stringify({ me: chars[i], op: chars[i===0 ? 1 : 0]}))
    })
    return
  }

  log("ready = [this]")
  ready = [this]
})

// post your moves here
post("/nextmove", function(){
  var cell = this.param('cell')
  if (!cell) return this.respond(204)

  log(this.session.id)
  var opp = players[opps[this.session.id]]
  if (opp)
    opp.req.respond(200, cell) 
  else 
    players[this.session.id].moves.push(cell) 
  this.respond(204)
})

// waiting for the next move
get("/nextmove", function(){
  // check for new move
  var opp = players[opps[this.session.id]]
  if (!opp) return this.respond(200,"GAMEOVER")
  if (opp.moves.length)
    return this.respond(200, opp.moves[0])
  else 
    players[this.session.id].req = this
})

post("/gameover", function(){
  var oppid = opps[this.session.id]
    , opp = players[oppid]
  if (opp && opp.req) opp.req.respond(200, "GAMEOVER")
  delete players[oppid] 
  delete opps[oppid]
  delete players[this.session.id]
  delete opps[this.session.id]
  this.respond(204)
})
