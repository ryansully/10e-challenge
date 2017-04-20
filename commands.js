const repository = require('./repository')
const installed = require('./installed')

function execute(line) {
  if (!line) { return }
  const [ command, ...args ] = line.split(/ +/)
  const [ package, ...dependencies ] = args

  switch(command) {
    case 'DEPEND':
      createDependency(package, dependencies)
      break
    case 'LIST':
      listPackages()
      break
    case 'INSTALL':
      // ignore previously installed package
      if (installed.hasOwnProperty(package)) {
        console.log(' ', package, 'is already installed.')
        return
      }

      installPackage(package)
      break
    case 'REMOVE':
      // ignore uninstalled package
      if (!installed.hasOwnProperty(package)) {
        console.log(' ', package, 'is not installed.')
        return
      }

      removePackage(package)
      break
    default:
      throw Error('Command not found:', command)
  }
}

function createDependency(package, dependencies) {
  repository[package] = {
    name: package,
    dependencies,
  }
}

function listPackages() {
  // the listed packages in the example didn't have any specific order that I
  // could tell, so just logging the hash keys
  Object.keys(installed).forEach((key) => {
    console.log(' ', key)
  })
}

function installPackage(package) {
  // get package dependencies
  const dependencies = repository.hasOwnProperty(package)
    ? repository[package].dependencies : []

  // recursively install dependencies
  dependencies.forEach((dependency) => {
    if (!installed.hasOwnProperty(dependency)) {
      installPackage(dependency)
    }
  })

  // install package
  console.log('  Installing', package)
  installed[package] = {name: package}
}

function removePackage(package, recursing) {
  // bail if package is an installed dependency
  for (const p in installed) {
    const dependencies = repository[p] ? repository[p].dependencies : []
    if (dependencies.length && ~dependencies.indexOf(package)) {
      // only log to console for direct remove command
      if (!recursing) {
        console.log(' ', package, 'is still needed.')
      }
      return
    }
  }

  // remove package
  console.log('  Removing', package)
  delete installed[package]

  // remove only direct orphans
  if (!recursing) {
    const dependencies = repository[package]
      ? repository[package].dependencies : []
    dependencies.forEach((dependency) => {
      removePackage(dependency, true)
    })
  }
}

module.exports = {
  execute,
};