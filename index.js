const readline = require('readline')
const fs = require('fs')

const commands = require('./commands')
const repository = require('./repository')

const rl = readline.createInterface({
  input: fs.createReadStream('commands.txt'),
})

rl.on('line', (line) => {
  console.log(line)

  if (line === 'END') {
    return
  }

  commands.execute(line)
})