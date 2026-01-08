import { GoogleGenAI } from "@google/genai";
import { ChoiceRecord, StayTimeRecord } from "../types";

// Always use process.env.API_KEY directly for initialization as per guidelines.
// This fixes the error where import.meta.env was being accessed.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAIAnalysis = async (choices: ChoiceRecord[], timings: StayTimeRecord[], username: string) => {
  const choiceDetails = choices.map(c => `[阶段${c.step}] 选择: "${c.text}" (倾向: ${c.path})`).join("\n");
  const topTimings = [...timings]
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 3)
    .map(t => `在${t.nodeId}沉思${Math.floor(t.duration/1000)}秒`)
    .join("\n");

  const prompt = `你是一位文学心理学家。请基于读者 ${username} 的轨迹撰写灵魂画像报告。
    选择：${choiceDetails}
    行为特征：${topTimings}
    要求：250字左右，以“你”开头，川端康成文风。`;

  try {
    // Generate content using the recommended model for complex reasoning and literary tasks.
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    // response.text is a property, not a method, and returns the extracted string output.
    return response.text || "时光流转，你已在文字中找到了属于自己的坐标。";
  } catch (error) {
    return "在静谧的选择中，你展现了对生命独有的温柔与坚持。";
  }
};