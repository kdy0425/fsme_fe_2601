import { sendHttpRequest } from "@/utils/fsms/common/apiUtils"

export const pAssoCodeList = async () => {
  try {
    let endpoint: string = '/fsm/par/lpr/cm/getAssoCodeList?upInstCd=00000';

    const response = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' })

    if (response && response.resultType === 'success' && response.data) {
      return response.data
    }
  } catch (error) {
    console.error('Error pAssoCodeList data:', error)
  }
}

export const cAssoCodeList = async (pAssoCd: string) => {
  try {
    let endpoint: string = `/fsm/par/lpr/cm/getAssoCodeList?upInstCd=${pAssoCd}`

    const response = await sendHttpRequest('GET', endpoint, null, true, { cache: 'no-store' });

    if (response && response.resultType === 'success' && response.data.length > 0) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error('Error cAssoCodeList data:', error)
  }
}