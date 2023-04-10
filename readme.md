<p align="center">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://github.com/architect/assets.arc.codes/raw/main/public/architect-logo-light-500b%402x.png">
  <img alt="Architect Logo" width="500px" src="https://github.com/architect/assets.arc.codes/raw/main/public/architect-logo-500b%402x.png">
</picture>
</p>

## [`@architect/plugin-typescript`](https://www.npmjs.com/package/@architect/plugin-typescript)

> TypeScript support and workflow integration for Architect

[![GitHub CI status](https://github.com/architect/plugin-typescript/workflows/Node%20CI/badge.svg)](https://github.com/architect/plugin-typescript/actions?query=workflow%3A%22Node+CI%22)


## Install

Into your existing Architect project:

```sh
npm i @architect/plugin-typescript --save-dev
```

Add the following to your Architect project manifest (usually `app.arc`):

```arc
@aws
runtime typescript # sets TS as the the default runtime for your entire project

@plugins
architect/plugin-typescript
```

Or, if you'd prefer to add a single TS Lambda to start, forego the above `runtime typescript` setting in your project manifest, and add the following to a single Lambda:

```arc
# src/http/get-index/config.arc
@aws
runtime typescript
```


## Usage

Now, simply author and port Lambdas in the `src` tree with `index.ts` handlers. For example:

```ts
// src/http/get-index/index.ts
import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda'

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  console.log(`Event:`, event)
  console.log(`Context:`, context)
  return { message: 'hello world' }
}
```

The above function will be automatically transpiled by Architect to `./.build/http/get-index.js`. (The destination build directory is configurable, [see below](#configuration).)

When working locally, Sandbox automatically detects changes to your TypeScript handlers and re-transpiles them for you.


## Configuration

### `tsconfig.json`

By default, Architect TypeScript will pass your `tsconfig.json` along to the transpiler,[`esbuild`](https://esbuild.github.io/)[^1].

If you have a unique `tsconfig.json` file for a single Lambda (e.g. `src/http/get-index/tsconfig.json`), that will be given priority over your project-level TSConfig in the root of your project.


### Project manifest settings

The following higher-level settings are also available in your Architect project manifest with the `@typescript` settings pragma:
- `build` - customize the build directory; defaults to `.build`
  - Note: make sure you add this directory to your `.gitignore`
- `sourcemaps` - enable sourcemaps for Architect environments; defaults to `testing` + `staging`
  - List of `testing`, `staging`, and/or `production` environment in which to add sourcemaps, or disable all sourcemaps with `false`
  - We strongly advise you do not add sourcemaps to your `production` environment as it may have a meaningful impact on end-user performance and coldstart time
- `esbuild-config` - add arbitrary [esbuild configuration](https://esbuild.github.io/api/) options
  - Value is a relative path to a CJS file that exports an object of esbuild options; these options will be passed to the build
  - Any options that conflict with this plugin's defaults will be ignored
- `base-runtime` - set a different base Node.js version; defaults to `nodejs16.x`
  - See [the list of Lambda-supported Node runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html)

Example:

```arc
@typescript
# Build into `./dist`
build dist

# Disable sourcemaps in `staging`, but add them to `production`; you probably shouldn't actually do this though
sourcemaps testing production

# Add esbuild plugins
esbuild-config esbuild-config.js

# Set the Lambda base runtime to Node.js 18
base-runtime nodejs18.x
```


## Caveats

Architect TypeScript, which uses [`esbuild`](https://esbuild.github.io/), bundles to CommonJS to avoid issues surrounding [transpiling to ESM with second-order dynamic requires](https://github.com/evanw/esbuild/issues/1921). However, due to ongoing [issues surrounding top-level await in esbuild, TypeScript, V8, etc.](https://github.com/evanw/esbuild/issues/253), top-level await is not yet supported.

If you need top-level await, we suggest authoring in plain JavaScript for the time being.


[^1]: Head here for more information about [how `esbuild` makes use of TSConfig](https://esbuild.github.io/api/#tsconfig)
