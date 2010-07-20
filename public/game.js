// quick demo
// you can easily cheat but that's a feature :)
jQuery(function(){

  var waiting
    , myChar
  function newgame(){
    $("#entername").show()
    $("#entername form").submit(function(){
      if (waiting) return false
      var name = $("#uname")
        , val = $.trim( name.val() )
      if (!val) return false
      waiting = true
      $("#entername form button").replaceWith("<img src='/public/loading.gif'>")
      $.ajax(
      { url: "/available"
      , type: "post"
      , dataType: "json"
      , data: { name: val }
      , error: function(){ 
          waiting = false
          alert("Whooops!!")
        }
      , success: function(data){
          waiting = false
          $("#entername").hide()
          myChar = data.me
          opChar = data.op
          init()
          $("#msg").append("<p>starting game! You are " + data.me +"</p>") 
        }
      })
      return false
    })
  }

  function init(){
    $("#board table").delegate("td", "click", function(){
      var cell = $(this)
      if (cell.text().length) return false
      cell.text(myChar)
      $.ajax(
      { url: "/nextmove"
      , type: "post"
      , data: { cell: this.className }
      , error: function(){
          alert("Whooops! Please try your move again.")
          cell.text("")
        }
      })
      detectWinner()
    })

    ;(function poll(){
      $.get("/nextmove", function(cell){
        if (cell) 
          $("td." + cell).text(opChar)
        if (!detectWinner())
          poll()
      })    
    })()
  }


  var map = 
  [ [ $("td.c1"), $("td.c2"), $("td.c3") ]  
  , [ $("td.c4"), $("td.c5"), $("td.c6") ]  
  , [ $("td.c7"), $("td.c8"), $("td.c9") ]  
  ]
  function detectWinner(){
    return check(map[0][0], map[0][1], map[0][2]) ||
           check(map[1][0], map[1][1], map[1][2]) ||
           check(map[2][0], map[2][1], map[2][2]) ||
           check(map[0][0], map[1][0], map[2][0]) ||
           check(map[0][1], map[1][1], map[2][1]) ||
           check(map[0][2], map[1][2], map[2][2]) ||
           check(map[0][0], map[1][1], map[2][2]) ||
           check(map[0][2], map[1][1], map[2][0]) || 
           checkStalemate()
  }
  function checkStalemate(){
    if (map[0][0].text().length &&
        map[0][1].text().length &&
        map[0][2].text().length &&
        map[1][0].text().length &&
        map[1][1].text().length &&
        map[1][2].text().length &&
        map[2][0].text().length &&
        map[2][1].text().length &&
        map[2][2].text().length ){
      $("#board-inner")
        .removeClass("winner loser stalemate")
        .addClass( "stalemate" )
      $("#board table").undelegate("td", "click")
      askReplay()
      return false
    }
  }
  function check(a, b, c){
    var at = a.text()
      , bt = b.text()
      , ct = c.text()
    if (at == bt && bt == ct & at.length & bt.length & ct.length){
      $(a).add(b).add(c).addClass("match")
      $("#board-inner")
        .removeClass("winner loser stalemate")
        .addClass( a.text() == myChar ? "winner" : "loser" )
      $("#board table").undelegate("td", "click")
      askReplay()
      return true
    }
    return false
  }
  function askReplay(){
    setTimeout(function(){
      $("#replay").fadeIn(600)
    }, 4000)
  }

  newgame()
})
