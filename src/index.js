let { compileProject, compileHandler, getTsConfig } = require('./_compile')

module.exports = {
  set: {
    runtimes: function ({ inventory }) {
      let { arc } = inventory.inv._project
      let build = '.build'
      if (arc.typescript) {
        arc.typescript.forEach(s => {
          if (Array.isArray(s)) {
            if (s[0] === 'build' && typeof s[1] === 'string') build = s[1]
          }
        })
      }
      return {
        name: 'typescript',
        type: 'transpiled',
        build,
        baseRuntime: 'nodejs14.x',
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
        if (!lambda) return

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
          console.log(`esbuild error:`, err)
        }
      }
    }
  },
}
