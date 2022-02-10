let { join } = require('path')
let { existsSync, rmSync } = require('fs')
let test = require('tape')
let { get } = require('tiny-json-http')
let sandbox = require('@architect/sandbox')

let port = 6666
let mock = join(process.cwd(), 'test', 'mock')
let cwd, build
let url = path => `http://localhost:${port}/${path}`

function reset () {
  rmSync(build, { recursive: true, force: true })
}

/**
 * Ideally these tests would also exercise the watcher method
 * However, running / terminating the Sandbox in a child process is a bit onerous so let's consider it a TODO
 */
test('Start Sandbox', async t => {
  t.plan(1)
  cwd = join(mock, 'defaults')
  build = join(cwd, '.build')
  reset()
  await sandbox.start({ cwd, port, quiet: true })
  t.pass('Started Sandbox')
})

test('Handler transpiled', async t => {
  t.plan(2)
  let result = await get({ url: url('ok') })
  t.deepEqual(result.body, { ok: true }, 'Transpiled handler returned correct body')
  let sourcemap = join(build, 'http', 'get-ok', 'index.js.map')
  t.ok(existsSync(sourcemap), 'Found sourcemap file')
})

test('Sourcemap support', async t => {
  t.plan(2)
  try {
    await get({ url: url('fail') })
    t.fail('Should have failed here')
  }
  catch (err) {
    let line = join(cwd, 'src', 'http', 'get-fail', 'index.ts') + ':2:9'
    t.ok(err.body.includes(line), 'Got line number from sourcemap')
    let sourcemap = join(build, 'http', 'get-ok', 'index.js.map')
    t.ok(existsSync(sourcemap), 'Found sourcemap file')
  }
})

test('Shut down Sandbox', async t => {
  t.plan(1)
  await sandbox.end()
  reset()
  t.pass('Shut down Sandbox')
})

test('Start Sandbox', async t => {
  t.plan(1)
  cwd = join(mock, 'customized')
  build = join(cwd, 'foo')
  reset()
  await sandbox.start({ cwd, port, quiet: true })
  t.pass('Started Sandbox')
})

test('Handler transpiled to custom build dir', async t => {
  t.plan(2)
  let result = await get({ url: url('ok') })
  t.deepEqual(result.body, { ok: true }, 'Transpiled handler returned correct body')
  let sourcemap = join(build, 'http', 'get-ok', 'index.js.map')
  t.notOk(existsSync(sourcemap), 'Did not find sourcemap file')
})

test('Sourcemap disabled', async t => {
  t.plan(2)
  try {
    await get({ url: url('fail') })
    t.fail('Should have failed here')
  }
  catch (err) {
    let line = join(cwd, 'foo', 'http', 'get-fail', 'index.js') // Omit line number, that may change with time
    t.ok(err.body.includes(line), 'Got handler error')
    let sourcemap = join(build, 'http', 'get-ok', 'index.js.map')
    t.notOk(existsSync(sourcemap), 'Did not find sourcemap file')
  }
})

test('Shut down Sandbox', async t => {
  t.plan(1)
  await sandbox.end()
  reset()
  t.pass('Shut down Sandbox')
})
