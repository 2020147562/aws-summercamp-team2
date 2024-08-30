import boto3
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError
import os
import json
import io
from urllib.parse import urlparse


def lambda_handler(event, context):
    
    # Slack 클라이언트 초기화
    slack_bot_token = os.getenv('SLACK_TOKEN')
    client = WebClient(token=slack_bot_token)
    channel_id = os.getenv('CHANNEL_ID')
    
    
    # 이전 람다에서 전달된 데이터 추출
    report_id = event.get("report_id")
    metadata = event.get('metadata', {})
    image_url = event.get('image_url')
    product = metadata['product']
    description = metadata['description']
    priority = metadata['priority']
    location = metadata['location']
    latitude = metadata['latitude']
    longitude = metadata['longitude']
    timestamp = event.get("timestamp")
    # comment = metadata.get('comment', '')
    
    # 심각성이 3 미만이면 메세지 보내지 않음
    if int(priority) < 3:
        return {
            'statusCode': 200,
            'body': json.dumps('Priority가 3 미만이어서 함수가 종료되었습니다.')
        }

    # S3에서 이미지 다운로드
    s3_bucket_name = os.getenv('S3_BUCKET')
    parsed_url = urlparse(image_url)
    s3_object_key = parsed_url.path.lstrip('/')
    s3 = boto3.client('s3')
    
    try:
        s3_response = s3.get_object(Bucket=s3_bucket_name, Key=s3_object_key)
        image_data = s3_response['Body'].read()
    except Exception as e:
        raise ValueError(f"S3에서 이미지 다운로드 실패: {str(e)}")


    # Slack 파일 업로드 및 메시지 전송
    try:
        # 파일 업로드
        image_file = io.BytesIO(image_data)
        image_file.name = f"{s3_object_key}"
        # 파일 업로드
        response = client.files_upload_v2(
            file=image_file,  # 바이너리 이미지 데이터를 파일처럼 사용
            filename=image_file.name,  # 파일 이름을 지정하여 확장자를 포함
            title=s3_object_key,  # Slack에서 보여질 파일 제목
            channels=[channel_id],  # 업로드할 채널 ID
            content_type='image/jpg'  # 이미지의 MIME 타입 (JPEG 예시)
        )
        
        # Slack 메시지 구성
        message_text = (
            f"새로운 수리 요청이 접수되었습니다!\n"
            f"접수번호 : {report_id}\n"
            # f"메타 데이터: {json.dumps(metadata)}\n"
            f"시설물 종류 : {product}\n"
            f"상태: {description}\n"
            f"심각성 : {priority}/10\n"
            f"시설물 위치 : {location}\n"
            f"https://www.google.com/maps?q={latitude},{longitude}\n"
            f"타임스탬프: {timestamp}\n"
        )

        # 메시지 전송
        client.chat_postMessage(
            channel=channel_id,
            text=message_text
        )

    except SlackApiError as e:
        raise ValueError(f"Slack 파일 업로드 중 오류 발생: {e.response['error']}")

    return {
        'statusCode': 200,
        'body': json.dumps('메시지가 성공적으로 전송되었습니다!')
    }
