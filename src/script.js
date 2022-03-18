import './style.css'
import * as THREE from 'three'
import gsap from 'gsap'
import * as dat from 'lil-gui'
import { ScrollTrigger } from "gsap/ScrollTrigger"

import vertexShader from './shaders/vertexShader.glsl'
import fragmentShader from './shaders/fragmentShader.glsl'

gsap.registerPlugin(ScrollTrigger)

const width = document.body.clientWidth;
const height = window.innerHeight;
console.clear();
class app {
  constructor() {
    this.pixelRatio = Math.min( window.devicePixelRatio, 2 )
    this.clock = new THREE.Clock()
    this.time = 0
    this.speed = { v: 0 }
    this.debug()
    this.sceneSetup()
    this.figure()
    this.resize()
    this.scrollRotation()
    this.update()
  }
  debug() {
    this.dat = new dat.GUI({
      width: 400
    })
    this.debugObject = {}
  }
  sceneSetup() {
    this.scene = new THREE.Scene()
    
    // create camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)

    this.camera.position.set( 0, 10, 30 )
    this.camera.lookAt( 0, 0 ,0 )
    this.scene.add( this.camera )
    
    // create light
    this.ambLight = new THREE.AmbientLight(0xffffff, 0.5)
    this.scene.add(this.ambLight)
    this.dirLight = new THREE.DirectionalLight(0xffffff, 0.5)
    this.dirLight.position.set(-200, 250, 0)
    this.scene.add(this.dirLight)
    
    // start rendering
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    this.renderer.setSize(document.body.clientWidth, window.innerHeight)
    this.renderer.setPixelRatio( this.pixelRatio )
    this.renderer.render(this.scene, this.camera)
    
    // create canvas tag
    document.body.appendChild( this.renderer.domElement )
  }
  resize() {
    window.addEventListener('resize', () => {
      // resize renderer
      this.pixelRatio = Math.min( window.devicePixelRatio, 2 )
      this.renderer.setSize(document.body.clientWidth, window.innerHeight)
      this.renderer.setPixelRatio( this.pixelRatio )
      
      // update camera
      this.camera.aspect = document.body.clientWidth / window.innerHeight
      this.camera.updateProjectionMatrix()
    })
  }
  scrollRotation() {
    document.addEventListener('wheel', (e) => {
      const delta = e.wheelDelta > 0 ? -1 : 1
      const tl = gsap.timeline({
        defaults: {
          duration: .6,
          easing: 'power3.out'
        }
      })
      tl.fromTo(this.speed, { v: this.speed.v }, {
        v: delta * 0.15
      })
      tl.to(this.speed, {
        v: 0
      }, '<=30%')
    })
  }
  figure() {
    const s = 6;
    // this.geometry = new THREE.BoxBufferGeometry( s, s, s, 500, 500, 500 )
    this.geometry = new THREE.SphereBufferGeometry( s, 500, 500 )
    this.geometry.computeTangents()
    
    this.debugObject.color = '#f57505'
    this.debugObject.color_2 = '#de0f0f'
    
    
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        u_speed: { value: 0 },
        u_size: { value: new THREE.Vector2(0.075, 4.772) },
        u_colorIntence: { value: 1 },
        
        u_color: { value: new THREE.Color( this.debugObject.color ) },
        u_color_intense: { value: 1 },
        
        u_color_2: { value: new THREE.Color( this.debugObject.color_2 ) },
        u_color_2_intense: { value: 0.23 },
        u_color_2_fill: { value: 0.069 },
        u_pattern_size: { value: 0.4 },
        
        uSubdivision: { value: new THREE.Vector2(this.geometry.parameters.widthSegments, this.geometry.parameters.heightSegments) }
      },
      wireframe: false,
      // transparent: true,
      // depthWrite: false,
      // blending: THREE.AdditiveBlending,
      defines: {
        PR: this.renderer.pixelRatio,
        USE_TANGENT: ''
      }
    })
    this.mesh = new THREE.Mesh( this.geometry, this.material )
    this.mesh.rotation.y = -Math.PI * 0.25
    
    // debug
    this.dat.add( this.mesh.material.uniforms.u_size.value, 'x' ).min(0).max(7).step(0.001).name('size-x')
    this.dat.add( this.mesh.material.uniforms.u_size.value, 'y' ).min(0).max(7).step(0.001).name('size-y')
    this.dat.add( this.mesh.material.uniforms.u_colorIntence, 'value' ).min(0).max(1.2).step(0.001).name('Color')
    
    this.dat.addColor( this.debugObject,  'color').onChange(() => {
      this.mesh.material.uniforms.u_color.value = new THREE.Color( this.debugObject.color )
    })
    this.dat.add( this.mesh.material.uniforms.u_color_intense, 'value' ).min(0).max(1.2).step(0.001).name('Color 1 bright')
    
    this.dat.addColor( this.debugObject,  'color_2').onChange(() => {
      this.mesh.material.uniforms.u_color_2.value = new THREE.Color( this.debugObject.color_2 )
    })
    this.dat.add( this.mesh.material.uniforms.u_color_2_intense, 'value' ).min(0).max(1.2).step(0.001).name('Color 2 bright')
    this.dat.add( this.mesh.material.uniforms.u_color_2_fill, 'value' ).min(0).max(1.).step(0.001).name('Color 2 fill')
    this.dat.add( this.mesh.material.uniforms.u_pattern_size, 'value' ).min(0).max(1).step(0.001).name('Pattern')
    
    this.scene.add( this.mesh )
  }
  
  update() {
    requestAnimationFrame( this.update.bind( this ) )
    this.time = this.clock.getDelta()
    
    // update controls
    // this.control.update()
    // this.mesh.rotation.y += this.time + this.speed.v
    
    // Update material
    this.mesh.material.uniforms.u_speed.value += this.time + this.speed.v / 4.0
    // this.sparkMaterial.uniforms.u_speed.value += this.time + this.speed.v / 4.0
    
    // Update renderer
    this.renderer.render(this.scene, this.camera)
  }
}
new app()