let { join } = require('path')
let { existsSync, readFileSync, rmSync } = require('fs')
let test = require('tape')
let { get } = require('tiny-json-http')
let sandbox = require('@architect/sandbox')

let port = 6666
let mock = join(process.cwd(), 'test', 'mock')
let cwd, build, newHandler
let url = path => `http://localhost:${port}/${path}`
let banner = /lolidk/

function reset () {
  rmSync(newHandler, { recursive: true, force: true })
  rmSync(build, { recursive: true, force: true })
}

/**
 * Ideally these tests would also exercise the watcher method
 * However, running / terminating the Sandbox in a child process is a bit onerous so let's consider it a TODO
 */
test('Start Sandbox (default project)', async t => {
  t.plan(1)
  cwd = join(mock, 'defaults')
  newHandler = join(cwd, 'src', 'http', 'get-new')
  build = join(cwd, '.build')
  reset()
  await sandbox.start({ cwd, port, quiet: true })
  t.pass('Started Sandbox')
})

test('Handler transpiled', async t => {
  t.plan(4)
  let result = await get({ url: url('ok') })
  t.deepEqual(result.body, { ok: true }, 'Transpiled handler returned correct body')
  let handlerPath = join(build, 'http', 'get-ok', 'index.js')
  let sourcemap = handlerPath + '.map'
  t.ok(existsSync(sourcemap), 'Found sourcemap file')
  let handler = readFileSync(handlerPath).toString()
  let lines = handler.split('\n').filter(Boolean).length
  t.ok(lines > 1, `Handler is not minified: ${lines} lines`)
  t.doesNotMatch(handler, banner, 'Handler does not have custom banner')
})

test('Sourcemap support', async t => {
  t.plan(4)
  try {
    await get({ url: url('fail') })
    t.fail('Should have failed here')
  }
  catch (err) {
    let line = join(cwd, 'src', 'http', 'get-fail', 'index.ts') + ':2:9'
    t.ok(err.body.includes(line), 'Got line number from sourcemap')
    let handlerPath = join(build, 'http', 'get-fail', 'index.js')
    let sourcemap = handlerPath + '.map'
    t.ok(existsSync(sourcemap), 'Found sourcemap file')
    let handler = readFileSync(handlerPath).toString()
    let lines = handler.split('\n').filter(Boolean).length
    t.ok(lines > 1, `Handler is not minified: ${lines} lines`)
    t.doesNotMatch(handler, banner, 'Handler does not have custom banner')
  }
})

test('Handler created', async t => {
  t.plan(1)
  let result = await get({ url: url('new') })
  t.deepEqual(result.body, { message: 'Hello world!' }, 'Freshly created and transpiled handler returned correct body')
})

test('Shut down Sandbox', async t => {
  t.plan(1)
  await sandbox.end()
  reset()
  t.pass('Shut down Sandbox')
})

test('Start Sandbox (customized project)', async t => {
  t.plan(1)
  cwd = join(mock, 'customized')
  build = join(cwd, 'foo')
  reset()
  await sandbox.start({ cwd, port, quiet: true })
  t.pass('Started Sandbox')
})

test('Handler transpiled minified to custom build dir', async t => {
  t.plan(4)
  let result = await get({ url: url('ok') })
  t.deepEqual(result.body, { ok: true }, 'Transpiled handler returned correct body')
  let handlerPath = join(build, 'http', 'get-ok', 'index.js')
  let sourcemap = handlerPath + '.map'
  t.notOk(existsSync(sourcemap), 'Did not find sourcemap file')
  let handler = readFileSync(handlerPath).toString()
  let lines = handler.split('\n').filter(Boolean).length
  t.equal(lines, 2, `Handler is minified: ${lines} line`)
  t.match(handler, banner, 'Handler has custom banner')
})

test('Sourcemap disabled', async t => {
  t.plan(4)
  try {
    await get({ url: url('fail') })
    t.fail('Should have failed here')
  }
  catch (err) {
    let line = join(cwd, 'foo', 'http', 'get-fail', 'index.js') // Omit line number, that may change with time
    t.ok(err.body.includes(line), 'Got handler error')
    let handlerPath = join(build, 'http', 'get-fail', 'index.js')
    let sourcemap = handlerPath + '.map'
    t.notOk(existsSync(sourcemap), 'Did not find sourcemap file')
    let handler = readFileSync(handlerPath).toString()
    let lines = handler.split('\n').filter(Boolean).length
    t.equal(lines, 2, `Handler is minified: ${lines} line`)
    t.match(handler, banner, 'Handler has custom banner')
  }
})

test('Shut down Sandbox', async t => {
  t.plan(1)
  await sandbox.end()
  reset()
  t.pass('Shut down Sandbox')
})
