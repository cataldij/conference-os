import { styled, Stack, GetProps, createStyledContext, withStaticProperties } from '@tamagui/core'
import { forwardRef } from 'react'

const ProgressContext = createStyledContext({
  value: 0,
  max: 100,
})

const ProgressFrame = styled(Stack, {
  name: 'Progress',
  context: ProgressContext,
  height: 8,
  borderRadius: 4,
  backgroundColor: '$backgroundStrong',
  overflow: 'hidden',
})

const ProgressIndicator = styled(Stack, {
  name: 'ProgressIndicator',
  context: ProgressContext,
  height: '100%',
  backgroundColor: '$accentColor',
  borderRadius: 4,

  variants: {
    animation: {
      bouncy: {
        animation: 'bouncy',
      },
    },
  } as const,
})

type ProgressFrameProps = GetProps<typeof ProgressFrame>

interface ProgressProps extends ProgressFrameProps {
  value?: number
  max?: number
}

const ProgressRoot = forwardRef<any, ProgressProps>(function Progress(
  { value = 0, max = 100, children, ...props },
  ref
) {
  return (
    <ProgressContext.Provider value={value} max={max}>
      <ProgressFrame ref={ref} {...props}>
        {children || <ProgressIndicator style={{ width: `${(value / max) * 100}%` }} />}
      </ProgressFrame>
    </ProgressContext.Provider>
  )
})

export const Progress = withStaticProperties(ProgressRoot, {
  Indicator: ProgressIndicator,
})
