import { EcosystemDetector } from "../types";
import { NodeDetector } from "./node";
import { PythonDetector } from "./python";

export function getActiveDetectors(repoRoot: string): EcosystemDetector[] {
  const detectors: EcosystemDetector[] = [
    new NodeDetector(),
    new PythonDetector(),
  ];

  return detectors.filter(d => d.detect(repoRoot));
}

export { NodeDetector, PythonDetector };
