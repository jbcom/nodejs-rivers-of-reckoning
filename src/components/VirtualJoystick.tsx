import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useGameStore } from '../store/gameStore'

interface VirtualJoystickProps {
  size?: number
  stickSize?: number
  position?: { bottom: number; left?: number; right?: number }
  color?: string
  onMove?: (x: number, y: number) => void
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({
  size = 120,
  stickSize = 60,
  position = { bottom: 40, left: 40 },
  color = 'rgba(255, 255, 255, 0.15)',
  onMove,
}) => {
  const [isPressed, setIsPressed] = useState(false)
  const [stickPos, setStickPos] = useState({ x: 0, y: 0 })
  const baseRef = useRef<HTMLDivElement>(null)
  const isTouchDevice = useGameStore((state) => state.isTouchDevice)
  const setIsTouchDevice = useGameStore((state) => state.setIsTouchDevice)

  // Detect touch device on mount and handle dynamic switching
  useEffect(() => {
    const handleTouchStart = () => {
      setIsTouchDevice(true)
    }
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // List of movement keys that suggest keyboard use
      const movementKeys = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright']
      if (movementKeys.includes(e.key.toLowerCase())) {
        setIsTouchDevice(false)
      }
    }

    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      setIsTouchDevice(true)
    }

    window.addEventListener('touchstart', handleTouchStart)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [setIsTouchDevice])

  const updateStickPosition = useCallback((clientX: number, clientY: number) => {
    if (!baseRef.current) return

    const rect = baseRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    let dx = clientX - centerX
    let dy = clientY - centerY

    const distance = Math.sqrt(dx * dx + dy * dy)
    const maxRadius = rect.width / 2

    if (distance > maxRadius) {
      dx = (dx / distance) * maxRadius
      dy = (dy / distance) * maxRadius
    }

    setStickPos({ x: dx, y: dy })
    
    // Normalize values to -1 to 1
    if (onMove) {
      onMove(dx / maxRadius, dy / maxRadius)
    }
  }, [onMove])

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsPressed(true)
    updateStickPosition(e.clientX, e.clientY)
    
    // Haptic feedback
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(10)
    }
  }

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isPressed) return
    updateStickPosition(e.clientX, e.clientY)
  }, [isPressed, updateStickPosition])

  const handlePointerUp = useCallback(() => {
    setIsPressed(false)
    setStickPos({ x: 0, y: 0 })
    if (onMove) {
      onMove(0, 0)
    }
  }, [onMove])

  useEffect(() => {
    if (isPressed) {
      window.addEventListener('pointermove', handlePointerMove)
      window.addEventListener('pointerup', handlePointerUp)
    } else {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [isPressed, handlePointerMove, handlePointerUp])

  // Reset joystick value on unmount
  useEffect(() => {
    return () => {
      if (onMove) onMove(0, 0)
    }
  }, [onMove])

  // If not a touch device, hide the joystick
  if (!isTouchDevice) return null

  return (
    <div
      ref={baseRef}
      onPointerDown={handlePointerDown}
      style={{
        position: 'fixed',
        bottom: position.bottom,
        left: position.left,
        right: position.right,
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: isPressed ? 'rgba(255, 255, 255, 0.25)' : color,
        border: `2px solid ${isPressed ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.3)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        touchAction: 'none',
        zIndex: 1000,
        transition: 'background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
        transform: isPressed ? 'scale(1.1)' : 'scale(1.0)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        style={{
          width: stickSize,
          height: stickSize,
          borderRadius: '50%',
          backgroundColor: isPressed ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.5)',
          transform: `translate(${stickPos.x}px, ${stickPos.y}px)`,
          transition: isPressed ? 'none' : 'transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          boxShadow: isPressed 
            ? '0 0 20px rgba(255, 255, 255, 0.6), inset 0 0 10px rgba(0,0,0,0.2)' 
            : '0 4px 8px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
        }}
      />
    </div>
  )
}
