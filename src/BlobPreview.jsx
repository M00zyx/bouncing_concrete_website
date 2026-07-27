import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export function BlobPreview() {
  const host = useRef(null)
  useEffect(() => {
    const element = host.current
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setSize(element.clientWidth, element.clientHeight)
    renderer.setClearColor(0x171817); element.appendChild(renderer.domElement)
    const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(30, element.clientWidth / element.clientHeight, .1, 100)
    camera.position.set(0, .2, 4.1); scene.add(new THREE.HemisphereLight(0xe3e6e0, 0x071d9c, 3))
    const light = new THREE.DirectionalLight(0xffd900, 2.8); light.position.set(3, 4, 4); scene.add(light)
    let model; new GLTFLoader().load('/assets/concrete-blob.glb', ({ scene: gltf }) => { model = gltf; const b = new THREE.Box3().setFromObject(model); model.scale.setScalar(2.2 / b.getSize(new THREE.Vector3()).length()); model.position.y = -.38; scene.add(model) })
    let id; const frame = () => { id = requestAnimationFrame(frame); if (model) model.rotation.y += .004; renderer.render(scene, camera) }; frame()
    return () => { cancelAnimationFrame(id); renderer.dispose(); element.replaceChildren() }
  }, [])
  return <main className="blob-preview"><div className="blob-preview__label">ACTUAL HERO OBJECT · GLB RENDER</div><div ref={host} /></main>
}
