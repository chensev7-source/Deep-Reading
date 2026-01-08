import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import Layout from './components/Layout';
import ChoiceButton from './components/ChoiceButton';
import ReportCard from './components/ReportCard';
import { AppState, ChoiceRecord, StoryPath, Feedback, StayTimeRecord } from './types';
import { STORY_DATA } from './constants';
import { getAIAnalysis } from './services/geminiService';
import { Send, LogOut, ChevronRight, BarChart3, Award, Download, RefreshCcw } from 'lucide-react';

const App: React.FC = () => {
  const [sessionKey, setSessionKey] = useState<number>(0);
  const [state, setState] = useState<AppState>({
    user: null,
    currentScreen: 'login',
    currentNodeId: 'story-node-1',
    choices: [],
    nodeTimings: [],
    feedback: null,
    aiAnalysis: null,
    startTime: null
  });

  const nodeStartTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [state.currentScreen, state.currentNodeId]);

  const navigateTo = (screen: AppState['currentScreen'], nodeId?: string) => {
    const duration = Date.now() - nodeStartTimeRef.current;
    if (state.currentScreen === 'story') {
      setState(prev => ({
        ...prev,
        nodeTimings: [...prev.nodeTimings, { nodeId: prev.currentNodeId, duration }]
      }));
    }

    nodeStartTimeRef.current = Date.now();
    setState(prev => ({
      ...prev,
      currentScreen: screen,
      currentNodeId: nodeId || prev.currentNodeId
    }));
  };

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    setState(prev => ({ 
      ...prev, 
      user: { username, isGuest: false }, 
      currentScreen: 'welcome' 
    }));
  };

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert("演示模式：注册已模拟成功，请直接登录。");
    navigateTo('login');
  };

  const makeChoice = (path: StoryPath, nextId: string, text: string) => {
    const record: ChoiceRecord = {
      nodeId: state.currentNodeId,
      step: state.choices.length + 1,
      path,
      text,
      timestamp: Date.now()
    };
    
    setState(prev => ({
      ...prev,
      choices: [...prev.choices, record]
    }));

    navigateTo('story', nextId);
  };

  const submitFeedback = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const feedback: Feedback = {
      agencyScore: Number(formData.get('agency')),
      emotionScore: Number(formData.get('emotion')),
      comment: formData.get('comment') as string
    };
    
    setState(prev => ({ ...prev, feedback }));
    navigateTo('report');

    const analysis = await getAIAnalysis(state.choices, state.nodeTimings, state.user?.username || '读者');
    setState(prev => ({ ...prev, aiAnalysis: analysis }));
  };

  const restartJourney = () => {
    if (window.confirm("确定要重置当前故事记录并开启新的旅程吗？")) {
      setSessionKey(prev => prev + 1);
      nodeStartTimeRef.current = Date.now();
      setState(prev => ({
        ...prev,
        currentScreen: 'welcome',
        currentNodeId: 'story-node-1',
        choices: [],
        nodeTimings: [],
        feedback: null,
        aiAnalysis: null,
        startTime: Date.now()
      }));
    }
  };

  const fullReset = () => {
    if (window.confirm("确定要退出当前账号并返回首页吗？")) {
      setSessionKey(prev => prev + 1);
      setState({
        user: null,
        currentScreen: 'login',
        currentNodeId: 'story-node-1',
        choices: [],
        nodeTimings: [],
        feedback: null,
        aiAnalysis: null,
        startTime: null
      });
    }
  };

  const downloadPDF = () => {
    const reportElement = document.getElementById('report-capture');
    if (!reportElement) return;

    html2canvas(reportElement, { scale: 2, useCORS: true, backgroundColor: '#f7f5f0' }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`拾光旧书_阅读报告_${state.user?.username || '读者'}.pdf`);
    });
  };

  return (
    <Layout key={sessionKey}>
      {state.currentScreen === 'login' && (
        <div id="login-page" className="flex flex-col items-center justify-center py-8 animate-in fade-in duration-700">
          <div className="text-6xl mb-6">📖</div>
          <h1 className="serif-font text-4xl font-bold text-slate-800 mb-2">拾光旧书店</h1>
          <p className="serif-font text-slate-500 italic mb-8 text-center px-4">一段关于寻找、迷失与救赎的互动旅程</p>
          <form onSubmit={handleLogin} className="w-full max-w-xs space-y-4 px-4">
            <input name="username" type="text" placeholder="参与者署名" required className="w-full p-4 border rounded-lg outline-none focus:ring-2 focus:ring-amber-500 transition-all shadow-sm" />
            <input type="password" placeholder="通行密码 (演示期间可为空)" className="w-full p-4 border rounded-lg outline-none shadow-sm" />
            <button type="submit" className="w-full bg-slate-800 text-white p-4 rounded-lg font-bold hover:bg-slate-700 shadow-md transition-all active:scale-95">推开店门</button>
            <button type="button" onClick={() => navigateTo('register')} className="w-full text-sm text-slate-400 hover:text-amber-600 transition-colors">没有账号？点击注册新身份</button>
          </form>
        </div>
      )}

      {state.currentScreen === 'register' && (
        <div id="register-page" className="flex flex-col items-center justify-center py-8 animate-in fade-in px-4">
          <h1 className="serif-font text-3xl font-bold mb-8 text-center">建立新的身份</h1>
          <form onSubmit={handleRegister} className="w-full max-w-xs space-y-4">
            <input type="text" placeholder="设置用户名" required className="w-full p-4 border rounded-lg outline-none" />
            <input type="password" placeholder="设置密码" required className="w-full p-4 border rounded-lg outline-none" />
            <button type="submit" className="w-full bg-amber-600 text-white p-4 rounded-lg font-bold">注册并返回登录</button>
            <button type="button" onClick={() => navigateTo('login')} className="w-full text-slate-400">返回登录页</button>
          </form>
        </div>
      )}

      {state.currentScreen === 'welcome' && (
        <div id="welcome-page" className="animate-in fade-in duration-1000 space-y-8 flex flex-col justify-center min-h-[400px] px-2 md:px-0">
          <h2 className="serif-font text-3xl font-bold text-center border-b pb-6 border-dashed text-slate-800">序章：关于选择</h2>
          <div className="serif-font text-xl leading-relaxed text-slate-700 space-y-6">
            <p>你好，<span className="text-amber-700 font-bold border-b-2 border-amber-200">{state.user?.username}</span>。</p>
            <p>欢迎来到这家名为“拾光”的旧书店。在这里，你将不再是一个旁观者，而是故事的主角。</p>
            <p>你即将经历一个关于承诺、欲望、真相与温情的故事。请注意，你的每一次选择都不仅仅是点击一个按钮，它们是通往不同平行宇宙的钥匙。</p>
            <p className="text-right italic text-slate-400 mt-12">—— 命运，正握在你的指尖。</p>
          </div>
          <div className="flex justify-center pt-6">
            <button onClick={() => { setState(prev => ({...prev, startTime: Date.now()})); navigateTo('story', 'story-node-1'); }} className="bg-slate-800 text-white px-12 py-4 rounded-lg font-bold hover:bg-slate-900 flex items-center gap-2 group shadow-xl transition-all active:scale-95">
              踏入时光的涟漪 <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {state.currentScreen === 'story' && (
        <div key={state.currentNodeId} className="animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col h-full">
          <h2 className="serif-font text-2xl font-bold mb-8 border-b pb-4 border-dashed text-amber-900">{STORY_DATA[state.currentNodeId]?.title}</h2>
          <div className="serif-font text-lg leading-loose text-slate-700 flex-grow space-y-6 overflow-y-auto no-scrollbar pr-2">
            {STORY_DATA[state.currentNodeId]?.content.split('\n\n').map((p, i) => (
              <p key={i} className="indent-8 text-justify">{p}</p>
            ))}
          </div>
          
          <div className="grid grid-cols-1 gap-4 mt-8">
            {STORY_DATA[state.currentNodeId]?.choices && STORY_DATA[state.currentNodeId].choices.length > 0 ? (
              STORY_DATA[state.currentNodeId].choices.map((c, i) => (
                <ChoiceButton key={i} text={c.text} subtext={c.subtext} onClick={() => makeChoice(c.path, c.nextId, c.text)} />
              ))
            ) : (
              <button 
                onClick={() => navigateTo('feedback')}
                className="bg-amber-700 text-white p-5 rounded-lg font-bold hover:bg-amber-800 shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                故事已写就：进入灵魂回响 <Send size={18} />
              </button>
            )}
          </div>
        </div>
      )}

      {state.currentScreen === 'feedback' && (
        <div id="feedback-page" className="animate-in fade-in duration-500 px-2 md:px-0">
          <h2 className="serif-font text-2xl font-bold mb-8 text-center border-b pb-4 border-dashed">实验反馈：心灵的震颤</h2>
          <form onSubmit={submitFeedback} className="space-y-10">
            <div className="space-y-4">
              <label className="block font-bold text-slate-700">1. 代理感：你认为自己的选择改变了结局吗？</label>
              <div className="flex justify-between bg-white p-5 rounded-xl border border-slate-100 shadow-sm overflow-x-auto gap-2">
                {[1, 2, 3, 4, 5].map(v => (
                  <label key={v} className="cursor-pointer group flex flex-col items-center">
                    <input type="radio" name="agency" value={v} required className="peer hidden" />
                    <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border-2 border-slate-100 peer-checked:border-amber-500 peer-checked:bg-amber-50 peer-checked:text-amber-600 transition-all font-bold text-slate-300">{v}</div>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <label className="block font-bold text-slate-700">2. 情感共鸣满意度：</label>
              <div className="flex justify-between bg-white p-5 rounded-xl border border-slate-100 shadow-sm overflow-x-auto gap-2">
                {[1, 2, 3, 4, 5].map(v => (
                  <label key={v} className="cursor-pointer group flex flex-col items-center">
                    <input type="radio" name="emotion" value={v} required className="peer hidden" />
                    <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border-2 border-slate-100 peer-checked:border-amber-500 peer-checked:bg-amber-50 peer-checked:text-amber-600 transition-all font-bold text-slate-300">{v}</div>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <label className="block font-bold text-slate-700">3. 留给时空的私语：</label>
              <textarea name="comment" placeholder="那一刻，你在想什么？或者你想对林晓雅、对老人说点什么..." className="w-full p-4 h-32 border rounded-xl outline-none focus:ring-2 focus:ring-amber-500 transition-all resize-none shadow-inner"></textarea>
            </div>
            <div className="flex justify-center pt-4">
              <button type="submit" className="bg-amber-700 text-white px-12 py-4 rounded-lg font-bold hover:bg-amber-800 flex items-center gap-2 group shadow-xl active:scale-95 transition-all">
                生成灵魂画像 <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      )}

      {state.currentScreen === 'report' && (
        <div id="report-page" className="animate-in fade-in duration-1000 space-y-10">
          <div id="report-capture">
            <ReportCard state={state} />
          </div>
          <div className="flex flex-wrap gap-4 justify-center pt-4 no-print pb-10 px-4">
            <button onClick={downloadPDF} className="bg-white border-2 border-slate-200 px-6 py-3 rounded-lg hover:border-amber-500 hover:text-amber-700 transition-all flex items-center gap-2 font-bold shadow-sm active:scale-95">
              <Download size={18} /> 下载 PDF
            </button>
            <button onClick={() => navigateTo('dashboard')} className="bg-slate-800 text-white px-8 py-3 rounded-lg hover:bg-slate-900 transition-all flex items-center gap-2 font-bold shadow-lg active:scale-95">
              <BarChart3 size={18} /> 实验看板
            </button>
            <button 
              id="restartBtn" 
              onClick={restartJourney} 
              className="bg-white border-2 border-slate-200 px-6 py-3 rounded-lg hover:border-amber-500 hover:text-amber-700 transition-all flex items-center gap-2 font-bold text-slate-600 shadow-sm active:scale-95"
            >
              <RefreshCcw size={18} /> 开启新的旅程
            </button>
          </div>
        </div>
      )}

      {state.currentScreen === 'dashboard' && (
        <div id="visual-page" className="animate-in fade-in duration-500 space-y-10 h-full overflow-y-auto no-scrollbar pb-10 px-4">
          <h2 className="serif-font text-2xl font-bold text-center border-b pb-4 border-dashed flex items-center justify-center gap-2 text-slate-800">
            <BarChart3 className="text-amber-600" /> 实验数据总览
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner">
              <h4 className="font-bold mb-4 flex items-center gap-2 text-slate-700"><Award size={16} /> 决策轨迹</h4>
              <ul className="space-y-4">
                {state.choices.map((c, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="w-5 h-5 rounded bg-slate-700 text-white flex items-center justify-center shrink-0 mt-0.5">{i+1}</span>
                    <span className="text-slate-600">你选择了“<span className="text-slate-900 font-medium">{c.text}</span>”，倾向: <span className="font-bold text-amber-600 uppercase">{c.path}</span></span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col justify-center text-center space-y-8 shadow-inner">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">心流共感时长</p>
                <p className="text-5xl font-bold text-slate-800">
                  {state.nodeTimings.reduce((acc, curr) => acc + curr.duration, 0) / 1000} <span className="text-sm">s</span>
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">叙事掌控力</p>
                <p className="text-5xl font-bold text-amber-600">
                  {((state.feedback?.agencyScore || 0) / 5 * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-6 pt-4">
            <button onClick={() => navigateTo('report')} className="text-slate-500 hover:text-amber-700 transition-colors font-medium border-b border-transparent hover:border-amber-700 pb-1">← 返回情感报告</button>
            <button onClick={fullReset} className="flex items-center gap-2 text-xs text-slate-300 hover:text-red-400 transition-colors group">
              <LogOut size={12} className="group-hover:rotate-12 transition-transform" /> 结束实验并登出
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;