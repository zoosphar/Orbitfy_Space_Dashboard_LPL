import json
import boto3
from botocore.exceptions import ClientError
import time

dynamodb = boto3.resource('dynamodb')
table_name = 'DEV_lpl_dash_image_metadata'

def lambda_handler(event, context):
    file_key = event['imageName']
    tag_name = event['tagName']
    model_name = event['modelName']
    
    print(file_key, tag_name, model_name)
    
    try:
        if not file_key:
            return {
                'statusCode': 400,
                'body': json.dumps('Missing fileKey in the request body'),
                'headers': {
                    'Content-Type': 'application/json',  # Content-Type header
                },
            }
        table = dynamodb.Table(table_name)
        # Save the new file-key in the table with a timestamp
        current_timestamp = int(time.time())
        table.put_item(Item={'fileKey': file_key, 'timestamp': current_timestamp, 'tagName': tag_name, 'modelName': model_name})
        return {
            'statusCode': 200,
            'body': json.dumps('FileKey saved successfully'),
            'headers': {
            'Content-Type': 'application/json',  # Content-Type header
            }
        }
    except Exception as e:
        print('error occurred: ', e)
        return {
            'statusCode': 500,
            'body': json.dumps(str(e)),
            'headers': {
            'Content-Type': 'application/json',  # Content-Type header
            },
        }