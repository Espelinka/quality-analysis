export interface AnalysisRequest {
  imageFile: File;
  imageUrl: string;
  comment: string;
  refinement: string;
}

export interface AnalysisReport {
  defectDescription: string;
  possibleCauses: string;
  violatedNorms: {
    code: string;
    text: string;
  }[];
  remediationMeasures: string;
  isIdentified: boolean;
}