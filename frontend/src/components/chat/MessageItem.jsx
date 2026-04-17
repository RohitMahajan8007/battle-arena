import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { User, ThumbsUp, Equal, Eye, ShieldCheck, Cpu, Swords } from 'lucide-react';
import JudgePanel from './JudgePanel';

const MarkdownRenderer = ({ content }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          return !inline && match ? (
            <SyntaxHighlighter
              style={dracula}
              language={match[1]}
              PreTag="div"
              className="rounded-lg border border-white/5 my-4 text-sm bg-black/30 font-mono"
              {...props}
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          ) : (
            <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm text-gray-200" {...props}>
              {children}
            </code>
          );
        },
        p: ({ children }) => <p className="mb-4 last:mb-0 leading-relaxed text-gray-300">{children}</p>,
        h1: ({ children }) => <h1 className="text-xl font-bold mb-4 mt-6 text-white">{children}</h1>,
        h2: ({ children }) => <h2 className="text-lg font-semibold mb-3 mt-5 text-white">{children}</h2>,
        ul: ({ children }) => <ul className="list-disc pl-5 mb-4 text-gray-400 space-y-1">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-5 mb-4 text-gray-400 space-y-1">{children}</ol>,
        li: ({ children }) => <li>{children}</li>,
        blockquote: ({ children }) => <blockquote className="border-l-4 border-white/20 pl-4 py-1 mb-4 italic text-gray-400">{children}</blockquote>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

const MessageItem = ({ msg, onVote }) => {
  const preference = msg.preference || null;
  const setPreference = (pref) => onVote(msg._id, pref);
  const revealed = preference !== null && preference !== undefined;

  const modelA = msg.model_a || 'Mistral';
  const modelB = msg.model_b || 'Cohere';
  const isDoneStreaming = msg.solution_1 && msg.solution_2;

  // Header styles based on reveal
  const getHeaderStyle = (side) => {
    if (!revealed) return 'bg-[#1c1a19] border-white/5 text-gray-500';
    if (side === 'a') return 'bg-blue-600/10 border-blue-500/20 text-blue-100';
    return 'bg-purple-600/10 border-purple-500/20 text-purple-100';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Question */}
      <div className="flex justify-end pr-1">
        <div className="flex flex-col items-end gap-2 max-w-[85%] sm:max-w-[75%]">
           <div className="bg-[#302e2c] border border-white/10 text-gray-100 px-6 py-4 rounded-3xl rounded-tr-sm shadow-xl leading-relaxed">
             {msg.problem}
           </div>
           <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-gray-500 mr-2">
             <User size={12} /> You
           </div>
        </div>
      </div>

      {/* Solutions Container */}
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          
          {/* Solution A */}
          <div className={`relative bg-[#2a2826] rounded-3xl border transition-all duration-700 overflow-hidden flex flex-col ${
            revealed && preference === 'a' ? 'border-blue-500/40 shadow-2xl ring-1 ring-blue-500/20' : 'border-white/5'
          }`}>
             <div className={`px-5 py-4 flex items-center justify-between border-b transition-all duration-700 ${getHeaderStyle('a')}`}>
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shadow-lg ${revealed ? 'bg-blue-500 text-white' : 'bg-[#1c1a19] text-gray-600'}`}>A</span>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-tighter opacity-70 font-black">Model A</span>
                    {revealed && <span className="text-sm font-black tracking-tight flex items-center gap-1.5 animate-in slide-in-from-left-2">{modelA}</span>}
                  </div>
                </div>
                {revealed && preference === 'a' && <ShieldCheck size={18} className="text-blue-400" />}
             </div>
             <div className="p-6 flex-1 overflow-x-auto no-scrollbar">
                <MarkdownRenderer content={msg.solution_1} />
             </div>
          </div>

          {/* Solution B */}
          <div className={`relative bg-[#2a2826] rounded-3xl border transition-all duration-700 overflow-hidden flex flex-col ${
            revealed && preference === 'b' ? 'border-purple-500/40 shadow-2xl ring-1 ring-purple-500/20' : 'border-white/5'
          }`}>
             <div className={`px-5 py-4 flex items-center justify-between border-b transition-all duration-700 ${getHeaderStyle('b')}`}>
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shadow-lg ${revealed ? 'bg-purple-500 text-white' : 'bg-[#1c1a19] text-gray-600'}`}>B</span>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-tighter opacity-70 font-black">Model B</span>
                    {revealed && <span className="text-sm font-black tracking-tight flex items-center gap-1.5 animate-in slide-in-from-left-2">{modelB}</span>}
                  </div>
                </div>
                {revealed && preference === 'b' && <ShieldCheck size={18} className="text-purple-400" />}
             </div>
             <div className="p-6 flex-1 overflow-x-auto no-scrollbar">
                <MarkdownRenderer content={msg.solution_2} />
             </div>
          </div>
        </div>

        {/* Voting Row */}
        {!revealed && isDoneStreaming ? (
          <div className="flex flex-col items-center gap-4 py-6 animate-in slide-in-from-bottom-8 duration-700">
            <p className="text-sm text-gray-400 font-black uppercase tracking-[0.2em]">Pick the better answer</p>
            <div className="flex items-center gap-4 flex-wrap justify-center">
              <button onClick={() => setPreference('a')} className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-blue-600/20 hover:border-blue-500/40 transition-all active:scale-95 shadow-xl">
                <ThumbsUp size={20} className="group-hover:scale-110 transition-transform" /> <span className="font-black text-sm uppercase">A is Better</span>
              </button>
              <button onClick={() => setPreference('tie')} className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all active:scale-95 shadow-xl">
                <Equal size={20} /> <span className="font-black text-sm uppercase">Tie</span>
              </button>
              <button onClick={() => setPreference('b')} className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-purple-600/20 hover:border-purple-500/40 transition-all active:scale-95 shadow-xl">
                <ThumbsUp size={20} className="scale-x-[-1] group-hover:scale-110 transition-transform" /> <span className="font-black text-sm uppercase">B is Better</span>
              </button>
            </div>
          </div>
        ) : revealed ? (
          <div className="py-2 animate-in zoom-in duration-500">
            <div className="flex flex-col items-center gap-4 px-8 py-6 bg-[#1c1a19] border border-white/5 rounded-3xl shadow-3xl mx-auto max-w-2xl">
              <div className="flex items-center gap-3 text-gray-400 text-xs font-black uppercase tracking-widest">
                <Eye size={16} /> Identity Revealed
              </div>
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center gap-1">
                   <span className="text-[10px] text-gray-500 font-bold uppercase">Model A</span>
                   <span className="text-xl font-black text-blue-400 leading-none">{modelA}</span>
                </div>
                <div className="h-8 w-[1px] bg-white/10"></div>
                <div className="flex flex-col items-center gap-1">
                   <span className="text-[10px] text-gray-500 font-bold uppercase">Model B</span>
                   <span className="text-xl font-black text-purple-400 leading-none">{modelB}</span>
                </div>
              </div>
              <div className="text-xs text-gray-500 font-medium">
                {preference === 'tie' ? "Both models were equally matched." : <span>You preferred <span className={preference === 'a' ? 'text-blue-400' : 'text-purple-400'}>{preference === 'a' ? modelA : modelB}</span> for this task.</span>}
              </div>
            </div>
          </div>
        ) : null}

        {/* Judge */}
        {msg.judge && revealed && (
          <div className="pt-8 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#242220] px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">
              Battle Evaluation
            </div>
            <JudgePanel judgeData={msg.judge} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
