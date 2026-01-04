
import React, { useMemo } from 'react';
import { AppState, StoryPath } from '../types';

interface ReportCardProps {
  state: AppState;
}

const ReportCard: React.FC<ReportCardProps> = ({ state }) => {
  const persona = useMemo(() => {
    const counts: Record<StoryPath, number> = { redemption: 0, decline: 0, suspense: 0, warmth: 0 };
    state.choices.forEach(c => counts[c.path]++);
    const mainPath = Object.keys(counts).reduce((a, b) => counts[a as StoryPath] > counts[b as StoryPath] ? a : b) as StoryPath;
    
    const meta = {
      redemption: { tag: '善意传递者', icon: '🕯️', color: 'bg-emerald-500', demand: '寻求道德闭环与价值认同', char: '内心柔软且极具责任感，相信微光足以抵御严寒。' },
      decline: { tag: '深度思考者', icon: '🌑', color: 'bg-indigo-600', demand: '探索人性挣扎与情感共鸣', char: '心思细腻敏锐，乐于审视白昼下的阴影，对真相有近乎残酷的执着。' },
      suspense: { tag: '理性探索者', icon: '🔍', color: 'bg-sky-500', demand: '智力博弈与逻辑掌控', char: '思维缜密冷峻，不被表象蒙蔽，擅长从细枝末节中拼凑世界的真相。' },
      warmth: { tag: '温暖共情者', icon: '☕', color: 'bg-amber-500', demand: '情感连接与现实慰藉', char: '性格温润如玉，比起抽象的宏大叙事，更愿意守护身边具体的苦难与温情。' }
    };
    return { ...meta[mainPath], counts };
  }, [state.choices]);

  const totalTime = useMemo(() => {
    return Math.floor(state.nodeTimings.reduce((a, c) => a + c.duration, 0) / 1000);
  }, [state.nodeTimings]);

  return (
    <div className="serif-font p-8 md:p-12 bg-[#fafafa] border border-slate-200 rounded-lg shadow-inner text-slate-800 space-y-10">
      <div className="text-center border-b pb-8 border-slate-200 border-dashed">
        <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">拾光叙事 · 专属情感画像</h2>
        <div className="flex justify-center items-center gap-4 text-sm text-slate-400">
          <span>体验者: <strong className="text-slate-600">{state.user?.username}</strong></span>
          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
          <span>时间: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      <section className="flex flex-col md:flex-row gap-10 items-center bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <div className={`w-32 h-32 shrink-0 rounded-full ${persona.color} flex items-center justify-center text-5xl shadow-lg ring-8 ring-slate-50`}>
          {persona.icon}
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full uppercase tracking-widest">核心人格</span>
            <h3 className="text-2xl font-bold text-slate-800">{persona.tag}</h3>
          </div>
          <p className="text-slate-600 leading-relaxed italic">“{persona.char}”</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-slate-400">情感需求：</span><span className="font-medium">{persona.demand}</span></div>
            <div><span className="text-slate-400">总共感时长：</span><span className="font-medium text-amber-600">{totalTime}s</span></div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <div className="w-8 h-px bg-slate-200"></div> 灵魂回响 (AI 深度分析)
        </h4>
        <div className="bg-amber-50/50 p-6 md:p-8 rounded-2xl border border-amber-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
          {state.aiAnalysis ? (
            <p className="text-lg leading-relaxed text-slate-700 whitespace-pre-wrap italic">
              {state.aiAnalysis}
            </p>
          ) : (
            <div className="flex flex-col items-center py-8 gap-4 text-amber-300">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
              <p className="text-sm animate-pulse">正在从字里行间打捞你的灵魂碎片...</p>
            </div>
          )}
        </div>
      </section>

      <div className="pt-8 text-center text-[10px] text-slate-300 uppercase tracking-[0.3em]">
        愿你在每个被拾起的时光里，都能与更真实的自己重逢
      </div>
    </div>
  );
};

export default ReportCard;
