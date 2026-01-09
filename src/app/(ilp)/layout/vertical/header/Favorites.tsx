/* React */
import React, { useEffect, useState, useContext } from 'react'
import Link from 'next/link'
import { IconX } from '@tabler/icons-react'

/* mui component */
import { Box, Typography, Drawer, IconButton, Button } from '@mui/material'

/* Type */
import UserAuthContext from '@/app/components/context/UserAuthContext'

/* 공통 js */
import { sendHttpRequest } from '@/utils/fsms/common/apiUtils'
import { toQueryParameter } from '@/utils/fsms/utils'

/* interface 선언 */
interface row {
  menuNm: string
  urlAddr: string
  menuTsid: string
}

const Favorites = () => {
  const { setContextFavoriteList } = useContext(UserAuthContext)

  const [showDrawer, setShowDrawer] = useState<boolean>(false)
  const [facoriteList, setFacoriteList] = useState<row[]>([])
  const [isAllDel, setIsAllDel] = useState<boolean>(false)

  const handleDrawerClose = () => {
    setShowDrawer(false)
    setContextFavoriteList(facoriteList)
  }

  useEffect(() => {
    if (showDrawer) {
      getMyFavorites()
    }
  }, [showDrawer])

  // 내 즐겨찾기 메뉴 가져오기
  const getMyFavorites = async () => {
    try {
      const endpoint = '/fsm/cmm/cmmn/cm/getUserBookmarkAll?sysSeCd=ILP'
      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        let cnt = 0
        const tempData: row[] = response.data.slice()

        for (let i = 0; i < 6 - response.data.length; i++) {
          tempData.push({ menuNm: '', urlAddr: '', menuTsid: '' })
          cnt++
        }

        setIsAllDel(cnt === 6 ? false : true)
        setFacoriteList(tempData)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getFavoriteIcon = (menuTsid: string) => {
    if (menuTsid === '1001000000000') {
      return (
        <svg
          width="53"
          height="50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <mask
            id="a"
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="53"
            height="50"
          >
            <path d="M53 0H0v50h53V0Z" fill="#fff" />
          </mask>
          <g mask="url(#a)">
            <path
              d="M48.471 10.527h-33.93a3.9 3.9 0 0 0-3.9 3.9v27.671a3.9 3.9 0 0 0 3.9 3.9h33.93a3.9 3.9 0 0 0 3.9-3.9v-27.67a3.9 3.9 0 0 0-3.9-3.9Z"
              fill="#D0DBF7"
            />
            <path
              d="M49.04 45.99H13.898a3.896 3.896 0 0 1-3.835-3.2L5.955 20.195a3.151 3.151 0 0 1 3.1-3.712h11.644c.896 0 1.752.391 2.34 1.067l3.431 3.937a2.888 2.888 0 0 0 2.17.989h16.294a3.901 3.901 0 0 1 3.84 3.219l3.022 17.024a2.791 2.791 0 0 1-2.75 3.28l-.005-.01ZM13.074 7.192a1.725 1.725 0 0 1-1.724-1.724V1.725a1.725 1.725 0 0 1 3.449 0v3.743c0 .952-.773 1.724-1.725 1.724ZM7.441 9.17a1.72 1.72 0 0 1-1.218-.507L3.578 6.02a1.726 1.726 0 0 1 0-2.437 1.726 1.726 0 0 1 2.438 0L8.66 6.226A1.726 1.726 0 0 1 7.44 9.169ZM5.468 14.799H1.725a1.725 1.725 0 0 1 0-3.45h3.743a1.725 1.725 0 0 1 0 3.45Z"
              fill="#376CFB"
            />
          </g>
        </svg>
      )
    } else if (menuTsid === '1002000000000') {
      return (
        <svg
          width="50"
          height="50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <mask
            id="a"
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="50"
            height="50"
          >
            <path d="M50 0H0v50h50V0Z" fill="#fff" />
          </mask>
          <g mask="url(#a)">
            <path
              d="M36.626 3.09H5.23A5.23 5.23 0 0 0 0 8.32v36.45A5.23 5.23 0 0 0 5.23 50h31.396a5.23 5.23 0 0 0 5.23-5.23V8.32a5.23 5.23 0 0 0-5.23-5.23Z"
              fill="#E6ECFF"
            />
            <path
              d="M30.828 17.92h-19.8a1.833 1.833 0 1 0 0 3.667h19.804a1.833 1.833 0 1 0 0-3.667h-.004ZM30.828 25.451h-19.8a1.833 1.833 0 1 0 0 3.667h19.804a1.833 1.833 0 1 0 0-3.667h-.004ZM18.214 32.986h-7.186a1.833 1.833 0 1 0 0 3.667h7.186a1.833 1.833 0 1 0 0-3.667ZM24.975 32.986h-.908a1.833 1.833 0 1 0 0 3.667h.908a1.833 1.833 0 1 0 0-3.667ZM30.15 0H11.71a3.176 3.176 0 0 0-3.176 3.176v2.87a3.176 3.176 0 0 0 3.176 3.176h18.44a3.176 3.176 0 0 0 3.176-3.177V3.176A3.176 3.176 0 0 0 30.149 0Z"
              fill="#BAC7E5"
            />
            <path
              d="m48.542 19.287-1.834-1.833a2.888 2.888 0 0 0-4.07 0l-2.14 2.14L25.373 34.72c-1 1-2.09 4.332-2.782 6.743a1.571 1.571 0 0 0 1.943 1.943c2.411-.692 5.743-1.778 6.742-2.782l15.125-15.125 2.14-2.14a2.888 2.888 0 0 0 0-4.07Z"
              fill="#376CFB"
            />
          </g>
        </svg>
      )
    } else if (menuTsid === '1004000000000') {
      return (
        <svg
          width="53"
          height="50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <mask
            id="a"
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="53"
            height="50"
          >
            <path d="M53 0H0v50h53V0Z" fill="#fff" />
          </mask>
          <g mask="url(#a)">
            <path
              d="M46.235 0H13.883a5.773 5.773 0 0 0-5.774 5.773v20.288a5.773 5.773 0 0 0 5.774 5.773h32.352a5.773 5.773 0 0 0 5.773-5.773V5.773A5.773 5.773 0 0 0 46.235 0Z"
              fill="#BAC7E5"
            />
            <path
              d="M37.834 8.11H6.064C2.727 8.11 0 10.836 0 14.172V33.88c0 3.337 2.727 6.064 6.064 6.064h4.51c.963 0 1.718.823 1.636 1.782l-.532 6.314c-.145 1.705 1.941 2.632 3.11 1.387l8.414-8.964a1.64 1.64 0 0 1 1.2-.519h13.437c3.337 0 6.064-2.727 6.064-6.064V14.173c0-3.336-2.727-6.064-6.064-6.064h-.005Z"
              fill="#376CFB"
            />
            <path
              d="M33.516 19.27H10.51a1.89 1.89 0 0 1-1.891-1.89 1.89 1.89 0 0 1 1.89-1.892h23.007a1.89 1.89 0 0 1 1.89 1.891 1.89 1.89 0 0 1-1.89 1.891ZM33.516 25.839H10.51a1.89 1.89 0 0 1-1.891-1.891 1.89 1.89 0 0 1 1.89-1.891h23.007a1.89 1.89 0 0 1 1.89 1.89 1.89 1.89 0 0 1-1.89 1.892ZM15.31 32.403h-4.8a1.89 1.89 0 0 1-1.891-1.89 1.89 1.89 0 0 1 1.89-1.892h4.801a1.89 1.89 0 0 1 1.891 1.891 1.89 1.89 0 0 1-1.891 1.891ZM22.506 32.403H21.38a1.89 1.89 0 0 1-1.891-1.89 1.89 1.89 0 0 1 1.89-1.892h1.128a1.89 1.89 0 0 1 1.891 1.891 1.89 1.89 0 0 1-1.89 1.891Z"
              fill="#E6ECFF"
            />
          </g>
        </svg>
      )
    } else if (menuTsid === '1003000000000') {
      return (
        <svg
          width="56"
          height="50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <mask
            id="a"
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="56"
            height="50"
          >
            <path d="M56 0H0v50h56V0Z" fill="#fff" />
          </mask>
          <g mask="url(#a)">
            <path
              d="M46 24.993a22.988 22.988 0 0 1-14.198 21.242 23.007 23.007 0 0 1-25.065-4.984A22.99 22.99 0 0 1 23 2c6.1 0 11.95 2.422 16.264 6.734A22.989 22.989 0 0 1 46 24.993Z"
              fill="#D0DBF7"
            />
            <path
              d="M39.518 24.993a16.515 16.515 0 0 1-10.2 15.26 16.527 16.527 0 0 1-22.53-12.04 16.513 16.513 0 0 1 7.03-16.957 16.527 16.527 0 0 1 24.444 7.416 16.511 16.511 0 0 1 1.256 6.32Z"
              fill="#BAC7E5"
            />
            <path
              d="M31.388 23.858h-.97l.913-3.15a1.464 1.464 0 1 0-2.822-.781l-2.041 7.678-1.881-7.26a2.027 2.027 0 0 0-3.918 0l-1.915 7.293-2.027-7.711a1.468 1.468 0 0 0-1.411-1.091h-.146a1.467 1.467 0 0 0-1.41 1.88l.907 3.151h-.964a1.377 1.377 0 1 0 0 2.75h1.364c.127-.005.252-.03.371-.075l1.242 4.307a2.023 2.023 0 0 0 1.938 1.458 2.023 2.023 0 0 0 1.942-1.462l1.995-6.978 1.994 6.978a2.018 2.018 0 0 0 3.876 0l1.241-4.307c.121.044.248.07.377.075h1.364a1.38 1.38 0 0 0 1.458-1.375 1.379 1.379 0 0 0-1.458-1.376l-.02-.004Z"
              fill="#D0DBF7"
            />
            <path
              d="M42.73 21.536a14.973 14.973 0 0 1-8.597 4.311 1.866 1.866 0 0 0-1.625 1.843v3.055c0 9.396 7.664 15.384 10.49 17.269.62.417 1.43.417 2.05 0 2.822-1.885 10.49-7.873 10.49-17.269V27.69c0-.937-.697-1.715-1.625-1.843a14.985 14.985 0 0 1-8.596-4.31 1.829 1.829 0 0 0-2.587 0Z"
              fill="#376CFB"
            />
            <path
              d="M43.3 39.81a1.742 1.742 0 0 1-1.23-.592l-3.175-3.575c-.49-.549-.613-1.366-.234-1.995a1.71 1.71 0 0 1 2.758-.29l1.842 2.073 4.162-5.481c.447-.588 1.221-.864 1.915-.617a1.705 1.705 0 0 1 .813 2.646l-5.422 7.133a1.746 1.746 0 0 1-1.28.693h-.154l.005.005Z"
              fill="#E6ECFF"
            />
          </g>
        </svg>
      )
    } else if (menuTsid === '1005000000000') {
      return (
        <svg
          width="66"
          height="50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <mask
            id="a"
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="66"
            height="50"
          >
            <path d="M66 0H0v50h66V0Z" fill="#fff" />
          </mask>
          <g mask="url(#a)">
            <path
              d="M6.14 2h53.72C62.145 2 64 4 64 6.463v4.346H2V6.463C2 4 3.855 2 6.14 2Z"
              fill="#BAC7E5"
            />
            <path
              d="M6.14 48h53.72c2.285 0 4.14-2 4.14-4.462v-32.73H2v32.73C2 46 3.855 48 6.14 48ZM18.633 6.405a1.468 1.468 0 1 0-2.936 0 1.468 1.468 0 0 0 2.936 0ZM13.745 6.405a1.468 1.468 0 1 0-2.936 0 1.468 1.468 0 0 0 2.936 0ZM8.857 6.405a1.468 1.468 0 1 0-2.936 0 1.468 1.468 0 0 0 2.936 0Z"
              fill="#E6ECFF"
            />
            <path
              d="m45.886 26.944-2.422.044a1.011 1.011 0 0 1-.98-.696 9.996 9.996 0 0 0-.678-1.553 1.014 1.014 0 0 1 .156-1.191l1.682-1.745c.01-.011.01-.034 0-.043l-3.002-2.895a.417.417 0 0 0-.314-.123.434.434 0 0 0-.308.134l-1.398 1.45c-.307.32-.784.4-1.185.2a9.983 9.983 0 0 0-1.578-.62 1.012 1.012 0 0 1-.731-.953l-.045-2.422a.03.03 0 0 0-.031-.031l-4.578.083c-.015 0-.03.017-.03.031l.044 2.422c.008.443-.271.837-.696.98-.533.18-1.056.409-1.553.678a1.014 1.014 0 0 1-1.191-.156l-1.745-1.682c-.011-.01-.033-.01-.043 0l-3.179 3.297c-.01.01-.009.034 0 .043l1.745 1.682c.32.307.4.784.2 1.185a9.983 9.983 0 0 0-.62 1.578c-.127.43-.51.724-.953.731l-2.422.045a.031.031 0 0 0-.031.031l.083 4.578c0 .013.017.03.031.03l2.422-.044c.435-.01.837.271.98.696.18.533.409 1.056.677 1.553.213.394.152.873-.155 1.191l-1.682 1.745a.031.031 0 0 0 0 .043l3.297 3.179c.01.01.034.009.043 0l1.682-1.745c.194-.202.458-.309.727-.309.154 0 .311.036.458.108.506.25 1.037.46 1.578.62.43.128.724.511.731.954l.045 2.422c0 .017.014.031.031.031l4.578-.083c.015 0 .03-.017.03-.031l-.044-2.422a1.015 1.015 0 0 1 .696-.98c.533-.18 1.056-.409 1.553-.677a1.014 1.014 0 0 1 1.191.155l1.745 1.682c.011.01.033.01.043 0l3.179-3.297c.01-.01.009-.034 0-.043l-1.745-1.682c-.32-.307-.4-.784-.2-1.185.25-.506.459-1.037.62-1.578.127-.43.51-.724.953-.731l2.422-.045a.03.03 0 0 0 .031-.031l-.083-4.578c0-.014-.017-.03-.031-.03Zm-8.747 1.77a4.193 4.193 0 0 1-1.107 3.708 4.17 4.17 0 0 1-3.029 1.288c-.21 0-.423-.015-.636-.046-1.746-.253-3.187-1.643-3.505-3.379a4.193 4.193 0 0 1 1.108-3.707 4.19 4.19 0 0 1 3.664-1.242c1.747.253 3.188 1.643 3.505 3.379Z"
              fill="#376CFB"
            />
          </g>
        </svg>
      )
    }
  }

  // 즐겨찾기 삭제
  const deleteFavorite = async (url: string) => {
    try {
      const obj = {
        sysSeCd: 'ILP',
			  urlAddr: url,
      }
      let endpoint: string =
        `/fsm/cmm/cmmn/cm/deleteUserBookmark` + toQueryParameter(obj)
      const response = await sendHttpRequest('GET', endpoint, null, true, {
        cache: 'no-store',
      })

      if (response && response.resultType === 'success' && response.data) {
        if (response.data.useYn == 'Y') {
          alert('즐겨찾기가 해제되었습니다.')
        } else if (response.data.useYn == 'N') {
          alert('즐겨찾기가 해제되지 못했습니다.')
        } else {
          alert('오류입니다.')
        }
      } else {
        alert('오류입니다.')
      }
    } catch (error) {
      alert('오류입니다.')
    } finally {
      getMyFavorites()
    }
  }

  // 즐겨찾기 전체삭제
  const deleteAllFavorite = async () => {
    if (confirm('전체해제 하시겠습니까?')) {
      try {
        let endpoint: string = `/fsm/cmm/cmmn/cm/deleteUserBookmarkAll?allYn=Y&sysSeCd=ILP`
        const response = await sendHttpRequest('GET', endpoint, null, true, {
          cache: 'no-store',
        })

        if (response && response.resultType === 'success' && response.data) {
          if (response.data.useYn == 'Y') {
            alert('즐겨찾기가 전체 해제되었습니다.')
          } else if (response.data.useYn == 'N') {
            alert('즐겨찾기가 해제되지 못했습니다.')
          } else {
            alert('오류입니다.')
          }
        } else {
          alert('오류입니다.')
        }
      } catch (error) {
        alert('오류입니다.')
      } finally {
        getMyFavorites()
      }
    }
  }

  return (
    <div className="favorites-group">
      {/* <Link 
        href="#" 
        onClick={() => setShowDrawer(true)}
        className="top-btn btn-favorites"
        > 즐겨찾는 메뉴
      </Link> */}
      <Button
        className="top-btn btn-favorites"
        onClick={() => setShowDrawer(true)}
      >
        즐겨찾는 메뉴
      </Button>

      {/* ------------------------------------------- */}
      {/* Sidebar */}
      {/* ------------------------------------------- */}
      <Drawer
        className="custom-modal-box-wrapper"
        anchor="top"
        open={showDrawer}
        onClose={() => handleDrawerClose()}
        PaperProps={{
          sx: {
            maxWidth: '1000px',
            width: '1000px',
            top: '100px',
            left: '50%',
            marginLeft: '-500px',
          },
        }}
      >
        <div className="custom-modal-box-inner">
          <div className="custom-modal-box-title">
            <Typography variant="h2" fontWeight={600}>
              즐겨찾는 메뉴
            </Typography>
            <Box>
              <IconButton
                className="custom-modal-close"
                color="inherit"
                sx={{
                  color: '#000',
                }}
                onClick={handleDrawerClose}
              >
                <IconX size="2rem" />
              </IconButton>
            </Box>
          </div>

          <div className="custom-modal-box-ex">
            <p>
              메인 화면에서 유가보조금 메뉴를 빠르게 접속 할 수 있도록 메뉴를
              설정할 수 있습니다. (최대 6개 지정)
            </p>
          </div>

          {/* ------------------------------------------- */}
          {/* 컨텐츠  */}
          {/* ------------------------------------------- */}
          <div className="custom-modal-box-contents">
            <div className="favorite_links">
              {facoriteList.map((item, index) => (
                <>
                  {item.menuNm ? (
                    <div className="item" key={'item' + index}>
                      <Link href={item.urlAddr}>
                        {getFavoriteIcon(item.menuTsid)}
                        {item.menuNm}
                      </Link>
                      <button
                        type="button"
                        className="btn_remove"
                        onClick={() => deleteFavorite(item.urlAddr)}
                      >
                        삭제
                      </button>
                    </div>
                  ) : (
                    <div className="item" key={'item' + index}>
                      <div className="empty">메뉴에서 즐겨찾기 하세요.</div>
                    </div>
                  )}
                </>
              ))}
            </div>

            <Box className="table-bottom-button-group">
              <div className="button-right-align">
                {isAllDel ? (
                  <Button
                    variant="contained"
                    style={{ backgroundColor: '#ECF2FF', color: '#0848FF' }}
                    onClick={deleteAllFavorite}
                  >
                    <svg
                      width="16"
                      height="16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ marginRight: '4px' }}
                    >
                      <path
                        d="M15 2.7v4.2h-4.2"
                        stroke="#0848FF"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M13.243 10.4a6.301 6.301 0 1 1-1.485-6.553L15 6.9"
                        stroke="#0848FF"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    전체해제
                  </Button>
                ) : null}
              </div>
            </Box>
          </div>
        </div>
      </Drawer>
    </div>
  )
}

export default Favorites
