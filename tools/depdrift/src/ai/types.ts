import { Finding } from "../types";

export interface CodePatch {
  file: string;
  diff: string;
}

export interface AIEnhancement {
  explanation: string;
  impact: string;
  recommendedFix: string;
  patch?: CodePatch;
}

export interface AIEnhancedFinding extends Finding {
  aiAnalysis?: AIEnhancement;
}

export interface AIReportSummary {
  markdownSummary: string;
  findings: AIEnhancedFinding[];
}

export interface AIEnrichmentOptions {
  repoRoot?: string;
}