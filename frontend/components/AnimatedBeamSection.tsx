"use client"
import React, { forwardRef, useRef } from "react"
import { cn } from "@/lib/utils"
import { AnimatedBeam } from "@/registry/magicui/animated-beam"

const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-10 flex items-center justify-center rounded-full border-2 bg-white shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)] overflow-hidden flex-shrink-0",
        className
      )}
    >
      {children}
    </div>
  )
})
Circle.displayName = "Circle"

export function AnimatedBeamSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const div1Ref = useRef<HTMLDivElement>(null)
  const div2Ref = useRef<HTMLDivElement>(null)
  const div3Ref = useRef<HTMLDivElement>(null)
  const div4Ref = useRef<HTMLDivElement>(null)
  const div5Ref = useRef<HTMLDivElement>(null)

  return (
    <div
      className="relative flex w-full items-center justify-center overflow-visible mt-12"
      style={{ height: "300px" }}
      ref={containerRef}>
      <div className="flex w-full h-full max-w-2xl flex-col items-center justify-between px-8">
        <div className="flex w-full items-center justify-between">
          <Circle ref={div1Ref} className="w-12 h-12">
            <img src="/pdf.png" alt="PDF" className="w-10 h-10" />
          </Circle>
          <Circle ref={div2Ref} className="w-12 h-12">
            <img src="/txt.png" alt="Google Docs" className="w-10 h-10" />
          </Circle>
        </div>
        <Circle ref={div3Ref} className="w-16 h-16">
          <img src="/favicon.png" alt="" className="w-13 h-13" />
        </Circle>
        <div className="flex w-full items-center justify-between">
          <Circle ref={div4Ref} className="w-12 h-12">
            <img src="/docx.png" alt="WhatsApp" className="w-10 h-10" />
          </Circle>
          <Circle ref={div5Ref} className="w-12 h-12">
            <img src="/csv.png" alt="Messenger" className="w-10 h-10" />
          </Circle>
        </div>
      </div>
      <AnimatedBeam containerRef={containerRef} fromRef={div1Ref} toRef={div3Ref} curvature={-75} endYOffset={-10} />
      <AnimatedBeam containerRef={containerRef} fromRef={div2Ref} toRef={div3Ref} curvature={75} endYOffset={-10} />
      <AnimatedBeam containerRef={containerRef} fromRef={div4Ref} toRef={div3Ref} curvature={-75} endYOffset={10} />
      <AnimatedBeam containerRef={containerRef} fromRef={div5Ref} toRef={div3Ref} curvature={75} endYOffset={10} />
      <AnimatedBeam containerRef={containerRef} fromRef={div1Ref} toRef={div3Ref} curvature={-75} endYOffset={-10} reverse />
      <AnimatedBeam containerRef={containerRef} fromRef={div2Ref} toRef={div3Ref} curvature={75} endYOffset={-10} reverse />
      <AnimatedBeam containerRef={containerRef} fromRef={div4Ref} toRef={div3Ref} curvature={-75} endYOffset={10} reverse />
      <AnimatedBeam containerRef={containerRef} fromRef={div5Ref} toRef={div3Ref} curvature={75} endYOffset={10} reverse />
    </div>
  )
}