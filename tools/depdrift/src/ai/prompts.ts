import { Finding } from "../types";

export const SYSTEM_PROMPT = `You are a Senior DevOps and Software Security Engineer specializing in dependency management and breaking change analysis.
Your task is to analyze dependency drift findings and produce structured remediation advice and unified code diffs.
Always respond with valid JSON matching the requested schema. Do not wrap the JSON in extra markdown formatting unless requested.`;

export function buildAnalysisPrompt(finding: Finding, manifestSnippet?: string): string {
  return `Analyze the following dependency drift finding and generate a JSON response.

Finding Data:
${JSON.stringify(finding, null, 2)}

${manifestSnippet ? `Manifest File Snippet:\n${manifestSnippet}\n` : ""}

Required JSON Output Schema:
{
  "explanation": "Clear explanation of why this drift occurred and why it poses a risk.",
  "impact": "Concrete breaking change or runtime impact assessment.",
  "recommendedFix": "Specific action to resolve the issue.",
  "patch": {
    "file": "path/to/target/file (e.g., package.json)",
    "diff": "Unified git diff snippet showing exact line changes"
  }
}
`;
}