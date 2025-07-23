import { useEffect } from 'react'
import { useGLTF, useTexture, Decal } from '@react-three/drei'
import * as THREE from 'three'

import modelGltf from '../assets/3d/tshirt.glb'
import { Irgb } from '../types'

const Tshirt = ({
  logo,
  full,
  color,
  logoP,
  logoS,
  isMobile,
  isFull,
  isLogo,
}: {
  logo: string
  full: string
  color: Irgb
  logoP: number
  logoS: number
  isMobile: boolean
  isFull: boolean
  isLogo: boolean
}) => {
  const { nodes, materials } = useGLTF(modelGltf) as any
  const logoTex = useTexture(logo)
  const fullTex = useTexture(full)

  logoTex.colorSpace = THREE.SRGBColorSpace
  fullTex.colorSpace = THREE.SRGBColorSpace

  useEffect(() => {
    materials.color.color.setRGB(
      Math.max(color.r, 0.02),
      Math.max(color.g, 0.02),
      Math.max(color.b, 0.02)
    )
  }, [color])

  const genP = () => [-0.075, 0, 0.075][logoP] || 0
  const genS = () => [0.09, 0.12, 0.17][logoS] || 0.12

  return (
    <group scale={isMobile ? 6 : 9}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.tshirt.geometry}
        material={materials.color}
        position={[0, isMobile ? 0.35 : 0.1, 0]}
        dispose={null}
      >
        {isFull && (
          <Decal position={[0, 0, 0]} rotation={[0, 0, 0]} scale={1}>
            <meshBasicMaterial map={fullTex} />
          </Decal>
        )}
        {isLogo && (
          <Decal
            position={[genP(), 0.08, 0.13]}
            rotation={[0, 0, 0]}
            scale={genS()}
            map={logoTex}
            depthTest
          />
        )}
      </mesh>
    </group>
  )
}

export default Tshirt
