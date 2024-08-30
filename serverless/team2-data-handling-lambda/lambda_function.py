import boto3
import json
import base64
import cgi
import io
import uuid
import exifread

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
    location = form_data['location'].value
    
    # 이미지 파일로부터 EXIF 데이터 읽기
    image_file = image.file
    exif_data = get_exif_data(image_file)
    gps_info = extract_gps_info(exif_data)
    
    # GPS 정보를 통해 위치(위도, 경도) 추출
    latitude, longitude = get_lat_lon(gps_info)
    print(f"Latitude: {latitude}, Longitude: {longitude}")
    
    # 고유한 파일 이름 생성
    image_file_name = f"{uuid.uuid4()}.jpg"
    
    # S3에 이미지 업로드
    image.file.seek(0)  # 업로드 전 파일 포인터를 처음으로 되돌림
    try:
        s3.put_object(
            Bucket=s3_bucket_name,
            Key=image_file_name,
            Body=image.file.read(),
            ContentType=image.type  # 업로드된 파일의 실제 MIME 타입을 사용
        )
        print(f"Image successfully uploaded to S3 with key: {image_file_name}")
    except Exception as e:
        print(f"Failed to upload image to S3: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'success': False,
                'message': 'Failed to upload image to S3'
            })
        }

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
                         "text": "이 사진에 있는 물체를 알려주세요. 사진의 물체가 시설이나 가구 등이 아니면 '잘못된 입력'이라고 대답하세요. 그렇지 않으면 물체의 상태와 종류를 설명해주세요. 상태는 부서진, 구멍 난, 긁힌 등으로 표현하며, 물체가 손상되지 않았고 구멍이나 긁힘이 없다면 상태를 (완전함)으로 표현하세요. 물체의 종류는 문, 건물, 거울, 창문 등의 단어를 사용하여 설명하세요. 예를 들어, 긁힌 창문의 사진이 제출되면 '긁힌 창문'이라고 대답하세요. 설명하는 문장은 반환하지 마세요. 답변은 1~3개 단어로만 해주세요."},
                    ],
                }
            ],
        }
    )
    
    response = runtime.invoke_model(
        modelId="anthropic.claude-3-sonnet-20240229-v1:0",
        body=body
    )
    # StreamingBody에서 실제 응답 데이터를 읽어옴
    response_body_string = response['body'].read().decode('utf-8')
    
    # JSON 문자열을 파싱하여 Python 딕셔너리로 변환
    response_body = json.loads(response_body_string)
    
    print(f"response_body : {response_body}")
    
    # 응답에서 텍스트 추출 (예: 'Broken Chair, 5/10'와 같은 형식)
    if response_body.get("content"):
        what_it_is_str = response_body["content"][0].get("text", "")
    else:
        what_it_is_str = ""

    # Claude의 응답 출력 (첫번째 요청)
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
                         "text": "The repair priority must be an integer between 0-10. Do not include any content in your answer other than the repair priority integer. The baseline for repair priority is 0. Starting from 0: If this object is broken into large pieces or major parts are severely damaged, add 6 to the repair priority. If the above condition is not met, such as the object does not break into large pieces, but severe external damage has occurred—like large chunks breaking off the surface, or significant scratches extending to the opposite side making it appear as if the object is penetrated—then add 4 to the repair priority. If there are deep, noticeable scratches on the surface, or if there is moderate depth damage to the surface, or if there is a non-negligible size hole in the door, add 3 to the repair priority. If there are minor scratches or scuffs visible, add 1 to the repair priority. If the final repair priority calculated this way exceeds 10, answer me with '10'."},
                    ],
                }
            ],
        }
    )

    response = runtime.invoke_model(
        modelId="anthropic.claude-3-sonnet-20240229-v1:0",
        body=body
    )
    # StreamingBody에서 실제 응답 데이터를 읽어옴
    response_body_string = response['body'].read().decode('utf-8')
    
    # JSON 문자열을 파싱하여 Python 딕셔너리로 변환
    response_body = json.loads(response_body_string)
    
    print(f"response_body : {response_body}")
    
    # 응답에서 텍스트 추출 (예: 'Broken Chair, 5/10'와 같은 형식)
    if response_body.get("content"):
        how_much_broken_str = response_body["content"][0].get("text", "")
    else:
        how_much_broken_str = ""

    # Claude의 응답 출력 (두번째 요청)
    print(f"Claude response (how_much_broken_str): {how_much_broken_str}")
    
    
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
                         "text": "손상된 물체의 영역을 손상된 부분의 이름, 손상 유형, 그리고 손상 정도로 한 문장으로 설명하세요. 한 문장을 초과하지 않고, 요청된 설명 외의 표현을 추가하지 마세요. 문의 문손잡이나 창문의 틀처럼 대상의 부분을 언급하여 손상된 부분의 이름을 지정하세요. 손상이 심각하거나 한 부분만으로 요약될 수 없는 경우, 문이나 창문과 같은 대상 자체를 사용하세요. 손상 유형은 구멍, 파손 또는 화상과 같이 대상이 수리가 필요한 이유를 명시해야 합니다. 손상 정도는 손상 유형에 관련된 용어로, 경미하거나 심각한 등으로 설명해야 합니다."},
                    ],
                }
            ],
        }
    )

    response = runtime.invoke_model(
        modelId="anthropic.claude-3-sonnet-20240229-v1:0",
        body=body
    )
    # StreamingBody에서 실제 응답 데이터를 읽어옴
    response_body_string = response['body'].read().decode('utf-8')
    
    # JSON 문자열을 파싱하여 Python 딕셔너리로 변환
    response_body = json.loads(response_body_string)
    
    print(f"response_body : {response_body}")
    
    # 응답에서 텍스트 추출 (예: 'Broken Chair, 5/10'와 같은 형식)
    if response_body.get("content"):
        what_is_broken_str = response_body["content"][0].get("text", "")
    else:
        what_is_broken_str = ""

    # Claude의 응답 출력 (두번째 요청)
    print(f"Claude response (what_is_broken_str): {what_is_broken_str}")

    
    # metadata 구조 생성
    metadata = {
        "location": location,
        "product": what_it_is_str.strip(),
        "priority": how_much_broken_str.strip(),
        "description" : what_is_broken_str.strip(),
        "latitude": latitude,
        "longitude": longitude
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
            'success' : True,
            'message': 'Data successfully forwarded to the next Lambda function'
        })
    }

def get_exif_data(image_file):
    """Extract EXIF data from an image file using exifread."""
    # EXIF 데이터를 읽어옴
    image_file.seek(0)
    tags = exifread.process_file(image_file)
    
    # 디버깅을 위한 전체 EXIF 데이터 출력
    print("EXIF Data:", tags)
    
    return tags

def extract_gps_info(tags):
    """Extract GPS information from EXIF tags."""
    gps_info = {}
    if 'GPS GPSLatitude' in tags and 'GPS GPSLongitude' in tags:
        gps_info['GPSLatitude'] = tags['GPS GPSLatitude']
        gps_info['GPSLatitudeRef'] = tags['GPS GPSLatitudeRef']
        gps_info['GPSLongitude'] = tags['GPS GPSLongitude']
        gps_info['GPSLongitudeRef'] = tags['GPS GPSLongitudeRef']
    
    return gps_info

def get_lat_lon(gps_info):
    """Convert GPS info to latitude and longitude."""
    def dms_to_dd(dms, ref):
        d = dms.values[0].num / dms.values[0].den
        m = dms.values[1].num / dms.values[1].den
        s = dms.values[2].num / dms.values[2].den
        dd = float(d) + (float(m) / 60.0) + (float(s) / 3600.0)
        if ref.values[0] in ['S', 'W']:
            dd = -dd
        return dd

    lat = lon = None
    if gps_info:
        lat = dms_to_dd(gps_info['GPSLatitude'], gps_info['GPSLatitudeRef'])
        lon = dms_to_dd(gps_info['GPSLongitude'], gps_info['GPSLongitudeRef'])
    
    return lat, lon
