"use client"

import React, { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

interface AnimatedBeamProps {
  containerRef: React.RefObject<HTMLDivElement>
  fromRef: React.RefObject<HTMLDivElement>
  toRef: React.RefObject<HTMLDivElement>
  curvature?: number
  reverse?: boolean
  duration?: number
  delay?: number
  pathOpacity?: number
  endYOffset?: number
}

export function AnimatedBeam({
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  duration = 3,
  delay = 0,
  pathOpacity = 0.5,
  endYOffset = 0,
}: AnimatedBeamProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [pathD, setPathD] = useState("")
  const [gradientId, setGradientId] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setGradientId(`gradient-${Math.random().toString(36).substr(2, 9)}`)
  }, [])

  useEffect(() => {
    const updatePath = () => {
      if (!containerRef.current || !fromRef.current || !toRef.current) return

      const container = containerRef.current.getBoundingClientRect()
      const fromRect = fromRef.current.getBoundingClientRect()
      const toRect = toRef.current.getBoundingClientRect()

      const fromX = fromRect.left - container.left + fromRect.width / 2
      const fromY = fromRect.top - container.top + fromRect.height / 2
      const toX = toRect.left - container.left + toRect.width / 2
      const toY = toRect.top - container.top + toRect.height / 2 + (endYOffset || 0)

      const controlX = (fromX + toX) / 2 + (curvature || 0)
      const controlY = (fromY + toY) / 2

      const d = `M ${fromX} ${fromY} Q ${controlX} ${controlY} ${toX} ${toY}`
      setPathD(d)
    }

    updatePath()
    const timer = setTimeout(updatePath, 100)
    window.addEventListener("resize", updatePath)

    return () => {
      clearTimeout(timer)
      window.removeEventListener("resize", updatePath)
    }
  }, [containerRef, fromRef, toRef, curvature, endYOffset])

  if (!mounted) return null

  return (
    <svg
      ref={svgRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ overflow: "visible" }}
      suppressHydrationWarning
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop offset="0%" stopColor="rgb(156, 163, 175)" stopOpacity="0" />
          <stop offset="50%" stopColor="rgb(156, 163, 175)" stopOpacity={pathOpacity} />
          <stop offset="100%" stopColor="rgb(156, 163, 175)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d={pathD}
        stroke={`url(#${gradientId})`}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        initial={{ strokeDashoffset: 10 }}
        animate={{ strokeDashoffset: reverse ? 10 : -10 }}
        transition={{
          duration: duration,
          repeat: Infinity,
          delay: delay,
          ease: "linear",
        }}
        style={{
          strokeDasharray: "10 5",
        }}
      />
    </svg>
  )
}