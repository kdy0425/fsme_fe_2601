/* React */
import { memo, useState } from 'react'

/* 공통 component */
import BlankCard from '@/components/shared/BlankCard'
import { LoadingBackdrop } from '@/app/components/loading/LoadingBackdrop'

/* 공통 js */
import { formatDay } from '@/utils/fsms/common/util'
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { getUserInfo } from '@/utils/fsms/utils'

/* type */
import { Row } from '../page'

type propsInterface = {
	issueDetailInfo: Row | null
	reload: () => void
}

const TxCarnetInfo = (props: propsInterface) => {

	const userInfo = getUserInfo()

	const { issueDetailInfo, reload } = props

	const [loadingBackdrop, setLoadingBackdrop] = useState(false) // 저장시 로딩상태

	const procValidation = (): boolean => {
		if (userInfo?.locgovCd !== issueDetailInfo?.locgovCd) {
			alert("지급정지 삭제 및 중지는 등록 지자체만 가능합니다.")
			return false
		}
		return true
	}

	const editData = async (type: 'delete' | 'disable'): Promise<void> => {
		
		if (procValidation()) {

			const msg = type == 'delete' ? '삭제' : '중지'

			const body = {
				frcsBrno: issueDetailInfo?.frcsBrno ?? '',
				frcsNo: issueDetailInfo?.frcsNo ?? '',
				hstrySn: Number(issueDetailInfo?.hstrySn)
			}

			if (confirm('지급 정지를 ' + msg + '하시겠습니까?')) {

				setLoadingBackdrop(true)
				
				const endpoint: string = type === 'delete' ? '/fsm/apv/fgsm/cm/deleteFrcsGiveStopMng' : '/fsm/apv/fgsm/cm/disableFrcsGiveStopMng'
				
				try {

					const method = type == 'delete' ? 'DELETE' : 'PUT'
					const response = await sendHttpRequest(method, endpoint, body, true, { cache: 'no-store' })
					
					if (response && response.resultType === 'success') {
						alert(msg + ' 되었습니다')
						reload()
					} else {
						alert(response.message)
					}
				} catch (error) {
					console.error('Error ::: ', error)
				} finally {
					setLoadingBackdrop(false)
				}
			}
		}
	}

	return (
		<>
			<BlankCard className="contents-card" title="지급정지 상세정보"
				buttons={[
					{
						label: '지급정지 삭제',
						color: 'outlined',
						onClick: () => editData('delete'),
						disabled: issueDetailInfo?.sttsCd != '00'
					},
					{
						label: '지급정지 중지',
						color: 'outlined',
						onClick: () => editData('disable'),
						disabled: issueDetailInfo?.sttsCd != '10'
					},
				]}
			>
				{/* 테이블영역 시작 */}
				<div className="table-scrollable">
					<table className="table table-bordered">
						<caption>지급정지 상세정보</caption>
						<colgroup>
							<col style={{ width: '12%' }} />
							<col style={{ width: '13%' }} />
							<col style={{ width: '12%' }} />
							<col style={{ width: '13%' }} />
							<col style={{ width: '12%' }} />
							<col style={{ width: '13%' }} />
							<col style={{ width: '12%' }} />
							<col style={{ width: '13%' }} />
						</colgroup>
						<tbody>
							<tr>
								<th className="td-head" scope="row">
									지급정지상태
								</th>
								<td>
									{issueDetailInfo?.sttsNm}
								</td>
								<th className="td-head" scope="row">
									지급정지시작일
								</th>
								<td>
									{formatDay(issueDetailInfo?.stopBgngYmd ?? '')}
								</td>
								<th className="td-head" scope="row">
									지급정지종료일
								</th>
								<td>
									{formatDay(issueDetailInfo?.stopEndYmd ?? '')}
								</td>
								<th className="td-head" scope="row">
									등록지자체명
								</th>
								<td>
									{issueDetailInfo?.locgovNm}
								</td>
							</tr>

							<tr>
								<th className="td-head" scope="row">
									입력자ID
								</th>
								<td>
									{issueDetailInfo?.rgtrId}
								</td>
								<th className="td-head" scope="row">
									입력일자
								</th>
								<td>
									{formatDay(issueDetailInfo?.regDt ?? '')}

								</td>
								<th className="td-head" scope="row">
									수정자ID
								</th>
								<td>
									{issueDetailInfo?.mdfrId}
								</td>
								<th className="td-head" scope="row">
									수정일자
								</th>
								<td>
									{formatDay(issueDetailInfo?.mdfcnDt ?? '')}
								</td>
							</tr>
							<tr>
								<th className="td-head" scope="row">
									지급정지사유
								</th>
								<td colSpan={7}>
									{issueDetailInfo?.stopRsnCn}
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</BlankCard>

			{/* 로딩 */}
			<LoadingBackdrop open={loadingBackdrop} />
		</>
	)
}

export default memo(TxCarnetInfo)

