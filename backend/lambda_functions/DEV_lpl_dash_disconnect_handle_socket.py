import json
import boto3

dynamodb = boto3.resource('dynamodb')

def lambda_handler(event, context):
    print('disconnecting websocket: ', event)
    table_name = 'ssat-ws-connections-dev'
    table = dynamodb.Table(table_name)
    disconnectionId = event['requestContext']['connectionId']
    table.delete_item(Key={'wsID': disconnectionId})
    return {
        'statusCode': 200,
        'body': 'Client Disconnected, Removed Id from DynamoDB'
    }