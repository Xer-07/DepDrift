import * as fs from "fs";
import * as path from "path";
import { Finding } from "../types";
import { AIEnhancedFinding, AIEnhancement, AIEnrichmentOptions } from "./types";
import { SYSTEM_PROMPT, buildAnalysisPrompt } from "./prompts";

export async function processFindingWithLLM(
  finding: Finding,
  options?: AIEnrichmentOptions
): Promise<AIEnhancedFinding> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return finding;
  }

  let manifestSnippet = "";
  if (options?.repoRoot && finding.fromPackage) {
    const candidatePath = path.join(options.repoRoot, finding.fromPackage, "package.json");
    const rootPath = path.join(options.repoRoot, "package.json");
    const targetFile = fs.existsSync(candidatePath) ? candidatePath : fs.existsSync(rootPath) ? rootPath : null;

    if (targetFile) {
      try {
        manifestSnippet = fs.readFileSync(targetFile, "utf-8");
      } catch {
        // Read fallback silently ignored
      }
    }
  }

  const prompt = buildAnalysisPrompt(finding, manifestSnippet);

  try {
    let responseText = "";

    if (process.env.OPENAI_API_KEY) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
        }),
      });
      const data = (await res.json()) as any;
      responseText = data.choices?.[0]?.message?.content || "{}";
    } else if (process.env.GEMINI_API_KEY) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\n${prompt}` }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      });
      const data = (await res.json()) as any;
      responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    } else if (process.env.ANTHROPIC_API_KEY) {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = (await res.json()) as any;
      responseText = data.content?.[0]?.text || "{}";
    }

    const aiAnalysis: AIEnhancement = JSON.parse(responseText);
    return {
      ...finding,
      aiAnalysis,
    };
  } catch (error) {
    console.error(`[DepDrift AI] Failed to enrich finding for ${finding.dependency}:`, error);
    return finding;
  }
}