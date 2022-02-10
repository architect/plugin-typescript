@app
ts-mock

@aws
runtime typescript

@http
get /ok
get /fail

@plugins
architect/plugin-typescript
  src ../../..

@typescript
build foo
sourcemaps production
