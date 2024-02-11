const httpHandlerBody = `import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda'

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  console.log('Event:', event)
  console.log('Context:', context)
  return { message: 'Hello world!' }
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

module.exports = {
  httpHandlerBody,
  sqsHandlerBody,
  snsHandlerBody,
  scheduledHandlerBody,
  dynamoDbStreamHandlerBody,
}
