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


test('SAM runtime', async t => {
  let inv = await inventory({ rawArc: arcFile, deployStage: 'staging' })
  let sam = pkg(inv)
  t.equal(sam.Resources.GetOkHTTPLambda.Properties.Runtime, 'nodejs14.x', 'Default runtime is Node 14')

  arcFile += [ '\n', '@typescript', 'base-runtime nodejs16.x' ].join('\n')
  inv = await inventory({ rawArc: arcFile, deployStage: 'staging' })
  sam = pkg(inv)
  t.equal(sam.Resources.GetOkHTTPLambda.Properties.Runtime, 'nodejs16.x', 'Runtime can be changed to Node 16')
})
