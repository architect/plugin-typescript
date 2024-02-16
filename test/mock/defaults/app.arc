@app
ts-mock

@aws
runtime typescript

@http
get /ok
get /fail
get /new

@plugins
architect/plugin-typescript
  src ../../..

@tables
table-stream-new
  pk *String

@queues
queue-new

@events
event-new

@tables-streams
table-stream-new

@scheduled
scheduled-new rate(1 day)