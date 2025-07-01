import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import ErrorBoundary from './ErrorBoundary';
import { 
  OrbitControls, 
  Html,
  ContactShadows,
} from '@react-three/drei';
import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Box, CircularProgress, Typography } from '@mui/material';
import { typeLighting, getPokemonLighting, getSofterTypeBackground } from '../utils/pokemonLighting';

// Global model cache to prevent reloading the same models
const modelCache = new Map<string, GLTF>();

interface ModelViewerProps {
  modelPath: string;
  scale?: number;
  position?: [number, number, number];
  autoRotate?: boolean;
  height?: string | number;
  onError?: () => void;
  lowerDetailWhenIdle?: boolean;
  pokemonType?: string | string[];
}

interface ModelProps {
  modelPath: string;
  scale: number;
  position: [number, number, number];
  autoRotate: boolean;
}

function Model({ modelPath, scale, position, autoRotate }: ModelProps) {
  const ref = useRef<THREE.Group | null>(null);
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [error, setError] = useState(false);
  const [hasAdjustedPosition, setHasAdjustedPosition] = useState(false);
  
  // Make sure we import useThree from @react-three/fiber
  const { camera, controls } = useThree();
  
  useEffect(() => {
    let isMounted = true;
    
    const loadModel = async () => {
      try {
        if (modelCache.has(modelPath)) {
          if (isMounted) setModel(modelCache.get(modelPath)!.scene);
          return;
        }
        
        let path = modelPath;
        if (path.startsWith('/')) {
          path = path.substring(1);
        }
        
        const GLTFLoaderModule = await import('three/examples/jsm/loaders/GLTFLoader.js');
        const loader = new GLTFLoaderModule.GLTFLoader();
        
        loader.load(
          path,
          (gltf: GLTF) => {
            if (!isMounted) return;
            setModel(gltf.scene);
            modelCache.set(modelPath, gltf);
          },
          undefined,
          (error: any) => {
            console.error(`Error loading model ${modelPath}:`, error);
            if (isMounted) setError(true);
          }
        );
      } catch (err) {
        console.error(`General error loading model ${modelPath}:`, err);
        if (isMounted) setError(true);
      }
    };
    
    loadModel();
    
    return () => {
      isMounted = false;
    };
  }, [modelPath]);
  
  useFrame((_, delta) => {
    if (autoRotate && ref.current) {
      ref.current.rotation.y += delta * 0.5;
      // force a rerender in 'demand' mode
      return true; // tells R3F to continue rendering
    }
    return false;
  });

  // Enhanced auto-positioning with camera adjustment
  useEffect(() => {
    if (model && ref.current && !hasAdjustedPosition) {
      // Calculate bounding box
      const box = new THREE.Box3().setFromObject(ref.current);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      
      box.getSize(size);
      box.getCenter(center);
      
      // Center the model horizontally and vertically
      ref.current.position.x = position[0] - center.x;
      ref.current.position.z = position[2] - center.z;
      ref.current.position.y = position[1] - center.y;
      
      // Find the max dimension to determine camera distance
      const maxDimension = Math.max(size.x, size.y, size.z);
      
      // Calculate optimal camera distance based on model size
      const optimalDistance = maxDimension * 2.2; // Adjust multiplier as needed
      
      // Set camera position - this works for all camera types
      camera.position.z = Math.max(3, optimalDistance);
      
      // Type check before setting near/far planes
      if (camera instanceof THREE.PerspectiveCamera) {
        // Now TypeScript knows this is a PerspectiveCamera
        camera.near = optimalDistance * 0.01;
        camera.far = optimalDistance * 10;
        camera.updateProjectionMatrix();
      }
      
      // If we have OrbitControls, reset them to look at the center
      if (controls) {
        // Use the type guard for safer handling
        if (isOrbitControls(controls)) {
          controls.target.set(0, 0, 0);
          controls.update();
        }
      }
      
      setHasAdjustedPosition(true);
    }
  }, [model, hasAdjustedPosition, position, camera, controls]);

  if (error) {
    return null;
  }

  if (!model) {
    return null;
  }

  return (
    <primitive
      ref={ref}
      object={model}
      position={position}
      scale={scale}
      dispose={null}
    />
  );
}

// typesafe guard for OrbitControls
function isOrbitControls(controls: any): controls is { target: THREE.Vector3; update: () => void } {
  return controls && 'target' in controls && typeof controls.update === 'function';
}

const trimCache = (maxSize = 50) => {
  if (modelCache.size > maxSize) {
    // Convert keys to array or TS is angry
    const keys = Array.from(modelCache.keys());
    if (keys.length > 0) {
      modelCache.delete(keys[0]);
    }
  }
};

// animated spotlight
function AnimatedSpotlight({ type, intensity = 1.5 }: { type: string; intensity?: number }) {
  const spotlightRef = useRef<THREE.SpotLight>(null);
  const targetRef = useRef<THREE.Object3D>(null);
  
  // Get color based on Pokémon type
  const color = typeLighting[type?.toLowerCase()] 
    ? typeLighting[type.toLowerCase()].mainLight 
    : '#ffffff';
  
  useFrame(({ clock }) => {
    if (spotlightRef.current && targetRef.current) {
      // Create a subtle circular motion for the spotlight
      const time = clock.getElapsedTime();
      const radius = 2.5;
      
      // Move in a gentle elliptical pattern
      targetRef.current.position.x = Math.sin(time * 0.3) * radius * 0.7;
      targetRef.current.position.z = Math.cos(time * 0.2) * radius * 0.5;
      targetRef.current.position.y = Math.sin(time * 0.4) * 0.3 - 0.5; // subtle vertical movement
    }
  });

  return (
    <>
      <spotLight
        ref={spotlightRef}
        position={[3, 8, 2]}
        angle={0.25}
        penumbra={0.8}
        intensity={intensity}
        color={color}
        castShadow
        shadow-bias={-0.001}
        shadow-mapSize={[512, 512]}
        target={targetRef.current || undefined}
      />
      <object3D ref={targetRef} position={[0, 0, 0]} />
    </>
  );
}

const ModelViewer = ({
  modelPath,
  scale = 1,
  position = [0, 0, 0],
  autoRotate = false,
  height = '500px',
  onError,
  lowerDetailWhenIdle = false,
  pokemonType = 'normal',
}: ModelViewerProps) => {
  const [isInteracting, setIsInteracting] = useState(false);
  const interactionTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Add a state to control if we're visible in viewport
  const [isInViewport, setIsInViewport] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  
  // Use IntersectionObserver to check if we're in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
      },
      { threshold: 0.1 } // Trigger when at least 10% is visible
    );
    
    if (viewportRef.current) {
      observer.observe(viewportRef.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  // Determine if we should animate based on all factors
  // If autoRotate is true, we should animate even when idle but only when visible
  const shouldAnimate = autoRotate || isInteracting || !lowerDetailWhenIdle;
  
  useEffect(() => {
    // Initial trim
    trimCache();
    
    const cacheInterval = setInterval(() => {
      trimCache(50); // Number is max models
    }, 60000); // timer
    
    return () => {
      clearInterval(cacheInterval);
    };
  }, []);

  const types = Array.isArray(pokemonType) ? pokemonType : [pokemonType];
  const primaryType = types[0]?.toLowerCase() || 'normal';
  
  const lighting = getPokemonLighting(types);
  
  // Use softer backgrounds to make models stand out more
  const background = getSofterTypeBackground(types);
  
  return (
    <Box 
      ref={viewportRef}
      sx={{ 
        width: '100%', 
        height, 
        borderRadius: 2,
        overflow: 'hidden',
        position: 'relative',
        background, // Keep the type-based backgrounds
        boxShadow: '0px 3px 15px rgba(0,0,0,0.1)',
        // Keep the vignette effect
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          boxShadow: 'inset 0 0 30px 8px rgba(0,0,0,0.2)',
          borderRadius: 'inherit',
          pointerEvents: 'none',
          zIndex: 1
        }
      }}>
      <Canvas
        camera={{ 
          position: [0, 0, 5], // Slightly adjusted camera position
          fov: 40, 
          near: 0.1, 
          far: 1000
        }}
        frameloop={
          // Only use 'demand' when we should truly be idle - not visible AND not interacting AND lowering detail
          (!isInViewport && !isInteracting && lowerDetailWhenIdle) ? 'demand' : 'always'
        }
        dpr={lowerDetailWhenIdle && !isInteracting ? [0.5, 1.5] : [1, 2]}
        style={{ background: 'transparent' }}
        shadows
        onPointerDown={() => {
          setIsInteracting(true);
          if (interactionTimer.current) clearTimeout(interactionTimer.current);
        }}
        onPointerUp={() => {
          if (interactionTimer.current) clearTimeout(interactionTimer.current);
          interactionTimer.current = setTimeout(() => setIsInteracting(false), 1500);
        }}
      >
        <Suspense fallback={
          <Html center>
            <CircularProgress color="primary" size={40} />
          </Html>
        }>
          <ErrorBoundary 
            fallback={
              <Html center>
                <div style={{ color: 'red', backgroundColor: 'rgba(255,255,255,0.8)', padding: '10px', borderRadius: '5px' }}>
                  Failed to load model
                </div>
              </Html>
            } 
            // onError={handleLoadError}
          >
            {/* Enhanced setup with better visual elements */}
            <group>
              {/* Increase ambient light intensity by 60% to brighten the overall scene */}
              <ambientLight 
                color={lighting.ambientColor} 
                intensity={lighting.ambientIntensity * 1.6} 
              />
              
              {/* Increase main directional light - remove the reduction factor */}
              <directionalLight 
                color={lighting.mainLight} 
                position={[10, 10, 5]} 
                intensity={lighting.intensity} // Remove the 0.7 reduction
                castShadow 
              />
              
              {/* Brighter animated spotlight */}
              <AnimatedSpotlight type={primaryType} intensity={1.8} /> {/* Increased from 1.2 */}
              
              {/* Keep the rim light as is */}
              <directionalLight
                position={[0, 0, -10]}
                intensity={0.7}
                color="#ffffff"
              />
              
              {/* Add a hemisphere light for softer ambient fill */}
              <hemisphereLight 
                color="#ffffff"
                groundColor={lighting.ambientColor}
                intensity={0.5} 
              />
              
              {/* Add a subtle fill light from below to reduce harsh shadows */}
              <directionalLight
                position={[0, -3, 0]}
                intensity={0.2}
                color="#ffffff"
              />
              
              {/* Keep the contact shadows but make them slightly less prominent */}
              <ContactShadows
                position={[0, -0.5, 0]}
                opacity={0.25} // Reduced from 0.3
                scale={3.5}
                blur={2.5} // Increased blur for softer shadows
                far={1}
                resolution={256}
                color="#000000"
              />
              
              {/* The model stays the same */}
              <Model 
                modelPath={modelPath} 
                scale={scale} 
                position={position}
                autoRotate={shouldAnimate && isInViewport}
              />
            </group>
          </ErrorBoundary>
          
          {/* Add more flexible controls */}
          <OrbitControls 
            enableZoom={true}
            enablePan={false}
            minPolarAngle={0.1}
            maxPolarAngle={Math.PI / 1.75}
            dampingFactor={0.05}
            
            // Add these to automatically fit the view to the model
            makeDefault
            target={[0, 0, 0]} // Look at center
          />
        </Suspense>
      </Canvas>
    </Box>
  );
};

export const LazyModelViewer = ({ modelPath, pokemonType, ...props }: ModelViewerProps & { isScrolling?: boolean }) => {
  const [shouldRender, setShouldRender] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [fallbackFailed, setFallbackFailed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const unloadTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Track if this model is actually visible (more strict than shouldRender)
  const [isActuallyVisible, setIsActuallyVisible] = useState(false);
  
  useEffect(() => {
    // Outer observer with larger margin to preload
    const preloadObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Start loading, but don't unload immediately when scrolled away
          setShouldRender(true);
        } else if (!entry.isIntersecting && shouldRender) {
          // Delay unloading to prevent flickering during normal scrolling
          if (unloadTimerRef.current) clearTimeout(unloadTimerRef.current);
          
          unloadTimerRef.current = setTimeout(() => {
            setShouldRender(false);
          }, 1000); // Keep model loaded for 1 second after scrolling away
        }
      },
      { rootMargin: '300px 0px' } // Generous preloading margin
    );
    
    // Inner observer with tighter margin to determine if truly visible
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        setIsActuallyVisible(entry.isIntersecting);
      },
      { threshold: 0.1 } // Consider visible when at least 10% is shown
    );
    
    if (containerRef.current) {
      preloadObserver.observe(containerRef.current);
      visibilityObserver.observe(containerRef.current);
    }
    
    return () => {
      if (unloadTimerRef.current) clearTimeout(unloadTimerRef.current);
      preloadObserver.disconnect();
      visibilityObserver.disconnect();
    };
  }, [shouldRender]);

  // Handle model loading errors
  const handleError = () => {
    console.error(`Error loading model: ${modelPath}, using fallback`);
    if (!useFallback) {
      setUseFallback(true);
    } else {
      setFallbackFailed(true);
      console.error("Fallback model also failed to load");
    }
  };
  
  // We use the actual visibility to determine whether to animate/render at full quality
  const renderQuality = isActuallyVisible ? 'high' : 'low';
  
  return (
    <div ref={containerRef} style={{ height: props.height || '250px', width: '100%' }}>
      {shouldRender ? (
        fallbackFailed ? (
          // static error element - unchanged
          <Box sx={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'grey.200',
            color: 'error.main'
          }}>
            <div style={{ textAlign: 'center' }}>
              <Typography variant="body2">Model not available</Typography>
            </div>
          </Box>
        ) : (
          <ModelViewer 
            modelPath={useFallback ? '/glbs/0000.glb' : modelPath}
            pokemonType={pokemonType}
            onError={handleError}
            // Pass visibility status to control quality
            lowerDetailWhenIdle={!isActuallyVisible || props.lowerDetailWhenIdle}
            // Disable auto-rotation when not actually visible
            autoRotate={isActuallyVisible && props.autoRotate}
            // Pass through other props
            {...props}
          />
        )
      ) : (
        // Loading placeholder - unchanged
        <Box sx={{
          height: '100%',
          width: '100%',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          bgcolor: 'grey.100'
        }}>
          <CircularProgress size={30} />
        </Box>
      )}
    </div>
  );
};

export default ModelViewer;