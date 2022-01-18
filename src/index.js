let { compileProject, compileHandler, getTsConfig } = require('./_compile')

module.exports = {
  set: {
    runtimes: function ({ inventory }) {
      let { arc } = inventory._project
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
    start: async function ({ inventory }) {
      // if the user supplied deployCmd run it here
      let { _arc } = inventory.inv
      await compileProject({ inventory, stage: _arc.deployStage })
    }
  },
  sandbox: {
    start: async function ({ inventory }) {
      await compileProject({ inventory, stage: 'testing' })
    },
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
          await compileHandler({ lambda, stage: 'testing', globalTsConfig })
          console.log(`Compiled in ${(Date.now() - start) / 1000}s\n`)
        }
        catch (err) {
          console.log(`esbuild error:`, err)
        }
      }
    }
  },
}
