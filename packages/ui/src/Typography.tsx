import { styled, Text as TamaguiText } from '@tamagui/core'

// Heading variants - Apple-like typography
export const H1 = styled(TamaguiText, {
  name: 'H1',
  tag: 'h1',
  fontFamily: '$heading',
  fontSize: '$12',
  fontWeight: '700',
  color: '$color',
  letterSpacing: -1.5,
  lineHeight: 48,
})

export const H2 = styled(TamaguiText, {
  name: 'H2',
  tag: 'h2',
  fontFamily: '$heading',
  fontSize: '$10',
  fontWeight: '700',
  color: '$color',
  letterSpacing: -1,
  lineHeight: 36,
})

export const H3 = styled(TamaguiText, {
  name: 'H3',
  tag: 'h3',
  fontFamily: '$heading',
  fontSize: '$8',
  fontWeight: '600',
  color: '$color',
  letterSpacing: -0.5,
  lineHeight: 28,
})

export const H4 = styled(TamaguiText, {
  name: 'H4',
  tag: 'h4',
  fontFamily: '$heading',
  fontSize: '$7',
  fontWeight: '600',
  color: '$color',
  letterSpacing: -0.25,
  lineHeight: 24,
})

export const H5 = styled(TamaguiText, {
  name: 'H5',
  tag: 'h5',
  fontFamily: '$heading',
  fontSize: '$6',
  fontWeight: '600',
  color: '$color',
  lineHeight: 22,
})

export const H6 = styled(TamaguiText, {
  name: 'H6',
  tag: 'h6',
  fontFamily: '$heading',
  fontSize: '$5',
  fontWeight: '600',
  color: '$color',
  lineHeight: 20,
})

// Body text
export const Paragraph = styled(TamaguiText, {
  name: 'Paragraph',
  tag: 'p',
  fontFamily: '$body',
  fontSize: '$4',
  fontWeight: '400',
  color: '$color',
  lineHeight: 22,
})

export const BodyLarge = styled(TamaguiText, {
  name: 'BodyLarge',
  fontFamily: '$body',
  fontSize: '$5',
  fontWeight: '400',
  color: '$color',
  lineHeight: 24,
})

export const BodySmall = styled(TamaguiText, {
  name: 'BodySmall',
  fontFamily: '$body',
  fontSize: '$3',
  fontWeight: '400',
  color: '$color',
  lineHeight: 18,
})

// Secondary text (muted)
export const TextSecondary = styled(TamaguiText, {
  name: 'TextSecondary',
  fontFamily: '$body',
  fontSize: '$4',
  fontWeight: '400',
  color: '$colorSecondary',
  lineHeight: 22,
})

export const TextMuted = styled(TamaguiText, {
  name: 'TextMuted',
  fontFamily: '$body',
  fontSize: '$3',
  fontWeight: '400',
  color: '$colorTertiary',
  lineHeight: 18,
})

// Labels
export const Label = styled(TamaguiText, {
  name: 'Label',
  fontFamily: '$body',
  fontSize: '$3',
  fontWeight: '500',
  color: '$color',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
})

export const Caption = styled(TamaguiText, {
  name: 'Caption',
  fontFamily: '$body',
  fontSize: '$2',
  fontWeight: '400',
  color: '$colorSecondary',
  lineHeight: 16,
})

// Links
export const Link = styled(TamaguiText, {
  name: 'Link',
  fontFamily: '$body',
  fontSize: '$4',
  fontWeight: '500',
  color: '$accentColor',
  cursor: 'pointer',

  hoverStyle: {
    color: '$accentColorHover',
    textDecorationLine: 'underline',
  },

  pressStyle: {
    color: '$accentColorPress',
  },
})

// Mono/code text
export const Code = styled(TamaguiText, {
  name: 'Code',
  fontFamily: '$mono',
  fontSize: '$3',
  fontWeight: '400',
  color: '$color',
  backgroundColor: '$backgroundStrong',
  paddingHorizontal: '$1.5',
  paddingVertical: '$0.5',
  borderRadius: '$1',
})
