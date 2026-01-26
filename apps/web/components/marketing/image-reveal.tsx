'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'

type ImageRevealProps = {
  src: string
  alt: string
  className?: string
  imageClassName?: string
  overlayClassName?: string
  sizes?: string
  priority?: boolean
  withRing?: boolean
  withHover?: boolean
  children?: React.ReactNode
}

const revealVariants = {
  hidden: { clipPath: 'inset(0 0 100% 0)' },
  show: {
    clipPath: 'inset(0 0 0% 0)',
    transition: { duration: 1.1, ease: 'easeOut' },
  },
}

const focusVariants = {
  hidden: { scale: 1.08, filter: 'blur(12px)', opacity: 0.6 },
  show: {
    scale: 1,
    filter: 'blur(0px)',
    opacity: 1,
    transition: { duration: 1.1, ease: 'easeOut' },
  },
}

const sweepVariants = {
  hidden: { x: '-60%', opacity: 0 },
  show: {
    x: '140%',
    opacity: 0.35,
    transition: { duration: 1.4, ease: 'easeOut', delay: 0.3 },
  },
}

export function ImageReveal({
  src,
  alt,
  className,
  imageClassName,
  overlayClassName,
  sizes,
  priority,
  withRing = true,
  withHover = true,
  children,
}: ImageRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [12, -12])

  return (
    <motion.div
      ref={ref}
      className={cn(
        'group relative overflow-hidden rounded-[32px]',
        withRing && 'ring-1 ring-white/40',
        withHover &&
          'transition duration-500 hover:-translate-y-1 hover:shadow-[0_30px_90px_-60px_rgba(15,23,42,0.9)]',
        className
      )}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.35 }}
    >
      <motion.div className="absolute inset-0" variants={revealVariants}>
        <motion.div className="absolute inset-0" style={{ y }} variants={focusVariants}>
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            className={cn('object-cover', imageClassName)}
          />
        </motion.div>
      </motion.div>
      {overlayClassName ? (
        <div className={cn('pointer-events-none absolute inset-0', overlayClassName)} />
      ) : null}
      <motion.span
        className="pointer-events-none absolute -inset-y-1/3 left-[-60%] w-1/2 rotate-[20deg] bg-gradient-to-r from-transparent via-white/40 to-transparent"
        variants={sweepVariants}
      />
      {withHover ? (
        <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(255,255,255,0.35),_transparent_55%)]" />
        </div>
      ) : null}
      <div className="relative z-10 h-full">{children}</div>
    </motion.div>
  )
}
