import React from 'react';
import { MeshPhysicalMaterial, ShaderMaterial, Color } from 'three';
import { extend } from '@react-three/fiber';

export const GoldMaterial = (props: any) => (
  <meshPhysicalMaterial
    color="#FFD700"
    emissive="#B8860B"
    emissiveIntensity={0.2}
    metalness={1}
    roughness={0.1}
    clearcoat={1}
    clearcoatRoughness={0.1}
    reflectivity={1}
    {...props}
  />
);

export const EmeraldMaterial = (props: any) => (
  <meshPhysicalMaterial
    color="#002b15"
    emissive="#001a0d"
    emissiveIntensity={0.2}
    metalness={0.4}
    roughness={0.2}
    clearcoat={1}
    clearcoatRoughness={0.1}
    {...props}
  />
);

export const GiftWrapMaterial = (props: any) => (
    <meshPhysicalMaterial
      color="#053b23" // Lighter emerald for gifts
      emissive="#000000"
      metalness={0.1}
      roughness={0.3}
      clearcoat={0.5}
      {...props}
    />
);

export const LightOrbMaterial = () => (
  <meshStandardMaterial
    color="#FFF8E7"
    emissive="#FFF8E7"
    emissiveIntensity={4}
    toneMapped={false} 
  />
);

// --- Custom Shader for Foliage ---

export class FoliageMaterial extends ShaderMaterial {
    constructor() {
        super({
            uniforms: {
                uTime: { value: 0 },
                uMorphFactor: { value: 0 },
                uColorBase: { value: new Color('#001a0d') },
                uColorTip: { value: new Color('#004d26') },
                uColorGold: { value: new Color('#FFD700') }
            },
            vertexShader: `
                uniform float uTime;
                uniform float uMorphFactor;
                attribute vec3 aScatterPos;
                attribute vec3 aTreePos;
                attribute float aRandom;
                varying float vAlpha;
                varying float vRandom;
                
                void main() {
                    vRandom = aRandom;
                    
                    // Dual Position Interpolation
                    // Use a curve for uMorphFactor to make it snap or ease?
                    // Passed value is already eased by JS, but we can add noise here.
                    
                    vec3 pos = mix(aScatterPos, aTreePos, uMorphFactor);
                    
                    // Breathing (Tree State)
                    float breath = sin(uTime * 2.0 + pos.y * 3.0) * 0.02 * uMorphFactor;
                    pos += normalize(pos) * breath;

                    // Floating (Scattered State)
                    // Add some curl noise or simple sine waves
                    float floatX = sin(uTime * 0.5 + aRandom * 100.0) * 0.5 * (1.0 - uMorphFactor);
                    float floatY = cos(uTime * 0.3 + aRandom * 50.0) * 0.5 * (1.0 - uMorphFactor);
                    float floatZ = sin(uTime * 0.4 + aRandom * 20.0) * 0.5 * (1.0 - uMorphFactor);
                    pos += vec3(floatX, floatY, floatZ);

                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    
                    // Size attenuation
                    float baseSize = 0.15; // Base particle size
                    // Sparkle size modulation
                    float sparkle = 1.0 + sin(uTime * 3.0 + aRandom * 20.0) * 0.5;
                    
                    gl_PointSize = (baseSize * 300.0 * sparkle) / -mvPosition.z;
                    gl_Position = projectionMatrix * mvPosition;
                    
                    // Fade out slightly when scattered to avoid clutter
                    vAlpha = 0.6 + 0.4 * uMorphFactor; 
                }
            `,
            fragmentShader: `
                uniform vec3 uColorBase;
                uniform vec3 uColorTip;
                uniform vec3 uColorGold;
                varying float vAlpha;
                varying float vRandom;

                void main() {
                    // Soft particle shape
                    vec2 xy = gl_PointCoord.xy - vec2(0.5);
                    float r = length(xy);
                    if (r > 0.5) discard;
                    
                    // Inner glow
                    float strength = 1.0 - (r * 2.0);
                    strength = pow(strength, 1.5); // sharpen
                    
                    // Color mix
                    vec3 color = mix(uColorBase, uColorTip, strength);
                    
                    // Golden Rims / Highlights
                    // If random value is high, make it a gold ornament-like particle
                    float isGold = step(0.9, vRandom);
                    color = mix(color, uColorGold, isGold * 0.8);
                    
                    // Edge glow for luxury feel
                    float edge = smoothstep(0.3, 0.5, r);
                    color += uColorGold * edge * 0.5;

                    gl_FragColor = vec4(color, strength * vAlpha);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: 2 // AdditiveBlending equivalent (Custom blending usually better but let's try standard or additive)
        });
        // We set blending manually to Additive for the glow effect
        this.blending = 2; // THREE.AdditiveBlending
    }
}
