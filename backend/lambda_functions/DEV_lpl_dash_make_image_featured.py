import json
import boto3
from botocore.exceptions import ClientError
import time

dynamodb = boto3.resource('dynamodb')
table_name = 'DEV_lpl_dash_featured_images_keys'
removed_images_table_name = 'DEV_lpl_dash_removed_images_keys'
# Set the maximum number of items allowed in the table
max_items = 5

def lambda_handler(event, context):
    http_method = event['httpMethod']
    removeImage = event['removeImage'] # removeImage is a bool | True or False
    file_key = event['fileKey']
    
    # if the request is to remove image -> call mark_image_removed() and terminate.
    if removeImage == True:
        mark_image_removed(file_key)
        return {
                'statusCode': 200,
                'body': json.dumps('Removed Image FileKey saved successfully'),
                'headers': {
                'Content-Type': 'application/json',  # Content-Type header
                }
            }
    
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
        if http_method == "POST":
            # Check the number of items in the DynamoDB table
            response = table.scan(Select='COUNT')
            item_count = response.get('Count', 0)
    
            # If the limit is reached, remove the oldest item before inserting the new one
            if item_count >= max_items:
                oldest_item = get_oldest_item(table)
                if oldest_item:
                    table.delete_item(Key={'fileKey': oldest_item['fileKey']})
    
            # Save the new file-key in the table with a timestamp
            current_timestamp = int(time.time())
            table.put_item(Item={'fileKey': file_key, 'timestamp': current_timestamp})
    
            return {
                'statusCode': 200,
                'body': json.dumps('FileKey saved successfully'),
                'headers': {
                'Content-Type': 'application/json',  # Content-Type header
                }
            }
        elif http_method == "DELETE":
            try:
                # Delete the record from DynamoDB
                response = table.delete_item(
                    Key={'fileKey': file_key}  # Assuming 'file_key' is the primary key of your table
                )
                # Return success response
                return {
                    'statusCode': 200,
                    'body': json.dumps({'message': 'Record deleted successfully'}),
                    'headers': {
                        'Content-Type': 'application/json',  # Content-Type header
                    }
                }
            except Exception as e:
                # Handle errors
                print('error is: ', e)
                return {
                    'statusCode': 500,
                    'body': json.dumps({'error': 'Failed to delete record'}),
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

def get_oldest_item(table):
    try:
        response = table.scan(Select='ALL_ATTRIBUTES', ScanFilter={'fileKey': {'AttributeValueList': [], 'ComparisonOperator': 'NOT_NULL'}})
        items = response.get('Items')
        if items:
            return min(items, key=lambda x: x['timestamp'])
        return None
    except ClientError as e:
        print(f'Error getting the oldest item: {e}')
        return None

def mark_image_removed(file_key):
    try:
        removed_images_table = dynamodb.Table(removed_images_table_name)
        removed_images_table.put_item(Item={'fileKey': file_key})
        return {
                'statusCode': 200,
                'body': json.dumps('Removed Image FileKey saved successfully'),
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