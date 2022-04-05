let { readFileSync } = require('fs')
let { resolve } = require('path')
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
      let { cwd } = inventory.inv._project
      let globalTsConfig = getTsConfig(cwd)
      let tsCompilerOptions = JSON.parse(readFileSync(globalTsConfig)).compilerOptions
      // It's possible for the paths alias to include non TS/TSX files.
      if (tsCompilerOptions) {
        let recompileProject = false
        let tsPaths = tsCompilerOptions.paths || {}
        for (const [_, paths] of Object.entries(tsPaths)) {
          paths.map((p) => {
            const aliasPath = resolve(cwd, tsCompilerOptions.baseUrl, p).replace(/(\/|\\)?\*$/, '')
            if (filename.startsWith(aliasPath)) {
              recompileProject = true
            }
          })
        }

        if (recompileProject) {
          compileProject({ inventory })
          return
        }
      }

      if (filename.endsWith('.ts') || filename.endsWith('.tsx')) {
        let { lambdasBySrcDir } = inventory.inv
        let lambda = Object.values(lambdasBySrcDir).find(({ src }) => filename.startsWith(src))
        if (!lambda) return

        let start = Date.now()
        let { name, pragma } = lambda
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
