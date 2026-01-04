
import React from 'react';

interface ChoiceButtonProps {
  text: string;
  subtext: string;
  onClick: () => void;
}

const ChoiceButton: React.FC<ChoiceButtonProps> = ({ text, subtext, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col items-start p-5 bg-white border border-slate-100 border-l-4 border-l-slate-400 rounded-lg text-left transition-all hover:bg-slate-50 hover:border-sky-500 hover:border-l-sky-500 hover:translate-x-2 shadow-sm hover:shadow-md"
    >
      <span className="text-slate-800 font-medium text-lg leading-snug">{text}</span>
      <span className="text-slate-400 text-sm mt-1 group-hover:text-sky-400 transition-colors">{subtext}</span>
    </button>
  );
};

export default ChoiceButton;
