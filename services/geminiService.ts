
import { GoogleGenAI } from "@google/genai";
import { ChoiceRecord, StayTimeRecord } from "../types";

// 获取 API KEY
// 在 Netlify 部署时，请在 Site Settings -> Environment variables 中添加 API_KEY
const apiKey = (import.meta as any).env?.VITE_API_KEY || process.env.API_KEY || "";

const ai = new GoogleGenAI({ apiKey });

/**
 * 获取基于用户选择和行为的文学心理分析
 */
export const getAIAnalysis = async (choices: ChoiceRecord[], timings: StayTimeRecord[], username: string) => {
  const choiceDetails = choices.map(c => `[阶段${c.step}] 在节点${c.nodeId}选择了: "${c.text}" (倾向: ${c.path})`).join("\n");
  
  const topTimings = [...timings]
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 3)
    .map(t => `在节点${t.nodeId}沉思了 ${Math.floor(t.duration/1000)}秒`)
    .join("\n");

  const prompt = `
    你是一位享誉国际的叙事分析师与文学心理学家。请基于读者 ${username} 在互动故事《拾光旧书》中的真实选择轨迹与行为数据，为其撰写一份极具文学美感、直抵灵魂的情感画像报告。
    
    【读者选择记录】:
    ${choiceDetails}

    【深度行为特征(重点分析时长较长的瞬间)】:
    ${topTimings}

    请输出一段大约250-350字的中文文本，直接以“你”开头。
    语言风格：模仿川端康成或村上春树的文风——细腻、忧郁、充满留白。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    
    return response.text?.trim() || "在时光的褶皱里，你留下了不可磨灭的芬芳。";
  } catch (error) {
    console.error("AI Analysis Failed:", error);
    return `${username}，你在时光的缝隙中缓缓行走。无论最终走向何方，那份愿意慢下来去感知的温柔，已是你在尘埃中开出的最坚韧的雏菊。`;
  }
};
