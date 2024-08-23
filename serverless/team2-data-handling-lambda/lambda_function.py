import boto3
import json
import base64
import cgi
import io
import uuid

def lambda_handler(event, context):
    # S3 클라이언트 생성
    s3 = boto3.client('s3')
    s3_bucket_name = 'team2-images-bucket'

    # Base64로 인코딩된 경우 디코딩
    if event.get('isBase64Encoded'):
        body = base64.b64decode(event['body'])
    else:
        body = event['body'].encode('utf-8')
    
    # Content-Type 헤더에서 boundary 값을 포함하여 가져옴
    content_type = event['headers'].get('Content-Type') or event['headers'].get('content-type')
    
    # environ를 구성하여 cgi.FieldStorage를 사용해 파싱
    environ = {
        'REQUEST_METHOD': 'POST',
        'CONTENT_TYPE': content_type,
        'CONTENT_LENGTH': str(len(body))
    }
    
    # multipart/form-data 파싱
    form_data = cgi.FieldStorage(fp=io.BytesIO(body), environ=environ, keep_blank_values=True)
    
    # 이미지와 코멘트 추출
    image = form_data['image']
    comment = form_data['comment'].value
    
    # 고유한 파일 이름 생성
    image_file_name = f"{uuid.uuid4()}.jpg"
    
    # S3에 이미지 업로드
    s3.put_object(
        Bucket=s3_bucket_name,
        Key=image_file_name,
        Body=image.file.read(),
        ContentType='image/jpeg'
    )
    # 업로드된 이미지의 S3 URL 생성
    s3_image_url = f"https://{s3_bucket_name}.s3.amazonaws.com/{image_file_name}"

    # 수정된 부분: image.file.read()를 사용하여 이미지를 바로 활용
    image.file.seek(0)  # S3 업로드 후 파일 포인터를 처음으로 되돌립니다.
    image_bytes = image.file.read()

    runtime = boto3.client('bedrock-runtime', region_name='us-east-1')
    # 바이너리 데이터를 base64로 인코딩
    encoded_image = base64.b64encode(image_bytes).decode("utf-8")

    # Claude 3.5를 이용하여 '이미지 사물 종류 / 사물의 파손 정도'를 응답으로 받음.
    body = json.dumps(
        {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1000,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": "image/jpeg",
                                "data": encoded_image,
                            },
                        },
                        {"type": "text",
                         "text": "Tell me what is in this image. You don't need to describe any further information about your decision"},
                    ],
                }
            ],
        }
    )

    response = runtime.invoke_model(
        modelId="anthropic.claude-3-sonnet-20240229-v1:0",
        body=body
    )
    # Claude의 응답을 dict 타입으로 파싱
    response_body = json.loads(response.get("body").read())
    
    # 응답에서 텍스트 추출 (예: 'Broken Chair, 5/10'와 같은 형식)
    what_it_is_str = response_body.get("text", "")
    
    # Claude의 응답 출력 (첫 번째 요청)
    print(f"Claude response (what_it_is_str): {what_it_is_str}")

    # Claude 3.5를 이용하여 '이미지 사물 종류 / 사물의 파손 정도'를 응답으로 받음.
    body = json.dumps(
        {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1000,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": "image/jpeg",
                                "data": encoded_image,
                            },
                        },
                        {"type": "text",
                         "text": "Tell me the repair priority based on how much it broken from 1 to 10, respond like '5/10'. You don't need to describe any further information about your decision"},
                    ],
                }
            ],
        }
    )

    response = runtime.invoke_model(
        modelId="anthropic.claude-3-sonnet-20240229-v1:0",
        body=body
    )
    # Claude의 응답을 dict 타입으로 파싱
    response_body = json.loads(response.get("body").read())
    
    how_much_broken_str = response_body.get("text", "")

    # Claude의 응답 출력 (두 번째 요청)
    print(f"Claude response (how_much_broken_str): {how_much_broken_str}")

    # metadata 구조 생성
    metadata = {
        "comment": comment,
        "product": what_it_is_str.strip(),
        "priority": how_much_broken_str.strip(),
    }

    # Lambda 클라이언트 생성
    lambda_client = boto3.client('lambda')

    # 호출할 Lambda 함수 이름
    target_lambda_function_name = 'team2-DB-management-lambda'  # 실제 다음 Lambda 함수 이름으로 변경

    # 다른 Lambda 함수 비동기 호출
    lambda_client.invoke(
        FunctionName=target_lambda_function_name,
        InvocationType='Event',  # 비동기 호출
        Payload=json.dumps({
            "image_s3_url": s3_image_url,  # 이미지의 S3 URL을 전달
            "metadata": metadata
        })
    )
    
    # 호출 후 즉시 성공적인 응답 반환
    return {
        'statusCode': 200,
        'body': json.dumps({
            'message': 'Data successfully forwarded to the next Lambda function'
        })
    }
