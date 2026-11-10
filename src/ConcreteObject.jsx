import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'

export function ConcreteObject() {
  const host = useRef(null)

  useEffect(() => {
    const element = host.current
    element.classList.remove('model-ready', 'model-unavailable')
    const motionZone = element.closest('.release')
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)')
    let renderer, observer, scene, model, frameId, disposed = false
    let face, frame, basePosition, visible = false, targetX = 0, targetY = 0
    const facePitch = THREE.MathUtils.degToRad(29)
    const faceRoll = THREE.MathUtils.degToRad(3)
    const camera = new THREE.PerspectiveCamera(58, 1, .1, 100)
    camera.position.set(0, .2, 4.1)

    function draw() {
      if (!visible || disposed || !renderer) return
      if (face) {
        face.rotation.y += (targetX * .28 - face.rotation.y) * .12
        face.rotation.x += (facePitch + targetY * THREE.MathUtils.degToRad(20) - face.rotation.x) * .16
        face.rotation.z = faceRoll
        frame.position.copy(basePosition)
      }
      renderer.render(scene, camera)
      if (!reducedMotion.matches) frameId = requestAnimationFrame(draw)
    }

    function resize() {
      if (!renderer) return
      renderer.setSize(element.clientWidth, element.clientHeight)
      camera.aspect = element.clientWidth / element.clientHeight
      camera.updateProjectionMatrix()
      if (reducedMotion.matches) draw()
    }

    function move(event) {
      if (reducedMotion.matches) return
      const box = motionZone.getBoundingClientRect()
      targetX = (event.clientX - box.left) / box.width - .5
      targetY = (event.clientY - box.top) / box.height - .5
    }

    function leave() { targetX = 0; targetY = 0 }
    function motionChange() {
      leave()
      cancelAnimationFrame(frameId)
      if (face && reducedMotion.matches) face.rotation.set(facePitch, 0, faceRoll)
      draw()
    }

    function initialize() {
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
      } catch {
        element.classList.add('model-unavailable')
        return
      }
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
      element.appendChild(renderer.domElement)
      scene = new THREE.Scene()
      scene.add(new THREE.HemisphereLight(0xe3e6e0, 0x171717, 1.45))
      const chinLight = new THREE.SpotLight(0xffc400, 9.2, 16, .64, .82, 1.18)
      chinLight.position.set(0, -3.6, 3.7)
      chinLight.target.position.set(0, -.15, 0)
      const chinFill = new THREE.PointLight(0xffb400, 1.6, 8, 1.45)
      chinFill.position.set(0, -2.8, 2.2)
      scene.add(chinLight, chinLight.target, chinFill)
      resize()
      new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load('/assets/concrete-blob-web.glb', ({ scene: object }) => {
        model = object
        if (disposed) { disposeModel(); return }
        const bounds = new THREE.Box3().setFromObject(model)
        const center = bounds.getCenter(new THREE.Vector3())
        const scale = 9 / bounds.getSize(new THREE.Vector3()).length()
        frame = new THREE.Group()
        face = new THREE.Group()
        model.scale.setScalar(scale)
        model.position.set(-center.x * scale, -center.y * scale, -center.z * scale)
        face.position.y = -1.25
        face.add(model)
        face.rotation.set(facePitch, 0, faceRoll)
        frame.position.y = .72
        frame.add(face)
        basePosition = frame.position.clone()
        scene.add(frame)
        element.classList.add('model-ready')
        if (reducedMotion.matches) draw()
      }, undefined, () => { if (!disposed) element.classList.add('model-unavailable') })
    }

    function disposeModel() {
      model?.traverse(node => {
        node.geometry?.dispose()
        const materials = Array.isArray(node.material) ? node.material : [node.material]
        materials.filter(Boolean).forEach(material => {
          Object.values(material).forEach(value => { if (value?.isTexture) value.dispose() })
          material.dispose()
        })
      })
    }

    observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      cancelAnimationFrame(frameId)
      if (visible && !renderer) initialize()
      draw()
    }, { rootMargin: '180px' })
    observer.observe(element)
    addEventListener('resize', resize)
    motionZone.addEventListener('pointermove', move)
    motionZone.addEventListener('pointerleave', leave)
    reducedMotion.addEventListener('change', motionChange)
    return () => {
      disposed = true
      observer.disconnect()
      cancelAnimationFrame(frameId)
      removeEventListener('resize', resize)
      motionZone.removeEventListener('pointermove', move)
      motionZone.removeEventListener('pointerleave', leave)
      reducedMotion.removeEventListener('change', motionChange)
      disposeModel()
      renderer?.dispose()
      element.replaceChildren()
    }
  }, [])

  return <div className="object-stage eye-slit-stage" ref={host} aria-label="The concrete character watches from behind its cell wall" />
}
