import React, { useState } from 'react'
import { ImageProps, Image as RNImage } from 'react-native'

interface Props extends ImageProps {
  fallbackSource?: ImageProps['source']
}

function Image({ className, source, fallbackSource, style, ...props }: Props) {
  const [error, setError] = useState<boolean>(false)

  return (
    <RNImage
      source={error ? fallbackSource : source}
      onError={() => setError(true)}
      onLoad={() => setError(false)}
      className={className}
      style={style}
      {...props}
    />
  )
}

export default Image
