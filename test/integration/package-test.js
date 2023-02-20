const test = require('tape')
const inventory = require('@architect/inventory')
const pkg = require('@architect/package')

let arcFile = `
@app
ts-mock

@aws
runtime typescript

@http
get /ok

@plugins
architect/plugin-typescript
  src src
`.trim()


test('Inventory + SAM runtime config', async t => {
  t.plan(4)
  let inv = await inventory({ rawArc: arcFile, deployStage: 'staging' })
  let sam = pkg(inv)
  t.equal(inv.inv.http[0].config.runtimeConfig.baseRuntime, 'nodejs16.x', 'Default Inventory runtime is Node.js 16')
  t.equal(sam.Resources.GetOkHTTPLambda.Properties.Runtime, 'nodejs16.x', 'Default SAM runtime is Node 16')

  arcFile += [ '\n', '@typescript', 'base-runtime nodejs18.x' ].join('\n')
  inv = await inventory({ rawArc: arcFile, deployStage: 'staging' })
  sam = pkg(inv)
  t.equal(inv.inv.http[0].config.runtimeConfig.baseRuntime, 'nodejs18.x', 'Inventory runtime reconfigured to Node.js 18')
  t.equal(sam.Resources.GetOkHTTPLambda.Properties.Runtime, 'nodejs18.x', 'SAM runtime is Node 18')
})
