import React, { useState } from 'react'
import { ImageProps, Image as RNImage } from 'react-native'

interface Props extends ImageProps {
  fallbackSource?: ImageProps['source']
}

export default function Image({ className, source, fallbackSource, style, ...props }: Props) {
  const [error, setError] = useState<boolean>(false)

  return (
    <RNImage
      source={error ? fallbackSource : source}
      onError={() => setError(true)}
      // onLoad={() => setError(false)}
      className={className}
      style={style}
      {...props}
    />
  )
}
