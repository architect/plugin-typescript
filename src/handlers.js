const httpHandlerBody = `import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda'

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  console.log('Event:', event)
  console.log('Context:', context)
  return { statusCode: 200, body: JSON.stringify({ message: 'Hello world!' }) }
}`

const sqsHandlerBody = `import { Context, SQSBatchResponse, SQSEvent } from 'aws-lambda'

export const handler = async (event: SQSEvent, context: Context): Promise<SQSBatchResponse> => {
    console.log('Event:', event)
    console.log('Context:', context)
    return { batchItemFailures: [] }
}`

const snsHandlerBody = `import { Context, SNSEvent } from 'aws-lambda'

export const handler = async (event: SNSEvent, context: Context) => {
    console.log('Event:', event)
    console.log('Context:', context)
}`

const scheduledHandlerBody = `import { Context, ScheduledEvent } from 'aws-lambda'

export const handler = async (event: ScheduledEvent, context: Context) => {
    console.log('Event:', event)
    console.log('Context:', context)
}`

const dynamoDbStreamHandlerBody = `import { Context, DynamoDBBatchResponse, DynamoDBStreamEvent } from 'aws-lambda'

export const handler = async (event: DynamoDBStreamEvent, context: Context): Promise<DynamoDBBatchResponse> => {
    console.log('Event:', event)
    console.log('Context:', context)
    return { batchItemFailures: [] }
}`

const websocketHandlerBody = `import { Context, APIGatewayProxyResultV2, APIGatewayProxyWebsocketEventV2 } from 'aws-lambda'

export const handler = async (event: APIGatewayProxyWebsocketEventV2, context: Context): Promise<APIGatewayProxyResultV2> => {
  console.log('Event:', event)
  console.log('Context:', context)
  return { statusCode: 200 }
}`


const customLambdaHandler = `import { Handler } from 'aws-lambda'

export const handler: Handler = async (event, context) => {
  console.log('Event:', event)
  console.log('Context:', context)
}`

const pragmaHandlerMap = {
  'http': httpHandlerBody,
  'ws': websocketHandlerBody,
  'queues': sqsHandlerBody,
  'events': snsHandlerBody,
  'scheduled': scheduledHandlerBody,
  'table-streams': dynamoDbStreamHandlerBody,
  'custom': customLambdaHandler
}

module.exports = pragmaHandlerMap
