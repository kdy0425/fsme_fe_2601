"use client"
import Image,{ ImageProps } from 'next/image';
import { useState } from 'react';
import { getJwtToken } from '@/utils/fsms/common/user/jwtTokenUtils'
import Link from 'next/link';
import React from 'react';

// 파일 테이블 오브젝트
export interface FileInfo {
  fileTsid: string
  fileNm: string
  fileClsfNm: string
  fileSeq: number
  fileExtnNm: string
  fileSize: number
  fileSyncCd: string
  downloadUrl?: string
}


// listData - 파일 목록
// downloadUrl - 파일 다운로드 요청 url
// imageView - 이미지 뷰어 true / false
export const FileList: React.FC<{ fileInfo: FileInfo, downloadUrl:string, imageView:boolean  }> = (props) => {
  const file:FileInfo = props.fileInfo;
  const fileImgeArray = ['png', 'jpg', 'jpeg']
  return (
    <div className="form-inline">
        {fileImgeArray.includes(file.fileExtnNm) && props.imageView ?
        <FileImage fileTsid={file.fileTsid} alt={decodeURIComponent(file.fileNm)} width={400} height={300} endpoint={props.downloadUrl}/>
        : <></>
        }
        
          <FileDownloadLink 
            fileInfo = {file}
            downloadUrl={props.downloadUrl} />
      </div>
  )
}


// 파일 이미지 불러오기에 필요한 image 태그 커스텀 속성 추가
interface MyImageProps extends Omit<ImageProps, 'src'> {
  fileTsid: string;
  endpoint: string;
}

// 파일 이미지 불러오기 컴포넌트
export const FileImage: React.FC<MyImageProps> = ({ fileTsid, alt, width, height, endpoint, ...props }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  return (
    <div>
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      <Image
        src={`/api/common/file/image/${fileTsid}?endpoint=${endpoint}`}
        alt={alt}
        width={width}
        height={height}
        priority
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setError('Failed to load image');
        }}
        {...props}
      />
    </div>
  );
};


// 파일 다운로드 링크 함수
const downloadFile = async (fileTsid: string, fileNm : string, downloadUrl : string) => {

  const jwtToken = await getJwtToken()
  // console.log(`${process.env.NEXT_PUBLIC_API_DOMAIN}${downloadUrl}/${fileTsid}`)
  try {
    // 파일 다운로드 API 호출
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_DOMAIN}${downloadUrl}/${fileTsid}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + jwtToken,
      },
    });

    // 응답 상태 확인
    if (!response.ok) {
      throw new Error('파일 다운로드에 실패했습니다.');
    }

    // Blob 객체로 변환
    const blob = await response.blob();

    // 다운로드를 위한 URL 생성
    const url = window.URL.createObjectURL(blob);

    // 파일 다운로드를 위한 링크 생성
    const a = document.createElement('a');
    a.href = url;
    a.download = decodeURIComponent(fileNm); // 파일명 설정 (혹은 서버에서 파일명 제공 시 해당 파일명 사용)
    document.body.appendChild(a);
    a.click();
    a.remove();

    // URL 해제
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('파일 다운로드 중 오류 발생:', error);
  }
};

// 파일 다운로드 링크 컴포넌트
export const FileDownloadLink: React.FC<{fileInfo:FileInfo,downloadUrl:string}> = ({fileInfo,downloadUrl}) => {

  const downLoadLinkHandler = (e:React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    downloadFile(fileInfo.fileTsid, fileInfo.fileNm,downloadUrl );    
  }

  const fileSizeInKB = fileInfo.fileSize / 1024; // KB로 변환
  const fileSizeInMB = fileSizeInKB / 1024; // MB로 변환

  return (
    <div className="form-group">
      <Link href="" onClick={downLoadLinkHandler} target="" className="icon-link link-download">
        {decodeURIComponent(fileInfo.fileNm)} ({fileSizeInKB < 999 ? fileSizeInKB.toFixed(0) + 'KB' : fileSizeInMB.toFixed(2) + 'MB'})
      </Link>
    </div>
  );
};