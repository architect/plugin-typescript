let {
  compileProject,
  compileHandler,
  getTsConfig,
} = require('./_compile')

module.exports = {
  set: {
    runtimes: function ({ inventory }) {
      let { arc } = inventory.inv._project
      let build = '.build'
      let baseRuntime = 'nodejs14.x'
      if (arc.typescript) {
        let settings = Object.fromEntries(arc.typescript)
        if (settings.build && typeof settings.build === 'string') {
          build = settings.build
        }
        if (settings['base-runtime'] && typeof settings['base-runtime'] === 'string') {
          baseRuntime = settings['base-runtime']
        }
      }
      return {
        name: 'typescript',
        type: 'transpiled',
        build,
        baseRuntime,
      }
    }
  },
  deploy: {
    // TODO: add support for custom TS check commands (e.g. `tsc -p .`)?
    start: compileProject
  },
  sandbox: {
    start: compileProject,
    watcher: async function ({ filename, /* event, */ inventory }) {
      if (filename.endsWith('.ts') || filename.endsWith('.tsx')) {
        // Second pass filter by Lambda dir
        let { lambdasBySrcDir } = inventory.inv
        let lambda = Object.values(lambdasBySrcDir).find(({ src }) => filename.startsWith(src))

        if (!lambda) { return }

        let start = Date.now()
        let { name, pragma } = lambda
        let { cwd } = inventory.inv._project
        let globalTsConfig = getTsConfig(cwd)
        console.log(`Recompiling handler: @${pragma} ${name}`)
        try {
          await compileHandler({ inventory, lambda, globalTsConfig })
          console.log(`Compiled in ${(Date.now() - start) / 1000}s\n`)
        }
        catch (err) {
          console.log('esbuild error:', err)
        }
      }
    }
  },
}
