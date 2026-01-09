import React, { useRef, useLayoutEffect } from 'react'

// mcharts import
import * as am4core from '@amcharts/amcharts4/core'
import * as am4charts from '@amcharts/amcharts4/charts'
import am4themes_animated from '@amcharts/amcharts4/themes/animated'
import {
  BusMonthlySubsidyPaymentStatus,
  FreightMonthlySubsidyPaymentStatus,
  TaxiMonthlySubsidyPaymentStatus,
} from '@/types/main/main'
import { NightShelter } from '@mui/icons-material'

am4core.useTheme(am4themes_animated)
am4core.options.autoDispose = true

interface monthlyprops {
  monthly:
    | FreightMonthlySubsidyPaymentStatus[]
    | TaxiMonthlySubsidyPaymentStatus[]
    | BusMonthlySubsidyPaymentStatus[]
  // | 택시 rfid 신청 현황[]
}

function isFreight(monthly: any[]): monthly is FreightMonthlySubsidyPaymentStatus[] {
  return Array.isArray(monthly) && monthly.every(item => item.type === 'freight')
}

function isBus(monthly: any[]): monthly is BusMonthlySubsidyPaymentStatus[] {
  return Array.isArray(monthly) && monthly.every(item => item.type === 'bus')
}

function isTexi(monthly: any[]): monthly is TaxiMonthlySubsidyPaymentStatus[] {
  return Array.isArray(monthly) && monthly.every(item => item.type === 'taxi')
}

function transformRfidPulist(
  monthly:
    | FreightMonthlySubsidyPaymentStatus[]
    | TaxiMonthlySubsidyPaymentStatus[]
    | BusMonthlySubsidyPaymentStatus[],
): any[] {
  
  const months = Array.from({ length: 12 }, (_, i) => ({
    country: `${i + 1}`,
    research: 0,
  }))

  if (isBus(monthly)) {
    // console.log('isBus',monthly)
    const mon = monthly as BusMonthlySubsidyPaymentStatus[]
    return months.map(({ country }) => {
      const found = mon.find(({ crtrYm }) => Number(crtrYm?.slice(4, 6)) == Number(country))
      return {
        country: country + '월',
        research: found ? parseFloat(found.opsAmt as string) : 0,
      }
    })
  }
  if (isTexi(monthly)) {
    // console.log('isTexi',monthly)
    const mon = monthly as TaxiMonthlySubsidyPaymentStatus[]
    return months.map(({ country }) => {
      const found = mon.find(({ crtrYm }) => Number(crtrYm?.slice(4, 6)) == Number(country))
      return {
        country: country + '월',
        research: found ? parseFloat(found.opsAmt as string) : 0,
      }
    })
  }
  if (isFreight(monthly)) {
    // console.log('isFreight',monthly)
    const mon = monthly as FreightMonthlySubsidyPaymentStatus[]
    return months.map(({ country }) => {
      const found = mon.find(({ crtrYm }) => Number(crtrYm?.slice(4, 6)) == Number(country))
      return {
        country: country + '월',
        research: found ? parseFloat(found.opsAmt as string) : 0,
      }
    })
  }

  // console.log('아무것도 해당 안 됨 !')
  return []
}

const XYChartTest: React.FC<monthlyprops> = ({ monthly }) => {
  if (!monthly) {
    return null
  }

  const chart = useRef(null)

  useLayoutEffect(() => {
    // Create chart instance
    var chart = am4core.create('chartdiv3', am4charts.XYChart)

    // amcharts 워터 마크 삭제 (라이센스 필히 확인해볼 것)
    if (chart.logo) {
      chart.logo.disabled = true
    }

    chart.marginRight = 400

    // console.log('monthly 데이터 ! :',monthly)

    // Add data
    chart.data =
      monthly && monthly.length > 0
        ? transformRfidPulist(monthly)
        : 
        [
          {
            country: '1월',
            research: 0,
          },
          {
            country: '2월',
            research: 0,
          },
          {
            country: '3월',
            research: 0,
          },
          {
            country: '4월',
            research: 0,
          },
          {
            country: '5월',
            research: 0,
          },
          {
            country: '6월',
            research: 0,
          },
          {
            country: '7월',
            research: 0,
          },
          {
            country: '8월',
            research: 0,
          },
          {
            country: '9월',
            research: 0,
          },
          {
            country: '10월',
            research: 0,
          },
          {
            country: '11월',
            research: 0,
          },
          {
            country: '12월',
            research: 0,
          },
        ]

    //console.log('chart', chart);

    // Create axes
    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis())
    categoryAxis.dataFields.category = 'country'
    categoryAxis.renderer.grid.template.location = 0
    categoryAxis.renderer.minGridDistance = 20

    // Value axis
    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    // valueAxis.title.text = "왼쪽 타이틀";
    valueAxis.numberFormatter.numberFormat = "#,##a";
    valueAxis.numberFormatter.bigNumberPrefixes = [
      { "number": 1e+3, "suffix": "(천)" },
      { "number": 1e+6, "suffix": "(백만)" },
    ];
    
    // Create series
    var series = chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.valueY = 'research';
    series.dataFields.categoryX = 'country';
    series.name = '신청';
    series.tooltipText = "{name} : [bold]{valueY.formatNumber('#,###')}[/]"; // 툴팁에 단위 적용
    series.stacked = true;
    series.numberFormatter.numberFormat = "#,##a";
    series.numberFormatter.bigNumberPrefixes = [
      { "number": 1e+3, "suffix": "(천)" },
      { "number": 1e+6, "suffix": "(백만)" },
    ];

    // Add cursor
    chart.cursor = new am4charts.XYCursor();
    chart.cursor.lineX.strokeWidth = 0;
    chart.cursor.lineY.strokeWidth = 0;
    chart.cursor.tooltipText = "{valueY.formatNumber('#,###')}";

    // Add legend
    // chart.legend = new am4charts.Legend();
  }, [monthly])

  return <div id="chartdiv3" style={{ width: '100%', height: '360px' }}></div>
}

export default XYChartTest
