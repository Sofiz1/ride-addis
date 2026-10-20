'use client'

import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface AnubiWebGLBackgroundProps {
  className?: string
}

export function AnubiWebGLBackground({ className }: AnubiWebGLBackgroundProps) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    let width = container.clientWidth || window.innerWidth
    let height = container.clientHeight || window.innerHeight

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0xffffff, 0.0035)

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000)
    camera.position.set(0, 38, 95)
    camera.lookAt(0, 8, -25)

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0xffffff, 0)
    container.appendChild(renderer.domElement)

    // 2. CYCLING ECOMMERCE VIBE: 3D Velodrome / Winding Asphalt Road with Speed Dashes
    // Generates a 3D curving cycle highway path receding into the distance
    const roadLength = 260
    const roadWidth = 44
    const roadSegments = 120
    const roadGeo = new THREE.PlaneGeometry(roadWidth, roadLength, 18, roadSegments)
    roadGeo.rotateX(-Math.PI / 2)

    // Curving road vertices to simulate an elevated cycling velodrome ribbon
    const pos = roadGeo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const z = pos.getZ(i)
      const x = pos.getX(i)
      // Gentle S-curve descent
      const curveX = Math.sin(z * 0.024) * 22
      pos.setX(i, x + curveX)
      // Gentle undulating terrain slope
      const elevation = Math.cos(z * 0.02) * 6 - z * 0.08
      pos.setY(i, elevation - 18)
    }
    pos.needsUpdate = true
    roadGeo.computeVertexNormals()

    // Asphalt surface mesh (light theme subtle tone)
    const roadMat = new THREE.MeshBasicMaterial({
      color: 0x171817,
      wireframe: true,
      transparent: true,
      opacity: 0.065
    })
    const roadMesh = new THREE.Mesh(roadGeo, roadMat)
    scene.add(roadMesh)

    // 3. Animated Cycling Dashed Center Lines & Road Boundaries
    const laneMarkerCount = 40
    const laneMarkers: THREE.Mesh[] = []
    const laneGeo = new THREE.PlaneGeometry(1.4, 4.2)
    laneGeo.rotateX(-Math.PI / 2)
    const laneMat = new THREE.MeshBasicMaterial({
      color: 0xf76707, // Warm Sunset Orange
      transparent: true,
      opacity: 0.42
    })

    for (let i = 0; i < laneMarkerCount; i++) {
      const marker = new THREE.Mesh(laneGeo, laneMat)
      scene.add(marker)
      laneMarkers.push(marker)
    }

    // 4. Stylized 3D Bicycle Wheel Spoke Geometries in the Background
    // Ambient rotating 3D aero wheel rims with radial spokes
    const wheelsGroup = new THREE.Group()
    scene.add(wheelsGroup)

    const createBicycleWheelMesh = (radius: number, spokesCount: number) => {
      const wheelObj = new THREE.Group()
      
      // Outer Tire & Rim
      const rimGeo = new THREE.TorusGeometry(radius, 0.45, 12, 48)
      const rimMat = new THREE.MeshBasicMaterial({
        color: 0x171817,
        wireframe: true,
        transparent: true,
        opacity: 0.09
      })
      const rimMesh = new THREE.Mesh(rimGeo, rimMat)
      wheelObj.add(rimMesh)

      // Center Hub
      const hubGeo = new THREE.CylinderGeometry(1.8, 1.8, 2.2, 16)
      const hubMat = new THREE.MeshBasicMaterial({
        color: 0xf76707,
        wireframe: true,
        transparent: true,
        opacity: 0.18
      })
      const hubMesh = new THREE.Mesh(hubGeo, hubMat)
      hubMesh.rotateX(Math.PI / 2)
      wheelObj.add(hubMesh)

      // Radial Aero Spokes
      const spokeMat = new THREE.LineBasicMaterial({
        color: 0x171817,
        transparent: true,
        opacity: 0.06
      })
      for (let s = 0; s < spokesCount; s++) {
        const theta = (s * 2 * Math.PI) / spokesCount
        const spokeGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(Math.cos(theta) * radius, Math.sin(theta) * radius, 0)
        ])
        const spokeLine = new THREE.Line(spokeGeo, spokeMat)
        wheelObj.add(spokeLine)
      }

      return wheelObj
    }

    // Left background wheel
    const leftWheel = createBicycleWheelMesh(28, 24)
    leftWheel.position.set(-58, 22, -50)
    leftWheel.rotation.y = Math.PI / 5
    wheelsGroup.add(leftWheel)

    // Right background wheel
    const rightWheel = createBicycleWheelMesh(32, 28)
    rightWheel.position.set(62, 18, -60)
    rightWheel.rotation.y = -Math.PI / 4.5
    wheelsGroup.add(rightWheel)

    // 5. Cycling Speed Streaks & Velocity Particles
    const speedParticleCount = 220
    const speedGeo = new THREE.BufferGeometry()
    const speedPositions = new Float32Array(speedParticleCount * 3)
    const speedColors = new Float32Array(speedParticleCount * 3)

    const speedPalette = [
      new THREE.Color('#f76707'), // Sunset Orange
      new THREE.Color('#e8590c'), // Terracotta
      new THREE.Color('#f59f00'), // Amber
      new THREE.Color('#171817')  // Asphalt Noir
    ]

    for (let i = 0; i < speedParticleCount; i++) {
      const idx = i * 3
      speedPositions[idx] = (Math.random() - 0.5) * 160
      speedPositions[idx + 1] = Math.random() * 45 - 15
      speedPositions[idx + 2] = (Math.random() - 0.5) * 200 - 30

      const c = speedPalette[i % speedPalette.length]
      speedColors[idx] = c.r
      speedColors[idx + 1] = c.g
      speedColors[idx + 2] = c.b
    }

    speedGeo.setAttribute('position', new THREE.BufferAttribute(speedPositions, 3))
    speedGeo.setAttribute('color', new THREE.BufferAttribute(speedColors, 3))

    const speedMat = new THREE.PointsMaterial({
      size: 2.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.38
    })
    const speedParticles = new THREE.Points(speedGeo, speedMat)
    scene.add(speedParticles)

    // 6. Interactive Parallax & Dynamic Motion Loop
    let mouseX = 0
    let mouseY = 0
    let targetX = 0
    let targetY = 0

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2
      mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2
    }
    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    const handleResize = () => {
      if (!container) return
      width = container.clientWidth || window.innerWidth
      height = container.clientHeight || window.innerHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    window.addEventListener('resize', handleResize)

    let animId: number
    let clock = new THREE.Clock()

    const animate = () => {
      animId = requestAnimationFrame(animate)

      const time = clock.getElapsedTime()

      // Smooth camera dampening with cursor tracking
      targetX += (mouseX - targetX) * 0.04
      targetY += (mouseY - targetY) * 0.04

      camera.position.x = targetX * 16
      camera.position.y = 38 - targetY * 8
      camera.lookAt(targetX * 6, 8, -25)

      // Rotate 3D bicycle wheels in background (dynamic cadence)
      leftWheel.rotation.z = time * 0.45
      rightWheel.rotation.z = -time * 0.55

      // Animate flowing dashed lane markers along cycling road (cycling velocity illusion)
      const cycleSpeed = 38 // km/h road cadence
      for (let i = 0; i < laneMarkerCount; i++) {
        const marker = laneMarkers[i]
        const zProg = ((i * (roadLength / laneMarkerCount) + time * cycleSpeed) % roadLength) - (roadLength / 2)
        const curveX = Math.sin(zProg * 0.024) * 22
        const elevation = Math.cos(zProg * 0.02) * 6 - zProg * 0.08 - 17.5

        marker.position.set(curveX, elevation, zProg)
        marker.rotation.y = Math.cos(zProg * 0.024) * 0.4
      }

      // Stream velocity speed particles toward camera
      const pAttr = speedGeo.attributes.position
      for (let i = 0; i < speedParticleCount; i++) {
        let pz = pAttr.getZ(i) + 0.8
        if (pz > 70) pz = -130
        pAttr.setZ(i, pz)
      }
      pAttr.needsUpdate = true

      renderer.render(scene, camera)
    }

    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      roadGeo.dispose()
      roadMat.dispose()
      laneGeo.dispose()
      laneMat.dispose()
      speedGeo.dispose()
      speedMat.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <div
      ref={mountRef}
      className={className || 'hero-webgl-cycling-canvas'}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'hidden'
      }}
      aria-hidden="true"
    />
  )
}
