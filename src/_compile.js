let { join } = require('path')
let { existsSync, rmSync } = require('fs')
let { build: esbuild } = require('esbuild')
let sourceMapStatement = `require('source-map-support/register');\n//# sourceMappingURL=index.js.map`

function getTsConfig (dir) {
  let path = join(dir, 'tsconfig.json')
  if (existsSync(path)) return path
  return false
}

async function compileProject ({ inventory, stage }) {
  let { inv } = inventory
  let { arc, cwd, build } = inv._project

  let settings = {
    sourcemaps: [ 'testing', 'staging' ],
    // TODO publicSrc?
  }
  if (arc.typescript) {
    arc.typescript.forEach(s => {
      if (Array.isArray(s)) {
        if (s[0] === 'sourcemaps') settings.sourcemaps = [ ...s.slice(1) ]
      }
    })
  }

  let start = Date.now()
  let globalTsConfig = getTsConfig(cwd)
  // It's ok to block Sandbox for this, we can't serve requests until it's done anyway
  rmSync(build, { recursive: true, force: true })

  let ok = true
  console.log(`Compiling TypeScript`)

  async function go (lambda) {
    if (lambda.config.runtime !== 'typescript') return
    try {
      await compileHandler({ cwd, lambda, settings, stage, globalTsConfig })
    }
    catch (err) {
      ok = false
      console.log(`esbuild error:`, err)
    }
  }
  let compiles = Object.values(inv.lambdasBySrcDir).map(go)
  await Promise.allSettled(compiles)
  if (ok) console.log(`Compiled project in ${(Date.now() - start) / 1000}s`)
}

async function compileHandler ({ cwd, lambda, settings, stage, globalTsConfig }) {
  let { build, src, handlerFile } = lambda
  let options = {
    entryPoints: [ join(src, 'index.ts') ],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    outfile: handlerFile,
  }
  if (settings.sourcemaps.includes(stage)) {
    options.sourcemap = 'external'
    options.banner = { js: sourceMapStatement }
    if (stage !== 'testing') {
      await esbuild({
        entryPoints: [ join(cwd, 'node_modules', 'source-map-support', 'register') ],
        bundle: true,
        platform: 'node',
        format: 'cjs',
        outdir: join(build, 'node_modules', 'source-map-support'),
      })
    }
  }

  let localConfig = getTsConfig(src)
  /**/ if (localConfig) options.tsConfig = localConfig
  else if (globalTsConfig) options.tsconfig = globalTsConfig

  await esbuild(options)
}

module.exports = {
  compileHandler,
  compileProject,
  getTsConfig,
}
