import { ActualEdge } from "./scanner";
import { DeclaredEdge } from "./declared";

export type DriftResult = {
  missing: { fromPackage: string; toPackage: string; evidence: string[] }[];
  unnecessary: { fromPackage: string; toPackage: string }[];
};

export function computeDrift(
  actual: ActualEdge[],
  declared: DeclaredEdge[]
): DriftResult {
  const actualKeys = new Set(actual.map(e => `${e.fromPackage}->${e.toPackage}`));
  const declaredKeys = new Set(declared.map(e => `${e.fromPackage}->${e.toPackage}`));

  const missing: DriftResult["missing"] = [];
  for (const key of actualKeys) {
    if (!declaredKeys.has(key)) {
      const [fromPackage, toPackage] = key.split("->");
      const evidence = actual
        .filter(e => e.fromPackage === fromPackage && e.toPackage === toPackage)
        .map(e => e.fromFile);
      missing.push({ fromPackage, toPackage, evidence });
    }
  }

  const unnecessary: DriftResult["unnecessary"] = [];
  for (const key of declaredKeys) {
    if (!actualKeys.has(key)) {
      const [fromPackage, toPackage] = key.split("->");
      unnecessary.push({ fromPackage, toPackage });
    }
  }

  return { missing, unnecessary };
}