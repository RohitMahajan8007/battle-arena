import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const JudgePanel = ({ judgeData }) => {
  return (
    <div className="bg-[#302e2c] rounded-2xl border border-white/5 shadow-md overflow-hidden mt-6 text-gray-200">
      <div className="bg-white/5 border-b border-white/5 px-5 py-4 flex items-center gap-2">
        <CheckCircle2 size={18} className="text-gray-300" />
        <h3 className="font-semibold text-gray-100 flex-1">Judge Evaluation</h3>
        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 bg-blue-400/10 border border-blue-400/20 px-2 py-1 rounded-md">
          {judgeData.judge_model || 'Gemini 1.5 Pro'}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/5">
        
        {/* Eval 1 */}
        <div className="p-6">
          <div className="flex items-end gap-3 mb-4">
            <div className={`text-3xl font-bold ${judgeData.solution_1_score >= judgeData.solution_2_score ? 'text-gray-100' : 'text-gray-400'}`}>
              {judgeData.solution_1_score}<span className="text-lg text-gray-500 font-normal">/10</span>
            </div>
            {judgeData.solution_1_score >= judgeData.solution_2_score && <span className="text-xs font-semibold uppercase tracking-wider text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-1 rounded mb-1">Winner</span>}
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            {judgeData.solution_1_reasoning}
          </p>
        </div>

        {/* Eval 2 */}
        <div className="p-6">
          <div className="flex items-end gap-3 mb-4">
            <div className={`text-3xl font-bold ${judgeData.solution_2_score >= judgeData.solution_1_score ? 'text-gray-100' : 'text-gray-400'}`}>
              {judgeData.solution_2_score}<span className="text-lg text-gray-500 font-normal">/10</span>
            </div>
            {judgeData.solution_2_score > judgeData.solution_1_score && <span className="text-xs font-semibold uppercase tracking-wider text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-1 rounded mb-1">Winner</span>}
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            {judgeData.solution_2_reasoning}
          </p>
        </div>

      </div>
    </div>
  );
};

export default JudgePanel;
