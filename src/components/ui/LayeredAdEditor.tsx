'use client'

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Button } from './Button'
import { Card } from './Card'
import { Input } from './Input'
import { Label } from './Label'
import { Select } from './Select'

interface LayerStyle {
  fontSize?: number
  fontFamily?: string
  color?: string
  backgroundColor?: string
  borderRadius?: number
  textAlign?: 'left' | 'center' | 'right'
  fontWeight?: 'normal' | 'bold' | '600' | '700'
  opacity?: number
  textShadow?: string
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize'
}

interface Layer {
  id: string
  type: 'text' | 'button' | 'image' | 'shape' | 'background'
  content: string
  x: number
  y: number
  width: number
  height: number
  visible: boolean
  style: LayerStyle
  zIndex: number
  shapeType?: 'rectangle' | 'circle' | 'rounded-rectangle'
  imageUrl?: string
  imageShape?: 'rectangle' | 'circle' | 'rounded-rectangle'
  colorOverlay?: {
    enabled: boolean
    color: string
    opacity: number
  }
}

interface Creative {
  id: string
  platform: string
  format: string
  headline: string
  description: string
  call_to_action: string
  punchline?: string
  image_url: string
  dimensions: string
}

interface LayeredAdEditorProps {
  creative: Creative
  brandSettings?: {
    primaryColor: string
    secondaryColor: string
    brandName: string
    logoUrl?: string
  }
  onSave: (layers: Layer[], imageDataUrl: string) => void
  onCancel: () => void
}

const LayeredAdEditor: React.FC<LayeredAdEditorProps> = ({ creative, brandSettings, onSave, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const [layers, setLayers] = useState<Layer[]>([])
  
  // History for undo/redo
  const [history, setHistory] = useState<Layer[][]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
  const [loadedImages, setLoadedImages] = useState<Map<string, HTMLImageElement>>(new Map())
  
  // UI State
  const [canvasBackgroundColor, setCanvasBackgroundColor] = useState('#ffffff')
  const [backgroundImageShape, setBackgroundImageShape] = useState<'rectangle' | 'circle' | 'rounded-rectangle'>('rectangle')
  const [backgroundOverlay, setBackgroundOverlay] = useState({ enabled: false, color: '#000000', opacity: 0.3 })
  const [aspectRatioLocked, setAspectRatioLocked] = useState(false)

  // Parse dimensions from creative data
  const parseDimensions = (dimensionString: string) => {
    // Handle formats like "1200x627", "1200 x 627", "1200*627"
    const match = dimensionString.match(/(\d+)\s*[x*×]\s*(\d+)/i)
    if (match) {
      return { width: parseInt(match[1]), height: parseInt(match[2]) }
    }
    // Default to LinkedIn format if parsing fails
    return { width: 1200, height: 627 }
  }

  const canvasDimensions = parseDimensions(creative.dimensions || "1200x627")
  console.log('🎯 Canvas dimensions:', canvasDimensions, 'from:', creative.dimensions)

  // Save to history for undo/redo
  const saveToHistory = useCallback((newLayers: Layer[]) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push([...newLayers])
    
    // Limit history to 50 items
    if (newHistory.length > 50) {
      newHistory.shift()
    } else {
      setHistoryIndex(prev => prev + 1)
    }
    
    setHistory(newHistory)
  }, [history, historyIndex])

  // Undo function
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1)
      setLayers([...history[historyIndex - 1]])
    }
  }, [history, historyIndex])

  // Redo function
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1)
      setLayers([...history[historyIndex + 1]])
    }
  }, [history, historyIndex])

  const getNextZIndex = () => {
    return Math.max(...layers.map(l => l.zIndex), 0) + 1
  }

  // Initialize layers from creative data
  useEffect(() => {
    console.log('🔍 Initializing layers with:', { creative, brandSettings })
    
    const initialLayers: Layer[] = [
      // Background layer
      {
        id: 'background',
        type: 'background',
        content: '',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        visible: true,
        style: {},
        zIndex: 0,
        imageUrl: creative.image_url
      }
    ]

    // Add logo if available
    if (brandSettings?.logoUrl) {
      console.log('✅ Adding logo layer:', brandSettings.logoUrl)
      initialLayers.push({
        id: 'logo',
        type: 'image',
        content: '',
        x: 5,
        y: 5,
        width: 20,
        height: 20,
        visible: true,
        style: {},
        zIndex: 2,
        imageUrl: brandSettings.logoUrl,
        imageShape: 'rectangle'
      })
    } else {
      console.log('⚠️ No logo URL found in brandSettings')
    }

    // Don't add headline text automatically - let users add it manually
    
    // Add CTA button
    if (creative.call_to_action) {
      initialLayers.push({
        id: 'cta',
        type: 'button',
        content: creative.call_to_action,
        x: 20,
        y: 80,
        width: 60,
        height: 15,
        visible: true,
        style: {
          fontSize: 18,
          fontWeight: 'bold',
          color: '#ffffff',
          backgroundColor: brandSettings?.primaryColor || '#3b82f6',
          borderRadius: 8,
          textAlign: 'center'
        },
        zIndex: 4,
      })
    }

    console.log('🎯 Final initial layers:', initialLayers)
    setLayers(initialLayers)
    saveToHistory(initialLayers)
  }, [creative, brandSettings])

  // Enhanced drawing function with better preview support
  const drawCanvas = useCallback((canvas?: HTMLCanvasElement, isPreview = false) => {
    const targetCanvas = canvas || canvasRef.current
    if (!targetCanvas) return

    const ctx = targetCanvas.getContext('2d')
    if (!ctx) return

    // Clear canvas with background color
    ctx.fillStyle = canvasBackgroundColor
    ctx.fillRect(0, 0, targetCanvas.width, targetCanvas.height)
    
    // Draw layers in z-index order
    const sortedLayers = [...layers].sort((a, b) => a.zIndex - b.zIndex)
    
    sortedLayers.forEach(layer => {
      if (!layer.visible) return
      
      const x = (layer.x / 100) * targetCanvas.width
      const y = (layer.y / 100) * targetCanvas.height
      const layerWidth = (layer.width / 100) * targetCanvas.width
      const layerHeight = (layer.height / 100) * targetCanvas.height
      
      ctx.save()
      ctx.globalAlpha = layer.style.opacity || 1
      
      if (layer.type === 'background' && layer.imageUrl) {
        let img = loadedImages.get(layer.imageUrl)
        
        if (!img) {
          img = new Image()
          
          // Enhanced logo loading with better error handling
          if (!layer.imageUrl!.startsWith('data:')) {
            img.crossOrigin = 'anonymous'
          }
          
          img.onload = () => {
            console.log(`✅ Background loaded: ${layer.imageUrl?.substring(0, 50)}...`)
            setLoadedImages(prev => new Map(prev.set(layer.imageUrl!, img!)))
            // Don't trigger redraw to prevent flickering
          }
          img.onerror = () => {
            console.warn(`⚠️ Background load failed: ${layer.imageUrl?.substring(0, 50)}...`)
          }
          img.src = layer.imageUrl!
        }
        
        if (img.complete && img.naturalWidth > 0) {
          ctx.save()
          
          if (backgroundImageShape === 'circle') {
            ctx.beginPath()
            ctx.arc(x + layerWidth / 2, y + layerHeight / 2, Math.min(layerWidth, layerHeight) / 2, 0, 2 * Math.PI)
            ctx.clip()
          } else if (backgroundImageShape === 'rounded-rectangle') {
            ctx.beginPath()
            ctx.roundRect(x, y, layerWidth, layerHeight, 20)
            ctx.clip()
          }
          
          ctx.drawImage(img, x, y, layerWidth, layerHeight)
          
          if (backgroundOverlay.enabled) {
            ctx.fillStyle = backgroundOverlay.color
            ctx.globalAlpha = backgroundOverlay.opacity
            ctx.fillRect(x, y, layerWidth, layerHeight)
          }
          
          ctx.restore()
        }
      } else if (layer.type === 'image' && layer.imageUrl) {
        if (layer.imageUrl) {
          console.log(`🖼️ Drawing image layer ${layer.id}:`, {
            imageUrl: layer.imageUrl,
            position: { x, y },
            size: { width: layerWidth, height: layerHeight },
            hasLoadedImage: loadedImages.has(layer.imageUrl)
          })
          
          let image = loadedImages.get(layer.imageUrl)
          if (!image) {
            console.log(`📥 Loading image for layer ${layer.id}:`, layer.imageUrl)
            image = new Image()
            
            image.onload = () => {
              console.log(`✅ Image loaded successfully for layer ${layer.id}`)
              setLoadedImages(prev => new Map(prev).set(layer.imageUrl!, image!))
              // Don't trigger immediate redraw to prevent flickering
            }
            
            image.onerror = (error) => {
              console.warn(`⚠️ Failed to load image for layer ${layer.id}, trying without CORS:`, layer.imageUrl)
              // Try loading without crossOrigin as fallback
              const fallbackImage = new Image()
              fallbackImage.onload = () => {
                console.log(`✅ Image loaded successfully for layer ${layer.id} (no CORS)`)
                setLoadedImages(prev => new Map(prev).set(layer.imageUrl!, fallbackImage!))
              }
              fallbackImage.onerror = (fallbackError) => {
                console.error(`❌ Failed to load image for layer ${layer.id} completely:`, layer.imageUrl)
                // Create a simple placeholder without text overlay
                const placeholderCanvas = document.createElement('canvas')
                placeholderCanvas.width = 100
                placeholderCanvas.height = 100
                const ctx = placeholderCanvas.getContext('2d')!
                ctx.fillStyle = layer.id === 'logo' ? '#3b82f6' : '#f3f4f6'
                ctx.fillRect(0, 0, 100, 100)
                
                const placeholderImage = new Image()
                placeholderImage.onload = () => {
                  setLoadedImages(prev => new Map(prev).set(layer.imageUrl!, placeholderImage))
                }
                placeholderImage.src = placeholderCanvas.toDataURL()
              }
              // Don't set crossOrigin for fallback
              fallbackImage.src = layer.imageUrl!
            }
            
            // Only set crossOrigin for external images to handle CORS
            if (layer.imageUrl && layer.imageUrl.startsWith('http')) {
              image.crossOrigin = 'anonymous'
            }
            
            image.src = layer.imageUrl!
            console.log(`🔄 Image loading initiated for layer ${layer.id}`)
          } else {
            console.log(`🎯 Drawing loaded image for layer ${layer.id}`)
            try {
              ctx.save()
              
              // Apply image shape clipping if needed
              if (layer.imageShape === 'circle') {
                ctx.beginPath()
                ctx.arc(x + layerWidth / 2, y + layerHeight / 2, Math.min(layerWidth, layerHeight) / 2, 0, 2 * Math.PI)
                ctx.clip()
              } else if (layer.imageShape === 'rounded-rectangle') {
                const radius = Math.min(layerWidth, layerHeight) * 0.1
                ctx.beginPath()
                ctx.roundRect(x, y, layerWidth, layerHeight, radius)
                ctx.clip()
              }
              
              ctx.drawImage(image, x, y, layerWidth, layerHeight)
              ctx.restore()
              console.log(`✅ Image drawn successfully for layer ${layer.id}`)
            } catch (error) {
              console.error(`❌ Error drawing image for layer ${layer.id}:`, error)
            }
          }
        } else {
          console.warn(`⚠️ Image layer ${layer.id} has no imageUrl`)
        }
      } else if (layer.type === 'text') {
        ctx.font = `${layer.style.fontWeight || 'normal'} ${layer.style.fontSize || 16}px ${layer.style.fontFamily || 'Arial'}`
        ctx.fillStyle = layer.style.color || '#000000'
        ctx.textAlign = (layer.style.textAlign as CanvasTextAlign) || 'left'
        
        const lines = layer.content.split('\n')
        const lineHeight = (layer.style.fontSize || 16) * 1.2
        lines.forEach((line, index) => {
          let textX = x
          if (layer.style.textAlign === 'center') textX = x + layerWidth / 2
          if (layer.style.textAlign === 'right') textX = x + layerWidth
          
          ctx.fillText(line, textX, y + (layer.style.fontSize || 16) + (index * lineHeight))
        })
      } else if (layer.type === 'button') {
        // Draw button background
        if (layer.style.backgroundColor) {
          ctx.fillStyle = layer.style.backgroundColor
          if (layer.style.borderRadius) {
            ctx.beginPath()
            ctx.roundRect(x, y, layerWidth, layerHeight, layer.style.borderRadius)
            ctx.fill()
          } else {
            ctx.fillRect(x, y, layerWidth, layerHeight)
          }
        }
        
        // Draw button text
        ctx.font = `${layer.style.fontWeight || 'normal'} ${layer.style.fontSize || 16}px ${layer.style.fontFamily || 'Arial'}`
        ctx.fillStyle = layer.style.color || '#ffffff'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(layer.content, x + layerWidth / 2, y + layerHeight / 2)
      } else if (layer.type === 'shape') {
        ctx.fillStyle = layer.style.backgroundColor || '#000000'
        
        if (layer.shapeType === 'circle') {
          ctx.beginPath()
          ctx.arc(x + layerWidth / 2, y + layerHeight / 2, Math.min(layerWidth, layerHeight) / 2, 0, 2 * Math.PI)
          ctx.fill()
        } else if (layer.shapeType === 'rounded-rectangle') {
          ctx.beginPath()
          ctx.roundRect(x, y, layerWidth, layerHeight, layer.style.borderRadius || 10)
          ctx.fill()
        } else {
          ctx.fillRect(x, y, layerWidth, layerHeight)
        }
      }
      
      ctx.restore()
    })
    
    // Draw selection outline and resize handles for selected layer (outside layer loop)
    if (selectedLayerId) {
      const selectedLayer = layers.find(l => l.id === selectedLayerId)
      if (selectedLayer) {
        const layerX = (selectedLayer.x / 100) * targetCanvas.width
        const layerY = (selectedLayer.y / 100) * targetCanvas.height
        const layerWidth = (selectedLayer.width / 100) * targetCanvas.width
        const layerHeight = (selectedLayer.height / 100) * targetCanvas.height
        
        // Draw selection outline
        ctx.strokeStyle = '#3b82f6'
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])
        ctx.strokeRect(layerX, layerY, layerWidth, layerHeight)
        ctx.setLineDash([])
        
        // Draw resize handles for non-background layers
        if (selectedLayer.type !== 'background') {
          const handleSize = 8
          const handles = [
            { x: layerX - handleSize/2, y: layerY - handleSize/2 }, // top-left
            { x: layerX + layerWidth - handleSize/2, y: layerY - handleSize/2 }, // top-right
            { x: layerX - handleSize/2, y: layerY + layerHeight - handleSize/2 }, // bottom-left
            { x: layerX + layerWidth - handleSize/2, y: layerY + layerHeight - handleSize/2 } // bottom-right
          ]
          
          handles.forEach(handle => {
            ctx.fillStyle = '#3b82f6'
            ctx.fillRect(handle.x, handle.y, handleSize, handleSize)
            ctx.strokeStyle = '#ffffff'
            ctx.lineWidth = 1
            ctx.strokeRect(handle.x, handle.y, handleSize, handleSize)
          })
        }
      }
    }
  }, [layers, canvasBackgroundColor, backgroundImageShape, backgroundOverlay, selectedLayerId, loadedImages])

  // Update both canvases when layers change
  useEffect(() => {
    drawCanvas()
    if (previewCanvasRef.current) {
      drawCanvas(previewCanvasRef.current, true)
    }
  }, [drawCanvas])

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const mouseX = ((e.clientX - rect.left) / rect.width) * 100
    const mouseY = ((e.clientY - rect.top) / rect.height) * 100
    
    const selectedLayer = layers.find(l => l.id === selectedLayerId)
    
    // Check if clicking on resize handle first
    if (selectedLayer && selectedLayer.type !== 'background') {
      const handleSize = 3 // Percentage-based handle size for click detection
      
      const handles = [
        { x: selectedLayer.x - handleSize/2, y: selectedLayer.y - handleSize/2, handle: 'top-left' },
        { x: selectedLayer.x + selectedLayer.width - handleSize/2, y: selectedLayer.y - handleSize/2, handle: 'top-right' },
        { x: selectedLayer.x - handleSize/2, y: selectedLayer.y + selectedLayer.height - handleSize/2, handle: 'bottom-left' },
        { x: selectedLayer.x + selectedLayer.width - handleSize/2, y: selectedLayer.y + selectedLayer.height - handleSize/2, handle: 'bottom-right' }
      ]
      
      const clickedHandle = handles.find(handle => 
        mouseX >= handle.x && mouseX <= handle.x + handleSize &&
        mouseY >= handle.y && mouseY <= handle.y + handleSize
      )
      
      if (clickedHandle) {
        setIsResizing(true)
        setResizeHandle(clickedHandle.handle)
        setDragStart({ x: mouseX, y: mouseY })
        return
      }
    }
    
    // Find clicked layer (including background, from top to bottom by z-index)
    const sortedLayers = [...layers].sort((a, b) => b.zIndex - a.zIndex)
    const clickedLayer = sortedLayers.find(layer => 
      mouseX >= layer.x && mouseX <= layer.x + layer.width &&
      mouseY >= layer.y && mouseY <= layer.y + layer.height
    )
    
    if (clickedLayer) {
      setSelectedLayerId(clickedLayer.id)
      setIsDragging(true)
      setDragOffset({ x: mouseX - clickedLayer.x, y: mouseY - clickedLayer.y })
    } else {
      setSelectedLayerId(null)
    }
  }

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement> | MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas || (!isDragging && !isResizing)) return
    
    const rect = canvas.getBoundingClientRect()
    const mouseX = ((e.clientX - rect.left) / rect.width) * 100
    const mouseY = ((e.clientY - rect.top) / rect.height) * 100
    
    if (isResizing && selectedLayerId) {
      const selectedLayer = layers.find(l => l.id === selectedLayerId)
      if (!selectedLayer || !dragStart) return
      
      const deltaX = mouseX - dragStart.x
      const deltaY = mouseY - dragStart.y
      
      setLayers(prev => prev.map(layer => {
        if (layer.id === selectedLayerId) {
          let newLayer = { ...layer }
          
          switch (resizeHandle) {
            case 'top-left':
              newLayer.x = Math.max(-50, layer.x + deltaX)
              newLayer.y = Math.max(-50, layer.y + deltaY)
              newLayer.width = Math.max(5, layer.width - deltaX)
              newLayer.height = Math.max(5, layer.height - deltaY)
              break
            case 'top-right':
              newLayer.y = Math.max(-50, layer.y + deltaY)
              newLayer.width = Math.max(5, layer.width + deltaX)
              newLayer.height = Math.max(5, layer.height - deltaY)
              break
            case 'bottom-left':
              newLayer.x = Math.max(-50, layer.x + deltaX)
              newLayer.width = Math.max(5, layer.width - deltaX)
              newLayer.height = Math.max(5, layer.height + deltaY)
              break
            case 'bottom-right':
              newLayer.width = Math.max(5, layer.width + deltaX)
              newLayer.height = Math.max(5, layer.height + deltaY)
              break
          }
          
          // Allow movement beyond canvas bounds but keep some reasonable limits
          if (newLayer.x + newLayer.width > 150) newLayer.width = 150 - newLayer.x
          if (newLayer.y + newLayer.height > 150) newLayer.height = 150 - newLayer.y
          
          return newLayer
        }
        return layer
      }))
      
      setDragStart({ x: mouseX, y: mouseY })
    } else if (isDragging && selectedLayerId && dragOffset) {
      // Handle dragging - allow negative positions for partial off-canvas placement
      const newX = Math.max(-50, Math.min(150, mouseX - dragOffset.x))
      const newY = Math.max(-50, Math.min(150, mouseY - dragOffset.y))
      
      setLayers(prev => prev.map(layer => 
        layer.id === selectedLayerId 
          ? { ...layer, x: newX, y: newY }
          : layer
      ))
    }
  }, [isDragging, isResizing, selectedLayerId, layers, dragOffset, dragStart, resizeHandle])

  // Add global mouse event listeners
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging || isResizing) {
        handleMouseMove(e)
      }
    }
    
    const handleGlobalMouseUp = () => {
      handleMouseUp()
    }
    
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)
    }
    
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [isDragging, isResizing, handleMouseMove])

  const handleMouseUp = () => {
    if (isDragging || isResizing) {
      const newLayers = [...layers]
      saveToHistory(newLayers)
    }
    setIsDragging(false)
    setIsResizing(false)
    setResizeHandle(null)
    setDragStart(null)
    setDragOffset({ x: 0, y: 0 })
  }

  // Add layer functions
  const addTextLayer = () => {
    const newLayer: Layer = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: 'New Text',
      x: 25,
      y: 40,
      width: 50,
      height: 20,
      visible: true,
      style: {
        fontSize: 20,
        color: '#ffffff',
        textAlign: 'center'
      },
      zIndex: getNextZIndex(),
    }
    const newLayers = [...layers, newLayer]
    setLayers(newLayers)
    saveToHistory(newLayers)
  }

  const addButtonLayer = () => {
    const newLayer: Layer = {
      id: `button-${Date.now()}`,
      type: 'button',
      content: 'Click Here',
      x: 25,
      y: 70,
      width: 50,
      height: 15,
      visible: true,
      style: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
        backgroundColor: brandSettings?.primaryColor || '#3b82f6',
        borderRadius: 8,
        textAlign: 'center'
      },
      zIndex: getNextZIndex(),
    }
    const newLayers = [...layers, newLayer]
    setLayers(newLayers)
    saveToHistory(newLayers)
  }

  const addLogoLayer = () => {
    if (!brandSettings?.logoUrl) return
    
    const newLayer: Layer = {
      id: `logo-${Date.now()}`,
      type: 'image',
      content: '',
      x: 5,
      y: 5,
      width: 20,
      height: 20,
      visible: true,
      style: {},
      zIndex: getNextZIndex(),
      imageUrl: brandSettings.logoUrl,
      imageShape: 'rectangle'
    }
    const newLayers = [...layers, newLayer]
    setLayers(newLayers)
    saveToHistory(newLayers)
  }

  const addImageLayer = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string
          const newLayer: Layer = {
            id: `image-${Date.now()}`,
            type: 'image',
            content: '',
            x: 20,
            y: 20,
            width: 40,
            height: 40,
            visible: true,
            style: {},
            zIndex: getNextZIndex(),
            imageUrl,
            imageShape: 'rectangle'
          }
          const newLayers = [...layers, newLayer]
          setLayers(newLayers)
          saveToHistory(newLayers)
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  const addShapeLayer = (shapeType: 'rectangle' | 'circle' | 'rounded-rectangle') => {
    const newLayer: Layer = {
      id: `shape-${Date.now()}`,
      type: 'shape',
      content: '',
      x: 30,
      y: 30,
      width: 40,
      height: 40,
      visible: true,
      style: {
        backgroundColor: brandSettings?.primaryColor || '#3b82f6',
        borderRadius: shapeType === 'rounded-rectangle' ? 10 : 0
      },
      zIndex: getNextZIndex(),
      shapeType
    }
    const newLayers = [...layers, newLayer]
    setLayers(newLayers)
    saveToHistory(newLayers)
  }

  const exportImage = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    try {
      // First try the normal export
      const imageDataUrl = canvas.toDataURL('image/png')
      onSave(layers, imageDataUrl)
    } catch (error) {
      console.log('⚠️ Canvas tainted by CORS, creating clean export canvas...')
      
      // Create a new clean canvas for export
      const exportCanvas = document.createElement('canvas')
      exportCanvas.width = canvas.width
      exportCanvas.height = canvas.height
      const exportCtx = exportCanvas.getContext('2d')!
      
      // Fill background color
      exportCtx.fillStyle = canvasBackgroundColor
      exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height)
      
      // Convert external images to data URLs
      const convertImageToDataUrl = async (imageUrl: string): Promise<string | null> => {
        try {
          const proxyCanvas = document.createElement('canvas')
          const proxyCtx = proxyCanvas.getContext('2d')!
          const img = new Image()
          
          return new Promise((resolve) => {
            img.onload = () => {
              proxyCanvas.width = img.width
              proxyCanvas.height = img.height
              proxyCtx.drawImage(img, 0, 0)
              try {
                resolve(proxyCanvas.toDataURL('image/png'))
              } catch {
                resolve(null)
              }
            }
            img.onerror = () => resolve(null)
            
            // Try loading without CORS restrictions
            img.src = imageUrl
          })
        } catch {
          return null
        }
      }
      
      // Redraw all layers on clean canvas
      for (const layer of layers.filter(l => l.visible)) {
        const x = (layer.x / 100) * exportCanvas.width
        const y = (layer.y / 100) * exportCanvas.height
        const layerWidth = (layer.width / 100) * exportCanvas.width
        const layerHeight = (layer.height / 100) * exportCanvas.height
        
        exportCtx.save()
        
        if (layer.type === 'background') {
          // Skip background images to avoid CORS
          if (backgroundOverlay.enabled) {
            exportCtx.fillStyle = backgroundOverlay.color
            exportCtx.globalAlpha = backgroundOverlay.opacity
            exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height)
          }
        } else if (layer.type === 'text') {
          // Draw text
          exportCtx.font = `${layer.style.fontWeight || 'normal'} ${layer.style.fontSize || 16}px ${layer.style.fontFamily || 'Arial'}`
          exportCtx.fillStyle = layer.style.color || '#000000'
          exportCtx.textAlign = (layer.style.textAlign || 'left') as CanvasTextAlign
          exportCtx.fillText(layer.content, x, y + (layer.style.fontSize || 16))
        } else if (layer.type === 'button') {
          // Draw button background
          exportCtx.fillStyle = layer.style.backgroundColor || '#007bff'
          if (layer.style.borderRadius) {
            exportCtx.beginPath()
            exportCtx.roundRect(x, y, layerWidth, layerHeight, layer.style.borderRadius)
            exportCtx.fill()
          } else {
            exportCtx.fillRect(x, y, layerWidth, layerHeight)
          }
          
          // Draw button text
          exportCtx.fillStyle = layer.style.color || '#ffffff'
          exportCtx.font = `${layer.style.fontWeight || 'bold'} ${layer.style.fontSize || 14}px ${layer.style.fontFamily || 'Arial'}`
          exportCtx.textAlign = 'center'
          exportCtx.fillText(layer.content, x + layerWidth / 2, y + layerHeight / 2 + (layer.style.fontSize || 14) / 3)
        } else if (layer.type === 'shape') {
          // Draw shapes
          exportCtx.fillStyle = layer.style.backgroundColor || '#cccccc'
          if (layer.shapeType === 'circle') {
            exportCtx.beginPath()
            exportCtx.arc(x + layerWidth / 2, y + layerHeight / 2, Math.min(layerWidth, layerHeight) / 2, 0, 2 * Math.PI)
            exportCtx.fill()
          } else if (layer.shapeType === 'rounded-rectangle') {
            const radius = Math.min(layerWidth, layerHeight) * 0.1
            exportCtx.beginPath()
            exportCtx.roundRect(x, y, layerWidth, layerHeight, radius)
            exportCtx.fill()
          } else {
            exportCtx.fillRect(x, y, layerWidth, layerHeight)
          }
        } else if (layer.type === 'image' && layer.imageUrl) {
          // Try to convert and draw image, fallback to placeholder
          const dataUrl = await convertImageToDataUrl(layer.imageUrl)
          if (dataUrl) {
            const img = new Image()
            img.onload = () => {
              exportCtx.save()
              if (layer.imageShape === 'circle') {
                exportCtx.beginPath()
                exportCtx.arc(x + layerWidth / 2, y + layerHeight / 2, Math.min(layerWidth, layerHeight) / 2, 0, 2 * Math.PI)
                exportCtx.clip()
              } else if (layer.imageShape === 'rounded-rectangle') {
                const radius = Math.min(layerWidth, layerHeight) * 0.1
                exportCtx.beginPath()
                exportCtx.roundRect(x, y, layerWidth, layerHeight, radius)
                exportCtx.clip()
              }
              exportCtx.drawImage(img, x, y, layerWidth, layerHeight)
              exportCtx.restore()
            }
            img.src = dataUrl
          } else {
            // Fallback to placeholder
            exportCtx.fillStyle = '#f0f0f0'
            exportCtx.fillRect(x, y, layerWidth, layerHeight)
            exportCtx.strokeStyle = '#ccc'
            exportCtx.strokeRect(x, y, layerWidth, layerHeight)
            exportCtx.fillStyle = '#999'
            exportCtx.font = '14px Arial'
            exportCtx.textAlign = 'center'
            exportCtx.fillText(layer.id === 'logo' ? 'Logo' : 'Image', x + layerWidth / 2, y + layerHeight / 2)
          }
        }
        
        exportCtx.restore()
      }
      
      // Wait a moment for any async images to load, then export
      setTimeout(() => {
        const cleanImageDataUrl = exportCanvas.toDataURL('image/png')
        onSave(layers, cleanImageDataUrl)
      }, 1000)
    }
  }

  const selectedLayer = selectedLayerId ? layers.find(l => l.id === selectedLayerId) : null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[95%] h-[95%] flex">
        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="border-b p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button 
                onClick={undo} 
                disabled={historyIndex <= 0}
                variant="outline" 
                size="sm"
                className="text-sm px-3 py-2 h-auto"
              >
                ↶ Undo
              </Button>
              <Button 
                onClick={redo} 
                disabled={historyIndex >= history.length - 1}
                variant="outline" 
                size="sm"
                className="text-sm px-3 py-2 h-auto"
              >
                ↷ Redo
              </Button>

            </div>
            <div className="flex items-center gap-2">
              <Button onClick={exportImage} className="bg-green-600 hover:bg-green-700 text-sm px-4 py-2 h-auto">
                Save Creative
              </Button>
              <Button onClick={onCancel} variant="outline" className="text-sm px-4 py-2 h-auto">
                Cancel
              </Button>
            </div>
          </div>

          {/* Canvas Container */}
          <div className="flex-1 flex">
            {/* Edit Canvas */}
            <div className="flex-1 p-4 flex flex-col items-center justify-center">
              <h3 className="text-lg font-semibold mb-2">Edit Canvas</h3>
              <div className="border border-gray-300 inline-block">
                <canvas
                  ref={canvasRef}
                  width={canvasDimensions.width}
                  height={canvasDimensions.height}
                  className="border"
                  style={{ 
                    maxWidth: '600px', 
                    maxHeight: '400px',
                    width: 'auto',
                    height: 'auto',
                    aspectRatio: `${canvasDimensions.width}/${canvasDimensions.height}`
                  }}
                  onMouseDown={handleMouseDown}
                />
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {canvasDimensions.width} × {canvasDimensions.height}px
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 border-l bg-gray-50 flex flex-col">
          {/* Creative Info */}
          <div className="p-4 border-b bg-white">
            <h2 className="text-lg font-semibold mb-2">Edit Creative</h2>
            <div className="space-y-1 text-sm text-gray-600">
              <div>Platform: {creative.platform}</div>
              <div>Format: {creative.format}</div>
              <div>Dimensions: {creative.dimensions}</div>
            </div>
          </div>

          {/* Add Elements */}
          <div className="p-4 border-b bg-white">
            <h3 className="font-semibold mb-3">Add Elements</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={addTextLayer} variant="outline" size="sm" className="text-xs px-2 py-1 h-8 min-h-0">
                📝 Add Text
              </Button>
              <Button onClick={addButtonLayer} variant="outline" size="sm" className="text-xs px-2 py-1 h-8 min-h-0">
                🔘 Add Button
              </Button>
              <Button onClick={addImageLayer} variant="outline" size="sm" className="text-xs px-2 py-1 h-8 min-h-0">
                🖼️ Add Image
              </Button>
              <Button onClick={addLogoLayer} variant="outline" size="sm" disabled={!brandSettings?.logoUrl} className="text-xs px-2 py-1 h-8 min-h-0">
                🏢 Add Logo
              </Button>
              <Button onClick={() => addShapeLayer('rectangle')} variant="outline" size="sm" className="text-xs px-2 py-1 h-8 min-h-0">
                ⬜ Rectangle
              </Button>
              <Button onClick={() => addShapeLayer('circle')} variant="outline" size="sm" className="text-xs px-2 py-1 h-8 min-h-0">
                ⭕ Circle
              </Button>
            </div>
          </div>

          {/* Layers */}
          <div className="p-4 border-b bg-white">
            <h3 className="font-semibold mb-3">Layers</h3>
            <div className="space-y-2">
              {[...layers].sort((a, b) => b.zIndex - a.zIndex).map(layer => (
                <div key={layer.id} className="border border-gray-200 rounded">
                  {/* Layer Header */}
                  <div
                    className={`p-2 cursor-pointer transition-all duration-200 ${
                      selectedLayerId === layer.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedLayerId(selectedLayerId === layer.id ? null : layer.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            const newLayers = layers.map(l => 
                              l.id === layer.id ? { ...l, visible: !l.visible } : l
                            )
                            setLayers(newLayers)
                            saveToHistory(newLayers)
                          }}
                          className="text-xs"
                        >
                          {layer.visible ? '👁️' : '🙈'}
                        </button>
                        <span className="text-sm font-medium">
                          {layer.type === 'background' ? 'Background' : 
                           layer.type === 'button' ? `Button: ${layer.content}` :
                           layer.type === 'text' ? `Text: ${layer.content.substring(0, 20)}` :
                           layer.type === 'image' ? (layer.id === 'logo' ? 'Logo' : 'Image') :
                           'Shape'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {selectedLayerId === layer.id ? '▼' : '▶'}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          const newLayers = layers.filter(l => l.id !== layer.id)
                          setLayers(newLayers)
                          saveToHistory(newLayers)
                          if (selectedLayerId === layer.id) {
                            setSelectedLayerId(null)
                          }
                        }}
                        className="text-xs text-red-500 hover:bg-red-50 px-1 rounded"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Expandable Layer Controls */}
                  <div className={`transition-all duration-300 overflow-hidden ${
                    selectedLayerId === layer.id ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="p-3 border-t bg-gray-50 space-y-3">
                      
                      {/* Background Controls */}
                      {layer.type === 'background' && (
                        <>
                          <div>
                            <Label className="text-xs font-medium">Canvas Background</Label>
                          </div>
                          <div>
                            <Label className="text-xs">Color</Label>
                            <input
                              type="color"
                              value={canvasBackgroundColor}
                              onChange={(e) => setCanvasBackgroundColor(e.target.value)}
                              className="w-full h-8 border border-gray-300 rounded"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Shape</Label>
                            <select
                              value={backgroundImageShape}
                              onChange={(e) => 
                                setBackgroundImageShape(e.target.value as 'rectangle' | 'circle' | 'rounded-rectangle')
                              }
                              className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-sm"
                            >
                              <option value="rectangle">Rectangle</option>
                              <option value="rounded-rectangle">Rounded Rectangle</option>
                              <option value="circle">Circle</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`overlay-${layer.id}`}
                                checked={backgroundOverlay.enabled}
                                onChange={(e) => setBackgroundOverlay(prev => ({ ...prev, enabled: e.target.checked }))}
                              />
                              <Label htmlFor={`overlay-${layer.id}`} className="text-xs">Color Overlay</Label>
                            </div>
                            {backgroundOverlay.enabled && (
                              <>
                                <div>
                                  <Label className="text-xs">Overlay Color</Label>
                                  <input
                                    type="color"
                                    value={backgroundOverlay.color}
                                    onChange={(e) => setBackgroundOverlay(prev => ({ ...prev, color: e.target.value }))}
                                    className="w-full h-8 border border-gray-300 rounded"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">Opacity: {Math.round(backgroundOverlay.opacity * 100)}%</Label>
                                  <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={backgroundOverlay.opacity}
                                    onChange={(e) => setBackgroundOverlay(prev => ({ ...prev, opacity: parseFloat(e.target.value) }))}
                                    className="w-full"
                                  />
                                </div>
                              </>
                            )}
                          </div>
                          
                          {/* Background Position & Size Controls */}
                          <div className="border-t pt-2 mt-2">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-xs">X: {Math.round(layer.x)}%</Label>
                                <input
                                  type="range"
                                  min="-50"
                                  max="150"
                                  value={layer.x}
                                  onChange={(e) => {
                                    const newLayers = layers.map(l => 
                                      l.id === layer.id ? { ...l, x: parseInt(e.target.value) } : l
                                    )
                                    setLayers(newLayers)
                                  }}
                                  className="w-full"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Y: {Math.round(layer.y)}%</Label>
                                <input
                                  type="range"
                                  min="-50"
                                  max="150"
                                  value={layer.y}
                                  onChange={(e) => {
                                    const newLayers = layers.map(l => 
                                      l.id === layer.id ? { ...l, y: parseInt(e.target.value) } : l
                                    )
                                    setLayers(newLayers)
                                  }}
                                  className="w-full"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <div>
                                <Label className="text-xs">Width: {Math.round(layer.width)}%</Label>
                                <input
                                  type="range"
                                  min="5"
                                  max="100"
                                  value={layer.width}
                                  onChange={(e) => {
                                    const newLayers = layers.map(l => 
                                      l.id === layer.id ? { ...l, width: parseInt(e.target.value) } : l
                                    )
                                    setLayers(newLayers)
                                  }}
                                  className="w-full"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Height: {Math.round(layer.height)}%</Label>
                                <input
                                  type="range"
                                  min="5"
                                  max="100"
                                  value={layer.height}
                                  onChange={(e) => {
                                    const newLayers = layers.map(l => 
                                      l.id === layer.id ? { ...l, height: parseInt(e.target.value) } : l
                                    )
                                    setLayers(newLayers)
                                  }}
                                  className="w-full"
                                />
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Text Layer Controls */}
                      {layer.type === 'text' && (
                        <>
                          <div>
                            <Label className="text-xs font-medium">Text Content</Label>
                            <input
                              type="text"
                              value={layer.content}
                              onChange={(e) => {
                                const newLayers = layers.map(l => 
                                  l.id === layer.id ? { ...l, content: e.target.value } : l
                                )
                                setLayers(newLayers)
                              }}
                              className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="Enter text..."
                            />
                          </div>
                          
                          <div>
                            <Label className="text-xs">Font Size: {layer.style.fontSize || 16}px</Label>
                            <input
                              type="range"
                              min="8"
                              max="72"
                              value={layer.style.fontSize || 16}
                              onChange={(e) => {
                                const newLayers = layers.map(l => 
                                  l.id === layer.id ? { 
                                    ...l, 
                                    style: { ...l.style, fontSize: parseInt(e.target.value) }
                                  } : l
                                )
                                setLayers(newLayers)
                              }}
                              className="w-full"
                            />
                          </div>

                          <div>
                            <Label className="text-xs">Color</Label>
                            <input
                              type="color"
                              value={layer.style.color || '#000000'}
                              onChange={(e) => {
                                const newLayers = layers.map(l => 
                                  l.id === layer.id ? { 
                                    ...l, 
                                    style: { ...l.style, color: e.target.value }
                                  } : l
                                )
                                setLayers(newLayers)
                              }}
                              className="w-full h-8 border border-gray-300 rounded"
                            />
                          </div>

                          <div>
                            <Label className="text-xs">Font Weight</Label>
                            <select
                              value={layer.style.fontWeight || 'normal'}
                              onChange={(e) => {
                                const newLayers = layers.map(l => 
                                  l.id === layer.id ? { 
                                    ...l, 
                                    style: { ...l.style, fontWeight: e.target.value as 'normal' | 'bold' | '600' | '700' }
                                  } : l
                                )
                                setLayers(newLayers)
                              }}
                              className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-sm"
                            >
                              <option value="normal">Normal</option>
                              <option value="bold">Bold</option>
                              <option value="600">Semi Bold</option>
                              <option value="800">Extra Bold</option>
                            </select>
                          </div>
                        </>
                      )}

                      {/* Logo Layer Controls */}
                      {(layer.type === 'image' && layer.id === 'logo') && (
                        <>
                          <div>
                            <Label className="text-xs font-medium">Logo Settings</Label>
                          </div>
                          <div>
                            <Label className="text-xs">Shape</Label>
                            <select
                              value={layer.imageShape || 'rectangle'}
                              onChange={(e) => {
                                const newLayers = layers.map(l => 
                                  l.id === layer.id ? { ...l, imageShape: e.target.value as any } : l
                                )
                                setLayers(newLayers)
                              }}
                              className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-sm"
                            >
                              <option value="rectangle">Rectangle</option>
                              <option value="rounded-rectangle">Rounded Rectangle</option>
                              <option value="circle">Circle</option>
                            </select>
                          </div>
                        </>
                      )}

                      {/* Button Layer Controls */}
                      {layer.type === 'button' && (
                        <>
                          <div>
                            <Label className="text-xs">Button Text</Label>
                            <input
                              type="text"
                              value={layer.content}
                              onChange={(e) => {
                                const newLayers = layers.map(l => 
                                  l.id === layer.id ? { ...l, content: e.target.value } : l
                                )
                                setLayers(newLayers)
                              }}
                              className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Background Color</Label>
                            <input
                              type="color"
                              value={layer.style.backgroundColor || '#007bff'}
                              onChange={(e) => {
                                const newLayers = layers.map(l => 
                                  l.id === layer.id ? { 
                                    ...l, 
                                    style: { ...l.style, backgroundColor: e.target.value }
                                  } : l
                                )
                                setLayers(newLayers)
                              }}
                              className="w-full h-8 border border-gray-300 rounded"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Text Color</Label>
                            <input
                              type="color"
                              value={layer.style.color || '#ffffff'}
                              onChange={(e) => {
                                const newLayers = layers.map(l => 
                                  l.id === layer.id ? { 
                                    ...l, 
                                    style: { ...l.style, color: e.target.value }
                                  } : l
                                )
                                setLayers(newLayers)
                              }}
                              className="w-full h-8 border border-gray-300 rounded"
                            />
                          </div>
                        </>
                      )}

                      {/* Common Position & Size Controls for Non-Background Layers */}
                      {layer.type !== 'background' && (
                        <div className="border-t pt-2 mt-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs">X: {Math.round(layer.x)}%</Label>
                              <input
                                type="range"
                                min="-50"
                                max="150"
                                value={layer.x}
                                onChange={(e) => {
                                  const newLayers = layers.map(l => 
                                    l.id === layer.id ? { ...l, x: parseInt(e.target.value) } : l
                                  )
                                  setLayers(newLayers)
                                }}
                                className="w-full"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Y: {Math.round(layer.y)}%</Label>
                              <input
                                type="range"
                                min="-50"
                                max="150"
                                value={layer.y}
                                onChange={(e) => {
                                  const newLayers = layers.map(l => 
                                    l.id === layer.id ? { ...l, y: parseInt(e.target.value) } : l
                                  )
                                  setLayers(newLayers)
                                }}
                                className="w-full"
                              />
                            </div>
                          </div>

                          <div className="mt-2">
                            <div className="flex items-center gap-2 mb-2">
                              <Label className="text-xs">Size</Label>
                              <button
                                onClick={() => setAspectRatioLocked(!aspectRatioLocked)}
                                className={`text-xs px-2 py-1 rounded border ${
                                  aspectRatioLocked ? 'bg-blue-100 border-blue-300' : 'bg-gray-100 border-gray-300'
                                }`}
                              >
                                🔗 {aspectRatioLocked ? 'Linked' : 'Unlinked'}
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-xs">Width: {Math.round(layer.width)}%</Label>
                                <input
                                  type="range"
                                  min="5"
                                  max="100"
                                  value={layer.width}
                                  onChange={(e) => {
                                    const newWidth = parseInt(e.target.value)
                                    const newLayers = layers.map(l => {
                                      if (l.id === layer.id) {
                                        const newLayer = { ...l, width: newWidth }
                                        if (aspectRatioLocked) {
                                          const aspectRatio = l.width / l.height
                                          newLayer.height = newWidth / aspectRatio
                                        }
                                        return newLayer
                                      }
                                      return l
                                    })
                                    setLayers(newLayers)
                                  }}
                                  className="w-full"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Height: {Math.round(layer.height)}%</Label>
                                <input
                                  type="range"
                                  min="5"
                                  max="100"
                                  value={layer.height}
                                  onChange={(e) => {
                                    const newHeight = parseInt(e.target.value)
                                    const newLayers = layers.map(l => {
                                      if (l.id === layer.id) {
                                        const newLayer = { ...l, height: newHeight }
                                        if (aspectRatioLocked) {
                                          const aspectRatio = l.width / l.height
                                          newLayer.width = newHeight * aspectRatio
                                        }
                                        return newLayer
                                      }
                                      return l
                                    })
                                    setLayers(newLayers)
                                  }}
                                  className="w-full"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => {
                                const newLayers = layers.map(l => 
                                  l.id === layer.id ? { ...l, zIndex: l.zIndex + 1 } : l
                                )
                                setLayers(newLayers)
                                saveToHistory(newLayers)
                              }}
                              className="text-xs px-2 py-1 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"
                            >
                              Bring Forward
                            </button>
                            <button
                              onClick={() => {
                                const newLayers = layers.map(l => 
                                  l.id === layer.id ? { ...l, zIndex: Math.max(1, l.zIndex - 1) } : l
                                )
                                setLayers(newLayers)
                                saveToHistory(newLayers)
                              }}
                              className="text-xs px-2 py-1 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"
                            >
                              Send Back
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Layer Properties */}
          {selectedLayer && selectedLayer.type !== 'background' && (
            <div className="flex-1 p-4 bg-white overflow-y-auto">
              <h3 className="font-semibold mb-3">Layer Controls</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">X: {Math.round(selectedLayer.x)}%</Label>
                    <input
                      type="range"
                      min="-50"
                      max="150"
                      value={selectedLayer.x}
                      onChange={(e) => {
                        const newLayers = layers.map(l => 
                          l.id === selectedLayerId ? { ...l, x: parseInt(e.target.value) } : l
                        )
                        setLayers(newLayers)
                      }}
                      onMouseUp={() => saveToHistory(layers)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Y: {Math.round(selectedLayer.y)}%</Label>
                    <input
                      type="range"
                      min="-50"
                      max="150"
                      value={selectedLayer.y}
                      onChange={(e) => {
                        const newLayers = layers.map(l => 
                          l.id === selectedLayerId ? { ...l, y: parseInt(e.target.value) } : l
                        )
                        setLayers(newLayers)
                      }}
                      onMouseUp={() => saveToHistory(layers)}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Size</span>
                    <Button
                      onClick={() => setAspectRatioLocked(!aspectRatioLocked)}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      {aspectRatioLocked ? '🔗 Linked' : '🔓 Unlinked'}
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Width: {Math.round(selectedLayer.width)}%</Label>
                      <input
                        type="range"
                        min="5"
                        max="100"
                        value={selectedLayer.width}
                        onChange={(e) => {
                          const newWidth = parseInt(e.target.value)
                          const newLayers = layers.map(l => {
                            if (l.id === selectedLayerId) {
                              const newLayer = { ...l, width: newWidth }
                              if (aspectRatioLocked) {
                                const aspectRatio = l.width / l.height
                                newLayer.height = newWidth / aspectRatio
                              }
                              return newLayer
                            }
                            return l
                          })
                          setLayers(newLayers)
                        }}
                        onMouseUp={() => saveToHistory(layers)}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Height: {Math.round(selectedLayer.height)}%</Label>
                      <input
                        type="range"
                        min="5"
                        max="100"
                        value={selectedLayer.height}
                        onChange={(e) => {
                          const newHeight = parseInt(e.target.value)
                          const newLayers = layers.map(l => {
                            if (l.id === selectedLayerId) {
                              const newLayer = { ...l, height: newHeight }
                              if (aspectRatioLocked) {
                                const aspectRatio = l.width / l.height
                                newLayer.width = newHeight * aspectRatio
                              }
                              return newLayer
                            }
                            return l
                          })
                          setLayers(newLayers)
                        }}
                        onMouseUp={() => saveToHistory(layers)}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Text Layer Controls */}
                {selectedLayer.type === 'text' && (
                  <div className="space-y-3 border-t pt-3">
                    <h4 className="text-sm font-medium">Text Content</h4>
                    <div>
                      <Label className="text-xs">Text</Label>
                      <Input
                        value={selectedLayer.content}
                        onChange={(e) => {
                          const newLayers = layers.map(l => 
                            l.id === selectedLayerId ? { ...l, content: e.target.value } : l
                          )
                          setLayers(newLayers)
                        }}
                        onBlur={() => saveToHistory(layers)}
                        placeholder="Enter your text"
                        className="text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Font Size</Label>
                        <input
                          type="range"
                          min="8"
                          max="72"
                          value={selectedLayer.style.fontSize || 16}
                          onChange={(e) => {
                            const newLayers = layers.map(l => 
                              l.id === selectedLayerId ? { 
                                ...l, 
                                style: { ...l.style, fontSize: parseInt(e.target.value) }
                              } : l
                            )
                            setLayers(newLayers)
                          }}
                          onMouseUp={() => saveToHistory(layers)}
                          className="w-full"
                        />
                        <span className="text-xs text-gray-500">{selectedLayer.style.fontSize || 16}px</span>
                      </div>
                      <div>
                        <Label className="text-xs">Color</Label>
                        <Input
                          type="color"
                          value={selectedLayer.style.color || '#000000'}
                          onChange={(e) => {
                            const newLayers = layers.map(l => 
                              l.id === selectedLayerId ? { 
                                ...l, 
                                style: { ...l.style, color: e.target.value }
                              } : l
                            )
                            setLayers(newLayers)
                            saveToHistory(newLayers)
                          }}
                          className="h-8"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Font Weight</Label>
                      <select
                        value={selectedLayer.style.fontWeight || 'normal'}
                        onChange={(e) => {
                          const newLayers = layers.map(l => 
                            l.id === selectedLayerId ? { 
                              ...l, 
                              style: { ...l.style, fontWeight: e.target.value as 'normal' | 'bold' | '600' | '700' }
                            } : l
                          )
                          setLayers(newLayers)
                          saveToHistory(newLayers)
                        }}
                        className="w-full p-2 border rounded text-sm"
                      >
                        <option value="normal">Normal</option>
                        <option value="bold">Bold</option>
                        <option value="600">Semi Bold</option>
                        <option value="700">Extra Bold</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <Button 
                    onClick={() => {
                      const newLayers = layers.map(l => 
                        l.id === selectedLayerId ? { ...l, zIndex: l.zIndex + 1 } : l
                      )
                      setLayers(newLayers)
                      saveToHistory(newLayers)
                    }}
                    variant="outline" 
                    size="sm"
                  >
                    Bring Forward
                  </Button>
                  <Button 
                    onClick={() => {
                      const newLayers = layers.map(l => 
                        l.id === selectedLayerId ? { ...l, zIndex: Math.max(1, l.zIndex - 1) } : l
                      )
                      setLayers(newLayers)
                      saveToHistory(newLayers)
                    }}
                    variant="outline" 
                    size="sm"
                  >
                    Send Back
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LayeredAdEditor 