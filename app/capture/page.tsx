'use client'

import { useEffect, useRef, useState } 
  from 'react'
import { useRouter } from 'next/navigation'
import Logo from '@/components/Logo'

export default function CapturePage() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  
  const [cameraReady, setCameraReady] = 
    useState(false)
  const [cameraError, setCameraError] = 
    useState('')
  const [capturing, setCapturing] = useState(false)
  const [facingMode, setFacingMode] = 
    useState<'environment' | 'user'>('environment')

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [facingMode])

  async function startCamera() {
    try {
      stopCamera()
      setCameraReady(false)
      setCameraError('')

      const stream = await navigator.mediaDevices
        .getUserMedia({
          video: {
            facingMode,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play()
          setCameraReady(true)
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error 
        ? err.message 
        : 'Camera access denied'
      setCameraError(msg)
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(
        t => t.stop()
      )
      streamRef.current = null
    }
  }

  function flipCamera() {
    setFacingMode(prev => 
      prev === 'environment' ? 'user' : 'environment'
    )
  }

  async function capturePhoto() {
    if (!videoRef.current || 
        !canvasRef.current || 
        !cameraReady) return

    setCapturing(true)

    try {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.drawImage(video, 0, 0)

      // Convert to base64 with quality 0.85
      const imageData = canvas.toDataURL(
        'image/jpeg', 
        0.85
      )

      stopCamera()

      // Store image in sessionStorage and navigate
      sessionStorage.setItem(
        'captured_receipt', 
        imageData
      )
      router.push('/capture/review')
    } finally {
      setCapturing(false)
    }
  }

  async function handleGallery() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement)
        .files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = () => {
        const imageData = reader.result as string
        sessionStorage.setItem(
          'captured_receipt', 
          imageData
        )
        stopCamera()
        router.push('/capture/review')
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }

  return (
    <div className="h-screen bg-black 
      flex flex-col overflow-hidden 
      relative max-w-md mx-auto">

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Camera viewfinder */}
      <div className="relative flex-1 
        overflow-hidden">
        
        {/* Video stream */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full 
            h-full object-cover"
        />

        {/* Dark overlay when not ready */}
        {!cameraReady && !cameraError && (
          <div className="absolute inset-0 
            bg-black flex items-center 
            justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 
                border-white border-t-transparent 
                rounded-full animate-spin 
                mx-auto mb-3" />
              <p className="text-white text-sm">
                Starting camera...
              </p>
            </div>
          </div>
        )}

        {/* Camera error state */}
        {cameraError && (
          <div className="absolute inset-0 
            bg-gray-900 flex items-center 
            justify-center p-6">
            <div className="text-center">
              <div className="text-4xl mb-4">
                📷
              </div>
              <p className="text-white text-sm 
                font-medium mb-2">
                Camera not available
              </p>
              <p className="text-gray-400 text-xs 
                mb-6">
                {cameraError}
              </p>
              <button
                onClick={() => startCamera()}
                className="bg-blue-600 text-white 
                  px-4 py-2 rounded-lg text-sm 
                  font-medium mr-3"
              >
                Try again
              </button>
              <button
                onClick={handleGallery}
                className="bg-gray-700 text-white 
                  px-4 py-2 rounded-lg text-sm 
                  font-medium"
              >
                Upload photo
              </button>
            </div>
          </div>
        )}

        {/* Top bar */}
        <div className="absolute top-0 left-0 
          right-0 flex items-center 
          justify-between p-4 z-10">
          <div className="bg-black/40 
            backdrop-blur-sm rounded-xl px-3 py-2">
            <Logo 
              size="xs" 
              showTagline={false} 
              darkBackground={true} 
            />
          </div>
          
          {/* Flip camera button */}
          <button
            onClick={flipCamera}
            className="w-9 h-9 bg-black/40 
              backdrop-blur-sm rounded-full 
              flex items-center justify-center"
          >
            <span className="text-lg">🔄</span>
          </button>
        </div>

        {/* Corner guide brackets */}
        {cameraReady && (
          <div className="absolute inset-0 
            flex items-center justify-center 
            pointer-events-none">
            <div className="relative w-64 h-44">
              {/* Top left */}
              <div className="absolute top-0 
                left-0 w-6 h-6 border-t-2 
                border-l-2 border-white 
                rounded-tl-sm opacity-80" />
              {/* Top right */}
              <div className="absolute top-0 
                right-0 w-6 h-6 border-t-2 
                border-r-2 border-white 
                rounded-tr-sm opacity-80" />
              {/* Bottom left */}
              <div className="absolute bottom-0 
                left-0 w-6 h-6 border-b-2 
                border-l-2 border-white 
                rounded-bl-sm opacity-80" />
              {/* Bottom right */}
              <div className="absolute bottom-0 
                right-0 w-6 h-6 border-b-2 
                border-r-2 border-white 
                rounded-br-sm opacity-80" />
              
              {/* Guide text */}
              <div className="absolute -bottom-8 
                left-0 right-0 text-center">
                <p className="text-white/70 
                  text-xs">
                  Point at receipt
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="bg-black pb-8 pt-6 px-8
        flex items-center justify-between
        flex-shrink-0">

        {/* Gallery button */}
        <button
          onClick={handleGallery}
          className="flex flex-col items-center 
            gap-1"
        >
          <div className="w-11 h-11 bg-gray-800 
            rounded-xl flex items-center 
            justify-center border border-gray-700">
            <span className="text-xl">🖼️</span>
          </div>
          <span className="text-gray-400 
            text-xs">Gallery</span>
        </button>

        {/* Shutter button */}
        <button
          onClick={capturePhoto}
          disabled={!cameraReady || capturing}
          className="relative disabled:opacity-40"
        >
          {/* Outer ring */}
          <div className="w-20 h-20 rounded-full 
            border-4 border-white flex items-center 
            justify-center">
            {/* Inner circle */}
            <div className={`w-16 h-16 rounded-full 
              transition-all duration-150
              ${capturing 
                ? 'bg-gray-400 scale-90' 
                : 'bg-white'
              }`} 
            />
          </div>
          
          {capturing && (
            <div className="absolute inset-0 
              flex items-center justify-center">
              <div className="w-6 h-6 border-2 
                border-gray-600 border-t-transparent 
                rounded-full animate-spin" />
            </div>
          )}
        </button>

        {/* Dashboard button */}
        <button
          onClick={() => {
            stopCamera()
            router.push('/dashboard')
          }}
          className="flex flex-col items-center 
            gap-1"
        >
          <div className="w-11 h-11 bg-gray-800 
            rounded-xl flex items-center 
            justify-center border border-gray-700">
            <span className="text-xl">📊</span>
          </div>
          <span className="text-gray-400 
            text-xs">Dashboard</span>
        </button>
      </div>
    </div>
  )
}
