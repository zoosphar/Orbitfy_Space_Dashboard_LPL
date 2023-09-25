import json
import boto3
from botocore.exceptions import ClientError

dynamodb = boto3.client('dynamodb')
websocket_client = boto3.client('apigatewaymanagementapi', endpoint_url='https://9p8w3t6vr7.execute-api.us-east-1.amazonaws.com/dev/')
s3 = boto3.client('s3')
def is_json_file(record):
    file_key = record['s3']['object']['key']
    return file_key.lower().endswith('.json')
    
def read_json_file(s3_bucket, s3_key):
    try:
        response = s3.get_object(Bucket=s3_bucket, Key=s3_key)
        json_data = response['Body'].read().decode('utf-8')
        return json.loads(json_data)
    except ClientError as e:
        print(f"Error reading JSON file: {e}")
        return None

def lambda_handler(event, context):
    
    # lambda is triggered by Websocket 
    if 'requestContext' in event and 'connectionId' in event['requestContext']:
        connectionId = event['requestContext']['connectionId']
        store_connection_id(connectionId)
        return {
                'statusCode': 200,
                'body': 'Cononecton Established & Stored ConnectionId'
            }
        
    # lambda is triggered by S3 Bucket Upload 
    elif 'Records' in event and is_json_file(event['Records'][0]):
        bucket_name = event['Records'][0]['s3']['bucket']['name']
        file_key = event['Records'][0]['s3']['object']['key']
        active_connections = get_active_connections('ssat-ws-connections-dev')
        json_data = read_json_file(bucket_name, file_key)
        if json_data is not None:
            folder_name='output/'
            original_image_key = json_data.get('originalImage')
            overlay_image_key = json_data.get('overlayImage')

            # Sign the URLs
            signed_original_url = s3.generate_presigned_url('get_object', Params={'Bucket': bucket_name, 'Key': folder_name + original_image_key})
            signed_overlay_url = s3.generate_presigned_url('get_object', Params={'Bucket': bucket_name, 'Key': folder_name + overlay_image_key})
            
            # Proceed with broadcasting the signed URLs to WebSocket connections
            message = {
                'type': 'UPLOAD_IMAGE',
                'original': signed_original_url,
                'overlay': signed_overlay_url,
                'metadata': json_data
            }

            try:
                for connection_id in active_connections:
                    # Send the broadcast message to each WebSocket connection using the API Gateway Management API
                    websocket_client.post_to_connection(
                    ConnectionId=connection_id['S'],
                        Data=json.dumps({'message': message}).encode('utf-8')
                    )
                return {
                    'statusCode': 200,
                    'body': 'Signed URLs sent successfully.'
                }
            except Exception as e:
                return {
                    'statusCode': 500,
                    'body': str(e)
                }
        
        else:
            return {
                'statusCode': 200,
                'body': 'Non-JSON file dropped. No action taken.'
            }
        
        
    
def store_connection_id(connection_id):
    table_name = 'ssat-ws-connections-dev'
    item = {'wsID': {'S': connection_id}}

    response = dynamodb.put_item(TableName=table_name, Item=item)
    print('Stored connection ID:', connection_id)

    return response
    
    
def get_active_connections(connection_table_name):
    response = dynamodb.scan(TableName=connection_table_name)
    return [item['wsId'] for item in response['Items']]
