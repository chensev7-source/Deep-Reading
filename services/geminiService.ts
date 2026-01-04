
import { GoogleGenAI } from "@google/genai";
import { ChoiceRecord, StayTimeRecord } from "../types";

// 使用注入的 API_KEY 初始化 Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

/**
 * 获取基于用户选择和行为的文学心理分析
 * 结合了决策路径和在关键节点上的停留时间
 */
export const getAIAnalysis = async (choices: ChoiceRecord[], timings: StayTimeRecord[], username: string) => {
  const choiceDetails = choices.map(c => `[阶段${c.step}] 在节点${c.nodeId}选择了: "${c.text}" (倾向: ${c.path})`).join("\n");
  
  // 找出停留时间最长的三个节点
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

    请输出一段大约250-350字的中文文本，要求：
    1. **叙事人格定位**：根据其路径倾向（救赎、沉沦、悬疑、温情），赋予一个极具诗意与张力的称号。
    2. **潜意识解析**：分析其在那些停留较久的节点中，内心正在经历怎样的博弈？是现实的纠葛、道德的自省、还是对未知的敬畏？
    3. **灵魂回响寄语**：结合其最终的结局，给出一段充满电影画面感的总结，要让读者感受到一种如获新生或宿命般的震颤。
    
    语言风格：模仿川端康成或村上春树的文风——细腻、忧郁、充满留白。多用自然意象（如：梧桐落叶、旧纸张的冷香、冬日午后的微光、潮湿的青石板）。
    
    直接输出分析内容，不要任何标题或前缀，以“你”开头。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // 使用更强大的 Pro 模型进行复杂逻辑与文学分析
      contents: prompt,
      config: {
        temperature: 0.9,
        topP: 0.95,
        topK: 64,
      }
    });
    
    const text = response.text;
    if (!text) throw new Error("AI returned empty text");
    return text.trim();
  } catch (error) {
    console.error("AI Analysis Failed:", error);
    // 优雅降级：提供一份高质量的通用文学寄语
    return `${username}，你在时光的缝隙中缓缓行走。那些被你拾起的纸页，在指尖留下了泛黄的余温。每一个抉择，其实都是你在试图与那个最真实的自己达成某种和解。在那段停留最久的沉默里，你或许听到了旧书店深处传来的、关于命运的低语。无论最终走向何方，那份愿意慢下来去感知的温柔，已是你在尘埃中开出的、最坚韧的雏菊。`;
  }
};
