import React, { useRef, useLayoutEffect } from 'react'

// mcharts import
import * as am4core from '@amcharts/amcharts4/core'
import * as am4charts from '@amcharts/amcharts4/charts'
import am4themes_animated from '@amcharts/amcharts4/themes/animated'

import {
  BusRfidDailyApplicationStatus,
  FreightDailyApplicationStatus,
} from '@/types/main/main'

am4core.useTheme(am4themes_animated)

interface rfidProps {
  id: string
  rfidPulist: FreightDailyApplicationStatus[] | BusRfidDailyApplicationStatus[]
  // | 택시 rfid 신청 현황[]
}

function isFreightDailyApplicationStatus(
  rfidPulist: any[],
): rfidPulist is FreightDailyApplicationStatus[] {
  return Array.isArray(rfidPulist) // 단순 배열 여부 확인
}

// 타입 가드: BusCardDailyApplicationStatus
function isBusRfidDailyApplicationStatus(
  rfidPulist: any[],
): rfidPulist is BusRfidDailyApplicationStatus[] {
  return Array.isArray(rfidPulist) // 단순 배열 여부 확인
}

// // 타입 가드: TaxiCardDailyApplicationStatus
// function is택시타입(
//   cardPulist: any[]
// ): cardPulist is 택시타입[] {
//   return Array.isArray(cardPulist); // 단순 배열 여부 확인
// }

function transformRfidPulist(
  rfidPulist: FreightDailyApplicationStatus[] | BusRfidDailyApplicationStatus[],
  // | TaxiCardDailyApplicationStatus[]
): any[] {
  if (isFreightDailyApplicationStatus(rfidPulist)) {
    return rfidPulist.map((item) => ({
      country: item.today ? item.today.slice(6, 8) : '00', // today -> country
      research: parseFloat(item.rfidRCnt), //RFID신청건수
      marketing: parseFloat(item.rfidYCnt), //RFID승인건수
      sales: parseFloat(item.rfidNCnt), // RFID거절건수
    }))
  }

  // if (isBusRfidDailyApplicationStatus(rfidPulist)) {
  //   return rfidPulist.map((item) => ({
  //     country: item.rcptYmd ? item.rcptYmd.slice(6, 8) : '00', // today -> country
  //     research: parseFloat(item.rfidReqCnt), //RFID신청건수
  //     marketing: parseFloat(item.rfidApvlCnt), // RFID승인건수
  //     sales: parseFloat(item.rfidRejectCnt), // RFID거절건수
  //   }));
  // }

  // if (is택시 확인(rfidPulist)) {
  //   return rfidPulist.map((item) => ({
  //     country: item.rcptYmd.slice(6, 8), // today -> country
  //     research: parseFloat(item.reqCnt), // cardRCnt -> research
  //     marketing: parseFloat(item.apvlCnt), // 카드 승인
  //     sales: parseFloat(item.rejectCnt), // 카드거절건수
  //   }));

  // Default case for unknown type
  throw new Error(
    'Unknown rfidPulist type check return value  \n :' + rfidPulist,
  )
}

const XYChartTest2: React.FC<rfidProps> = ({ id, rfidPulist }) => {
  const chart = useRef(null)

  useLayoutEffect(() => {
    // Create chart instance
    const chart = am4core.create('chartdiv2', am4charts.XYChart)

    // amcharts 워터 마크 삭제 (라이센스 필히 확인해볼 것)
    if (chart.logo) {
      chart.logo.disabled = true
    }

    chart.marginRight = 400

    // Add data
    chart.data =
      rfidPulist && rfidPulist.length > 0
        ? transformRfidPulist(rfidPulist)
            .sort((a, b) => {
              // 'country' 필드를 날짜로 비교 (미래가 뒤로)
              if (a.country < b.country) return -1 // 과거 날짜가 앞으로
              if (a.country > b.country) return 1 // 미래 날짜가 뒤로
              return 0 // 같은 날짜는 그대로
            })
            .slice(-3)
        : [
            // 정렬된 데이터 중 마지막 3개만 선택 (미래에 가까운 3개).slice(-3)
            {
              country: '',
              research: 0,
              marketing: 0,
              sales: 0,
            },
            {
              country: '',
              research: 0,
              marketing: 0,
              sales: 0,
            },
            {
              country: '',
              research: 0,
              marketing: 0,
              sales: 0,
            },
            {
              country: '',
              research: 0,
              marketing: 0,
              sales: 0,
            },
            {
              country: '',
              research: 0,
              marketing: 0,
              sales: 0,
            },
            {
              country: '',
              research: 0,
              marketing: 0,
              sales: 0,
            },
          ].slice(-3)

    //console.log('chart', chart);

    // Create axes
    const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis())
    categoryAxis.dataFields.category = 'country'
    categoryAxis.renderer.grid.template.location = 0
    categoryAxis.renderer.minGridDistance = 30

    // Value axis
    const valueAxis = chart.yAxes.push(new am4charts.ValueAxis())
    // valueAxis.title.text = "왼쪽 타이틀";

    // Create series
    var series = chart.series.push(new am4charts.ColumnSeries())
    series.dataFields.valueY = 'research'
    series.dataFields.categoryX = 'country'
    series.name = '신청'
    series.tooltipText = '{name}: [bold]{valueY}[/]'
    series.stacked = false

    var series2 = chart.series.push(new am4charts.ColumnSeries())
    series2.dataFields.valueY = 'marketing'
    series2.dataFields.categoryX = 'country'
    series2.name = '승인'
    series2.tooltipText = '{name}: [bold]{valueY}[/]'
    series2.stacked = false

    var series3 = chart.series.push(new am4charts.ColumnSeries())
    series3.dataFields.valueY = 'sales'
    series3.dataFields.categoryX = 'country'
    series3.name = '거절'
    series3.tooltipText = '{name}: [bold]{valueY}[/]'
    series3.stacked = false

    // Add cursor
    chart.cursor = new am4charts.XYCursor()
    chart.legend = new am4charts.Legend()

    return () => {
      chart.dispose()
    }
  }, [id, rfidPulist])

  return <div id="chartdiv2" style={{ width: '100%', height: '220px' }}></div>
}

export default XYChartTest2
