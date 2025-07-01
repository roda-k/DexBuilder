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

// global model cache to prevent reloading the same models
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

  useEffect(() => {
    if (model && ref.current && !hasAdjustedPosition) {
      // calculate bounding box
      const box = new THREE.Box3().setFromObject(ref.current);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      
      box.getSize(size);
      box.getCenter(center);
      
      // center model
      ref.current.position.x = position[0] - center.x;
      ref.current.position.z = position[2] - center.z;
      ref.current.position.y = position[1] - center.y;
      
      // Find the max dimension to determine camera distance
      const maxDimension = Math.max(size.x, size.y, size.z);
      
      // Calculate optimal camera distance based on model size
      const optimalDistance = maxDimension * 2.2; // adjust multiplier as needed
      
      camera.position.z = Math.max(3, optimalDistance);
      
      if (camera instanceof THREE.PerspectiveCamera) {
        // Now TypeScript knows this is a PerspectiveCamera
        camera.near = optimalDistance * 0.01;
        camera.far = optimalDistance * 10;
        camera.updateProjectionMatrix();
      }
      
      if (controls) {
        // use the type guard for safer handling
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
  
  const [isInViewport, setIsInViewport] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  
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
  
  // softer backgrounds to make models stand out more (psychic still needs work)
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
        background,
        boxShadow: '0px 3px 15px rgba(0,0,0,0.1)',
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
          position: [0, 0, 5],
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
            <group>
              <ambientLight 
                color={lighting.ambientColor} 
                intensity={lighting.ambientIntensity * 1.6} 
              />
              
              <directionalLight 
                color={lighting.mainLight} 
                position={[10, 10, 5]} 
                intensity={lighting.intensity}
                castShadow 
              />
              
              <AnimatedSpotlight type={primaryType} intensity={1.8} />
              
              <directionalLight
                position={[0, 0, -10]}
                intensity={0.7}
                color="#ffffff"
              />
              
              <hemisphereLight 
                color="#ffffff"
                groundColor={lighting.ambientColor}
                intensity={0.5} 
              />
              
              <directionalLight
                position={[0, -3, 0]}
                intensity={0.2}
                color="#ffffff"
              />
              
              <ContactShadows
                position={[0, -0.5, 0]}
                opacity={0.25}
                scale={3.5}
                blur={2.5}
                far={1}
                resolution={256}
                color="#000000"
              />
              
              <Model 
                modelPath={modelPath} 
                scale={scale} 
                position={position}
                autoRotate={shouldAnimate && isInViewport}
              />
            </group>
          </ErrorBoundary>
          
          <OrbitControls 
            enableZoom={true}
            enablePan={false}
            minPolarAngle={0.1}
            maxPolarAngle={Math.PI / 1.75}
            dampingFactor={0.05}
            // automatically fit the view to the model
            makeDefault
            target={[0, 0, 0]}
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
  
  // more strict than shouldRender
  const [isActuallyVisible, setIsActuallyVisible] = useState(false);
  
  useEffect(() => {
    // larger margin to preload
    const preloadObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // start loading, but don't unload immediately when scrolled away
          setShouldRender(true);
        } else if (!entry.isIntersecting && shouldRender) {
          // delay unloading to prevent flickering during normal scrolling (not enough, still losing context here)
          if (unloadTimerRef.current) clearTimeout(unloadTimerRef.current);
          
          unloadTimerRef.current = setTimeout(() => {
            setShouldRender(false);
          }, 1000);
        }
      },
      { rootMargin: '300px 0px' }
    );
    
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        setIsActuallyVisible(entry.isIntersecting);
      },
      { threshold: 0.1 } //consider visible when at least 10% is shown
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

  // handle model loading errors
  const handleError = () => {
    console.error(`Error loading model: ${modelPath}, using fallback`);
    if (!useFallback) {
      setUseFallback(true);
    } else {
      setFallbackFailed(true);
      console.error("Fallback model also failed to load");
    }
  };
  
  // We use the actual visibility to determine whether to animate/render at full quality (need rework)
  const renderQuality = isActuallyVisible ? 'high' : 'low';
  
  return (
    <div ref={containerRef} style={{ height: props.height || '250px', width: '100%' }}>
      {shouldRender ? (
        fallbackFailed ? (
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
            lowerDetailWhenIdle={!isActuallyVisible || props.lowerDetailWhenIdle}
            autoRotate={isActuallyVisible && props.autoRotate}
            {...props}
          />
        )
      ) : (
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