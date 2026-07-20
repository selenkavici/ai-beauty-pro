import {
  FaceLandmarker,
  FilesetResolver,
  type FaceLandmarkerResult,
} from '@mediapipe/tasks-vision';

const WASM_ROOT = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm';
const MODEL_ASSET =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

export type FaceAnalysisStage =
  | 'model-loading'
  | 'face-detection'
  | 'landmark-analysis'
  | 'skin-analysis'
  | 'recommendations';

export class FaceAnalysisError extends Error {
  constructor(
    public readonly code:
      | 'FACE_NOT_FOUND'
      | 'MULTIPLE_FACES'
      | 'MODEL_LOAD_FAILED'
      | 'IMAGE_ANALYSIS_FAILED'
      | 'IMAGE_TOO_DARK'
      | 'IMAGE_TOO_BRIGHT',
  ) {
    super(code);
    this.name = 'FaceAnalysisError';
  }
}

let landmarkerPromise: Promise<FaceLandmarker> | null = null;

const createLandmarker = async (delegate: 'GPU' | 'CPU') => {
  const vision = await FilesetResolver.forVisionTasks(WASM_ROOT);
  return FaceLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath: MODEL_ASSET, delegate },
    runningMode: 'IMAGE',
    numFaces: 2,
    minFaceDetectionConfidence: 0.5,
    minFacePresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });
};

/** Model promise'ı modül seviyesinde saklanır; sonraki analizler WASM/modeli yeniden oluşturmaz. */
export const getFaceLandmarker = () => {
  if (!landmarkerPromise) {
    landmarkerPromise = createLandmarker('GPU').catch(async () => {
      try {
        return await createLandmarker('CPU');
      } catch {
        landmarkerPromise = null;
        throw new FaceAnalysisError('MODEL_LOAD_FAILED');
      }
    });
  }
  return landmarkerPromise;
};

export const detectFaceLandmarks = async (
  image: HTMLImageElement,
  onStage?: (stage: FaceAnalysisStage) => void,
): Promise<FaceLandmarkerResult> => {
  onStage?.('model-loading');
  const landmarker = await getFaceLandmarker();
  onStage?.('face-detection');

  let result: FaceLandmarkerResult;
  try {
    result = landmarker.detect(image);
  } catch {
    throw new FaceAnalysisError('IMAGE_ANALYSIS_FAILED');
  }

  if (result.faceLandmarks.length === 0) throw new FaceAnalysisError('FACE_NOT_FOUND');
  if (result.faceLandmarks.length > 1) throw new FaceAnalysisError('MULTIPLE_FACES');
  return result;
};
