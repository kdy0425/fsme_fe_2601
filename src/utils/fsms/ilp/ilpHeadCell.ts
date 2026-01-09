import { HeadCell } from 'table'

export interface ExtendedHeadCell extends HeadCell {
  customRender?: ((row: any) => React.ReactNode) | null
}

export interface GroupedHeadCell extends HeadCell {
  /** 상단 병합 헤더 라벨 (없으면 그룹 없음) */
  group?: string;
}
