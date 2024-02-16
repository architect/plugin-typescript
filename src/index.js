let {
  compileProject,
  compileHandler,
  getTsConfig,
} = require('./_compile')

let {
  dynamoDbStreamHandlerBody,
  httpHandlerBody,
  sqsHandlerBody,
  snsHandlerBody,
  scheduledHandlerBody,
  websocketHandlerBody
} = require('./handlers')

module.exports = {
  set: {
    runtimes: function ({ inventory }) {
      let { arc } = inventory.inv._project
      let build = '.build'
      let baseRuntime = 'nodejs20.x'
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
  create: {
    handlers: ({ lambda: { pragma } }) => {
      let body
      switch (pragma) {
      case 'http':
        body = httpHandlerBody
        break
      case 'queues':
        body = sqsHandlerBody
        break
      case 'events':
        body = snsHandlerBody
        break
      case 'scheduled':
        body = scheduledHandlerBody
        break
      case 'tables-streams':
        body = dynamoDbStreamHandlerBody
        break
      case 'ws':
        body = websocketHandlerBody
        break
      default:
        throw Error(`Unknown lambda type: ${pragma}`)
      }
      return { filename: 'index.ts', body }
    }
  },
  deploy: {
    // TODO: add support for custom TS check commands (e.g. `tsc -p .`)?
    start: compileProject
  },
  sandbox: {
    start: compileProject,
    watcher: async function (params) {
      let { filename, /* event, */ inventory } = params
      if (filename.endsWith('.ts') || filename.endsWith('.tsx')) {
        let { lambdasBySrcDir, shared, views } = inventory.inv

        // Second pass filter by shared dirs
        if (filename.startsWith(shared?.src) ||
            filename.startsWith(views?.src)) {
          await compileProject(params)
          return
        }

        // Second pass filter by Lambda dir
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
