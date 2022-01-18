let { compileProject, compileHandler, getTsConfig } = require('./_compile')

async function start ({ inventory }) {
  await compileProject({ inventory, sourcemap: true })
}

async function watcher ({ filename, /* event, */ inventory }) {
  if (filename.endsWith('.ts')) {
    // Second pass filter
    let { lambdasBySrcDir } = inventory.inv
    let lambda = Object.values(lambdasBySrcDir).find(({ src }) => filename.startsWith(src))
    if (!lambda) return

    let start = Date.now()
    let { name, pragma } = lambda
    let { cwd } = inventory.inv._project
    let globalTsConfig = getTsConfig(cwd)

    console.log(`Recompiling handler: @${pragma} ${name}`)
    try {
      await compileHandler({ lambda, sourcemap: true, globalTsConfig })
      console.log(`Compiled in ${(Date.now() - start) / 1000}s\n`)
    }
    catch (err) {
      console.log(`esbuild error:`, err)
    }
  }
}

module.exports = { start, watcher }
