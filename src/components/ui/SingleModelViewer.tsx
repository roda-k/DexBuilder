import ModelViewer from '../ModelViewer';

function DetailView({ modelId = '1' }) {
  return (
    <ModelViewer
      modelPath={`/models/${modelId}.glb`}
      autoRotate={true}
      height={600}
    />
  );
}

export default DetailView;