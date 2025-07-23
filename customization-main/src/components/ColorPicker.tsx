import React from 'react'
import { SketchPicker } from 'react-color'

// Irgb type for color
export interface Irgb {
  r: number
  g: number
  b: number
}

interface ColorPickerProps {
  color: Irgb
  changeColor: (color: Irgb) => void
}

const ColorPicker: React.FC<ColorPickerProps> = ({ color, changeColor }) => {
  return (
    <div style={{ background: '#111', padding: '10px', borderRadius: '8px', width: 'fit-content' }}>
      <SketchPicker
        color={color}
        disableAlpha
        onChange={(colorResult) => {
          changeColor(colorResult.rgb)
        }}
      />
    </div>
  )
}

export default ColorPicker
