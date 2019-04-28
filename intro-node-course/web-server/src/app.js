const path = require('path')
const express = require('express')

const app = express()

const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

app.get('/help', (req, res) => {
  res.send('Help Page')
})

app.get('/about', (req, res) => {
  res.send('<h1>About</h1>')
})

app.get('/weather', (req, res) => {
  res.send({
    forecast: 'It is currently 50 degrees out',
    localion: 'New York',
  })
})

// start server and listen on a port
app.listen(3000, () => {
  console.log('Server is up on port 3000')
})
