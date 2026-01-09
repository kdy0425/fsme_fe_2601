import { ReactNode } from 'react'
import { Metadata } from 'next'

// 메타데이터 생성 함수 타입
export type GenerateMetadata = (props: {
  params: { [key: string]: string }
  searchParams: { [key: string]: string | string[] | undefined }
}) => Promise<Metadata> | Metadata

// 라우트 세그먼트 설정 타입
export type RouteSegmentConfig = {
  dynamic?: 'auto' | 'force-dynamic' | 'error' | 'force-static'
  revalidate?: 'force-cache' | number
  fetchCache?:
    | 'auto'
    | 'default-cache'
    | 'only-cache'
    | 'force-cache'
    | 'force-no-store'
  runtime?: 'nodejs' | 'edge'
  preferredRegion?: string | string[]
}

// 기본 페이지 props 타입 정의
// 추가 파라미터가 필요없는 경우 사용
export type BasePageProps = {
  children?: ReactNode
  searchParams?: { [key: string]: string | string[] | undefined }
  params?: { [key: string]: string }
}

// 추가 props를 위한 제네릭 타입
export type PageProps<T = {}> = BasePageProps & T

// 레이아웃 props 타입 정의
export type LayoutProps = {
  children: ReactNode
}

// 기능별 컴포넌트 props 타입 정의
// 필요한 prop을 제네릭으로 추가하여 사용 가능
// <T = {}>: 이 부분은 제네릭 타입 매개변수를 정의합니다.
// = {}: 기본값으로 빈 객체를 설정합니다. 즉, 추가 props가 지정되지 않으면 빈 객체가 사용됩니다.
export type CreatePageProps<T = {}> = PageProps<T>
export type ViewPageProps<T = {}> = PageProps<T>
export type UpdatePageProps<T = {}> = PageProps<T>
export type ListPageProps<T = {}> = PageProps<T>
