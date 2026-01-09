'use client'

import KeepAlive, { AliveScope } from 'react-activation'

const CustomKeepAlive = ({ pageMap, path }: { pageMap: Record<string, React.ComponentType<any>> | undefined, path: string }) => {

  const Comp = pageMap?.[path]

  return (
    <AliveScope>
      {Comp ? (
        <KeepAlive cacheKey={path}>
          <Comp />
        </KeepAlive>
      ) : null}
    </AliveScope>
  )
}

export default CustomKeepAlive