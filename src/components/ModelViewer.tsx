import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import ErrorBoundary from './ErrorBoundary';
import { 
  OrbitControls, 
  Environment, 
  Stage, 
  Html,
} from '@react-three/drei';
import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Box, CircularProgress, Typography } from '@mui/material';

// Global model cache to prevent reloading the same models
const modelCache = new Map<string, GLTF>();

interface ModelViewerProps {
  modelPath: string;
  scale?: number;
  position?: [number, number, number];
  autoRotate?: boolean;
  height?: string | number;
  onError?: () => void;
  lowerDetailWhenIdle?: boolean; // Add this
}

interface ModelProps {
  modelPath: string;
  scale: number;
  position: [number, number, number];
  autoRotate: boolean;
}

// The Model component is working correctly - keep it as is
function Model({ modelPath, scale, position, autoRotate }: ModelProps) {
  const ref = useRef<THREE.Group | null>(null);
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [error, setError] = useState(false);
  
  useEffect(() => {
    let isMounted = true;
    
    const loadModel = async () => {
      try {
        // Try loading from cache first
        if (modelCache.has(modelPath)) {
          if (isMounted) setModel(modelCache.get(modelPath)!.scene);
          return;
        }
        
        // Path adjustments
        let path = modelPath;
        if (path.startsWith('/')) {
          path = path.substring(1);
        }
        
        // Fixed GLTFLoader import with proper typing
        const GLTFLoaderModule = await import('three/examples/jsm/loaders/GLTFLoader.js');
        const loader = new GLTFLoaderModule.GLTFLoader();
        
        loader.load(
          path,
          // Fix "any" type on Line 62
          (gltf: GLTF) => {
            if (!isMounted) return;
            setModel(gltf.scene);
            modelCache.set(modelPath, gltf);
          },
          undefined,
          // Use 'any' type to avoid TypeScript errors with the error callback
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
    }
  });

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

const trimCache = (maxSize = 50) => {
  if (modelCache.size > maxSize) {
    // Convert keys to array or TS is angry
    const keys = Array.from(modelCache.keys());
    if (keys.length > 0) {
      modelCache.delete(keys[0]);
    }
  }
};

const ModelViewer = ({
  modelPath,
  scale = 1,
  position = [0, 0, 0],
  autoRotate = false,
  height = '500px',
  onError,
  lowerDetailWhenIdle = false // Add this with default false
}: ModelViewerProps) => {
  // Add state to track if user is interacting
  const [isInteracting, setIsInteracting] = useState(false);
  const interactionTimer = useRef<NodeJS.Timeout | null>(null);

  const handleLoadError = () => {
    if (onError) {
      onError();
    }
  };

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

  return (
    <Box sx={{ 
      width: '100%', 
      height, // This now accepts percentage values too
      bgcolor: 'grey.100',
      borderRadius: 2,
      overflow: 'hidden',
      position: 'relative'
    }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        frameloop={lowerDetailWhenIdle && !isInteracting ? 'demand' : 'always'} // Only render when needed if idle
        dpr={lowerDetailWhenIdle && !isInteracting ? [0.5, 1.5] : [1, 2]} // Lower resolution when idle
        onPointerDown={() => {
          setIsInteracting(true);
          if (interactionTimer.current) clearTimeout(interactionTimer.current);
        }}
        onPointerUp={() => {
          if (interactionTimer.current) clearTimeout(interactionTimer.current);
          interactionTimer.current = setTimeout(() => setIsInteracting(false), 1500);
        }}
      >
        <color attach="background" args={['#f5f5f5']} />
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
            onError={handleLoadError}
          >
            <Stage adjustCamera shadows environment="city">
              <Model 
                modelPath={modelPath} 
                scale={scale} 
                position={position} 
                autoRotate={autoRotate} 
              />
            </Stage>
          </ErrorBoundary>
          <Environment preset="city" />
          <OrbitControls 
            makeDefault 
            autoRotate={autoRotate}
            autoRotateSpeed={1}
            enableZoom={true}
            enablePan={true}
            minPolarAngle={0}
            maxPolarAngle={Math.PI / 1.75}
          />
        </Suspense>
      </Canvas>
    </Box>
  );
};

export const LazyModelViewer = ({ modelPath, ...props }: ModelViewerProps) => {
  const [shouldRender, setShouldRender] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [fallbackFailed, setFallbackFailed] = useState(false); // track fallback failures
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
        } else if (!entry.isIntersecting && shouldRender) {
          //unload when scrolled away
          setShouldRender(false);
        }
      },
      { rootMargin: '300px 0px' } // to start the loading before coming into view
    );
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => observer.disconnect();
  }, [shouldRender]);

  // handle model loading errors
  const handleError = () => {
    console.error(`Error loading model: ${modelPath}, using fallback`);
    // no infinite
    if (!useFallback) {
      setUseFallback(true);
    } else {
      setFallbackFailed(true);
      console.error("Fallback model also failed to load");
    }
  };
  
  return (
    <div ref={containerRef} style={{ height: props.height || '250px', width: '100%' }}>
      {shouldRender ? (
        fallbackFailed ? (
          // static error element
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
            onError={handleError} // always pass the handler
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