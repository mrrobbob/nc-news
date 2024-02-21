const app = require('./index.js')
const {PORT = 8080} = process.env

app.listen(PORT, (err) => {
  if (err) {
    console.log(err)
  }
  else {
    console.log(`Listening on port ${PORT}...`)
  }
})