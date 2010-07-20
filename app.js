
require.paths.unshift(__dirname+'/support/express/lib')
require('express')
require('express/plugins')

// express requires root set to work properly
set('root', __dirname)

// make it easy to require
require.paths.unshift(__dirname)

configure(function(){
  use(Logger, {format: "combined"})
  use(MethodOverride) // this wires up _method post param to Express
  use(ContentLength) // correctly sends content length header
  use(Cookie)
  use(Session, { reapEvery: (20).minutes }) 
  use(Flash)
  use(Static)
  enable('helpful 404')
  enable('show exceptions')
})

// the site
require('./code/routes')

run(9001)
