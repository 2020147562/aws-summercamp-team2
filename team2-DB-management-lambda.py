import boto3
import uuid
import json
from datetime import datetime
from decimal import Decimal

def lambda_handler(event, context):
    try:
        # DynamoDB 클라이언트 생성
        dynamodb = boto3.resource('dynamodb')
        
        # DynamoDB 테이블 이름
        dynamodb_table_name = 'team2-image-metadata-table'
        
        # event로부터 이미지 URL과 메타데이터 추출
        image_s3_url = event.get('image_s3_url')
        metadata = event.get('metadata', {})
        
        if not image_s3_url:
            return {
                'statusCode': 400,
                'body': json.dumps({'message': 'No image URL provided'})
            }
        
        # 위도와 경도를 Decimal로 변환하여 저장
        latitude = metadata.get('latitude')
        longitude = metadata.get('longitude')
        
        if latitude is not None:
            metadata['latitude'] = Decimal(str(latitude))
        if longitude is not None:
            metadata['longitude'] = Decimal(str(longitude))
        
        # 현재 시간
        timestamp = datetime.utcnow().isoformat()
        
        # 고유 ID 생성 (숫자 타입으로)
        report_id = int(uuid.uuid4().int >> 64)  # UUID의 상위 64비트를 사용하여 숫자 생성
        
        # DynamoDB에 저장할 데이터 구성
        item_to_store = {
            'report_id': report_id,  # 숫자(Number) 타입으로 저장
            'image_url': image_s3_url,
            'metadata': convert_float_to_decimal(metadata),  # 메타데이터 변환
            'uploaded_at': timestamp
        }
        
        # CloudWatch 로그에 DynamoDB에 저장할 데이터 출력
        print("Storing the following item in DynamoDB:")
        print(json.dumps(item_to_store, indent=2, default=str))  # default=str를 추가하여 Decimal 객체를 문자열로 변환
        
        # DynamoDB에 메타데이터 저장
        table = dynamodb.Table(dynamodb_table_name)
        table.put_item(Item=item_to_store)
        
        # 성공적인 저장 로그 남기기
        print(f"Successfully stored metadata in DynamoDB with report_id: {report_id}")
        
        # Lambda 클라이언트 생성
        lambda_client = boto3.client('lambda')
        
        # Slack 메시지 전송을 위해 team2-slack-message-lambda 호출
        slack_payload = {
            'report_id': report_id,
            'image_url': image_s3_url,
            'metadata': json.loads(json.dumps(metadata, default=str)),  # Slack에 보낼 데이터를 JSON으로 변환하기 전에 Decimal을 문자열로 변환
            'timestamp': timestamp
        }
        
        # CloudWatch 로그에 Slack에 전송할 데이터 출력
        print("Sending the following payload to Slack Lambda:")
        print(json.dumps(slack_payload, indent=2))
        
        response = lambda_client.invoke(
            FunctionName='team2-slack-message-lambda',  # 실제 Lambda 함수 이름으로 변경
            InvocationType='Event',  # 비동기 호출
            Payload=json.dumps(slack_payload)
        )
        
        # Lambda 호출 결과 로그 남기기
        print(f"Invoked team2-slack-message-lambda with response: {response}")
        
        # 성공적인 응답 반환
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Image metadata stored successfully and Slack notification sent',
                'image_url': image_s3_url
            })
        }
        
    except Exception as e:
        # 에러 발생 시 로그 남기기
        print(f"Error occurred: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'An error occurred', 'error': str(e)})
        }

def convert_float_to_decimal(data):
    """
    Recursively convert all floats in a dictionary to Decimal for DynamoDB.
    """
    if isinstance(data, dict):
        return {k: convert_float_to_decimal(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [convert_float_to_decimal(v) for v in data]
    elif isinstance(data, float):
        return Decimal(str(data))
    else:
        return data
