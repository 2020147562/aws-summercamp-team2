import boto3
import uuid
import json
from datetime import datetime

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
        
        # 추가적인 메타데이터 처리 (예: comment 필드 추출)
        comment = metadata.get('comment', '')
        
        # 현재 시간
        timestamp = datetime.utcnow().isoformat()
        
        # 고유 ID 생성 (숫자 타입으로)
        report_id = int(uuid.uuid4().int >> 64)  # UUID의 상위 64비트를 사용하여 숫자 생성
        
        # DynamoDB에 메타데이터 저장
        table = dynamodb.Table(dynamodb_table_name)
        table.put_item(
            Item={
                'report_id': report_id,  # 숫자(Number) 타입으로 저장
                'image_url': image_s3_url,
                'metadata': metadata,
                'uploaded_at': timestamp
            }
        )
        
        # 성공적인 저장 로그 남기기
        print(f"Successfully stored metadata in DynamoDB with report_id: {report_id}")
        
        # 성공적인 응답 반환
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Image metadata stored successfully',
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