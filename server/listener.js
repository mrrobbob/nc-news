const app = require('./index.js')

app.listen(8080, (err) => {
  if (err) {
    console.log(err)
  }
  else {
    console.log("Listening on port 8080...")
  }
})