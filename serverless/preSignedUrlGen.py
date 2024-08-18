import json
import boto3
import os

s3 = boto3.client('s3')

def lambda_handler(event, context):
    bucket_name = os.environ.get('BUCKET_NAME')
    object_name = event['queryStringParameters']['filename']
    
    presigned_url = s3.generate_presigned_url(
        'put_object',
        Params={
            'Bucket': bucket_name,
            'Key': object_name,
            'ContentType': 'image/jpeg'  # 업로드할 파일의 MIME 타입
        },
        ExpiresIn=3600
    )
    
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        'body': json.dumps({'url': presigned_url})
    }
