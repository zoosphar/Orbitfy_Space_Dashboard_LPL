import json
import boto3
import botocore
import concurrent.futures

s3 = boto3.client('s3') 


def lambda_handler(event, context):
 
    try:
        model_filters = ''
        if 'queryStringParameters' in event:
        # Access the query parameters
            query_params = event['queryStringParameters']
            print('query params: ', query_params)
            # Check if a specific parameter exists
            if 'modelFilters' in query_params:
                model_filters = query_params['modelFilters']
                print('filters are: ', model_filters)
            
        initial_images = get_initial_s3_data(model_filters)
        ml_model_map = get_all_ml_models()
        message = {
            'type': 'INITIAL_IMAGES',
            'recentImages': initial_images['recent_images'],
            'featuredImages': initial_images['featured_images'],
            'mlModelMap': ml_model_map
        }
        
        return {
            'statusCode': 200,
            'headers': {
            'Content-Type': 'application/json',  # Content-Type header
            'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(message)
            }
    except Exception as e:
        print('exception occured: ', e)
        return {
            'statusCode': 500,
            'headers': {
            'Content-Type': 'application/json',  # Content-Type header
            'Access-Control-Allow-Origin': '*'
            },
            'body': str(e)
        }

def get_initial_s3_data(model_filters):
    bucket_name = 'dev-lpl-dash-output-images'
    recent_images_folder_path = 'output/'
    # max_files = 40
    # Retrieve the list of objects in the S3 bucket
    recent_images_response = s3.list_objects_v2(Bucket=bucket_name, Prefix=recent_images_folder_path)
        
    featured_images_keys = get_featured_images_keys_from_dynamodb()
    
    removed_images_keys = get_removed_images_keys_from_dynamodb()
        
    recent_image_url_map = generate_url_mapping(bucket_name, recent_images_response, removed_images_keys, model_filters)
    featured_image_url_map = []
        
    if len(featured_images_keys) != 0:
        recent_images_keys_limit = 10 + len(featured_images_keys)
        featured_image_url_map = [obj for obj in recent_image_url_map if obj["file_key"] in featured_images_keys]
        recent_image_url_map = [obj for obj in recent_image_url_map if obj['file_key'] not in featured_images_keys]
        
    # return a response object for both image types
    return {
        'recent_images': recent_image_url_map,
        'featured_images': featured_image_url_map
    }
    
    
def generate_url_mapping(bucket_name, image_response, removed_images_keys, model_filters):
    total_files = image_response['KeyCount']
    if total_files == 0:
        return []
        
    max_images = 50
    metadata_files = [obj for obj in image_response['Contents'] if obj['Key'].lower().endswith('.json') and obj['Key'].rsplit('_', 1)[0] not in removed_images_keys]
    sorted_metadata_files = sorted(metadata_files, key=lambda x: x['LastModified'], reverse=True)
    sorted_metadata_files = sorted_metadata_files[:max_images] # limit the files to a number

    images_url_map = []
    with concurrent.futures.ThreadPoolExecutor() as executor:
        future_to_metadata = {executor.submit(process_metadata, bucket_name, obj['Key']): obj for obj in sorted_metadata_files}
        for future in concurrent.futures.as_completed(future_to_metadata):
            metadata_obj = future.result()
            if metadata_obj:
                original_key = future_to_metadata[future]['Key'].rsplit('_', 1)[0]
                url_map = {'file_key': original_key}
                
                last_modified = future_to_metadata[future]['LastModified'].isoformat()
                
                metadata_obj['LastModified'] = last_modified
                
                print('model filters: ', model_filters, metadata_obj['metaData'][0]['sectionProperties']['ModelName'])
                # Filter out the images based on model filters
                if model_filters == '' or metadata_obj['metaData'][0]['sectionProperties']['ModelName'] in model_filters:

                    # Extract originalImage and overlayImage URLs from the metadata
                    original_image_key = metadata_obj.get('originalImage')
                    overlay_image_key = metadata_obj.get('overlayImage')
                    mask_image_key = metadata_obj.get('maskImage')
                    
                    cloudfront_distribution_id = 'drtogtypnsmrm'
                    cloudfront_base_url = f'https://{cloudfront_distribution_id}.cloudfront.net'
                    
                    if original_image_key:
                        url_map['original'] = f'{cloudfront_base_url}/{original_image_key}'
                    if overlay_image_key:
                        url_map['overlay'] = f'{cloudfront_base_url}/{overlay_image_key}'
                    if mask_image_key:
                        url_map['mask'] = f'{cloudfront_base_url}/{mask_image_key}'
    
                    # Sign the URLs and add them to the URL map
                    # if original_image_key:
                    #     url_map['original'] = s3.generate_presigned_url('get_object', Params={'Bucket': bucket_name, 'Key': original_image_key})
                    # if overlay_image_key:
                    #     url_map['overlay'] = s3.generate_presigned_url('get_object', Params={'Bucket': bucket_name, 'Key': overlay_image_key})
                    # if mask_image_key:
                    #     url_map['mask'] = s3.generate_presigned_url('get_object', Params={'Bucket': bucket_name, 'Key': mask_image_key})
                   
                    # Add metadata to the URL map
                    url_map['metadata'] = metadata_obj
    
                    images_url_map.append(url_map)

    sorted_images_url_map = sorted(images_url_map, key=lambda x: x['metadata']['LastModified'], reverse=True)
    return sorted_images_url_map

def process_metadata(bucket_name, metadata_key):
    try:
        metadata_file_response = s3.get_object(Bucket=bucket_name, Key=metadata_key)
        metadata_content = metadata_file_response['Body'].read().decode('utf-8')
        metadata_obj = json.loads(metadata_content)
        return metadata_obj
    except Exception as e:
        print(f'Error processing metadata {metadata_key}: {e}')
        return None
        
def get_featured_images_keys_from_dynamodb():
    dynamodb = boto3.resource('dynamodb')
    table_name = 'DEV_lpl_dash_featured_images_keys'
    table = dynamodb.Table(table_name)

    response = table.scan(ProjectionExpression='fileKey')
    featured_images_keys = [item['fileKey'] for item in response['Items']]
    return featured_images_keys

def get_removed_images_keys_from_dynamodb():
    dynamodb = boto3.resource('dynamodb')
    table_name = 'DEV_lpl_dash_removed_images_keys'
    table = dynamodb.Table(table_name)

    response = table.scan(ProjectionExpression='fileKey')
    removed_images_keys = [item['fileKey'] for item in response['Items']]
    return removed_images_keys  
    
def get_all_ml_models():
    dynamodb = boto3.resource('dynamodb')
    table_name = 'DEV_lpl_dash_ml_model_map'
    table = dynamodb.Table(table_name)

    try:
        response = table.scan()
        items = response.get('Items', [])
        return items
    except Exception as e:
        # Handle any exceptions or errors here
        print(f"Error fetching all ML models: {e}")
        return None
    