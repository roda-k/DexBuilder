import ModelViewer from '../ModelViewer';

function DetailView({ modelId = '1' }) {
  return (
    <ModelViewer
      modelPath={`${import.meta.env.BASE_URL}models/${modelId}.glb`}
      autoRotate={true}
      height={600}
    />
  );
}

export default DetailView;