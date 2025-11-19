import React from 'react';
import { PERSONALITY_QUESTIONS } from '@/constants';

interface PersonalityQuestionsProps {
  onAnswerChange: (questionId: string, answer: string) => void;
  currentAnswers: Record<string, string>;
}

export const PersonalityQuestions: React.FC<PersonalityQuestionsProps> = ({ onAnswerChange, currentAnswers }) => {
  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-inner border border-gray-200 mt-8">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Personality Insights</h3>
      <p className="text-gray-600 mb-6">
        Answer a few questions to help us understand your unique personality and refine your aura analysis.
      </p>
      <div className="space-y-6">
        {PERSONALITY_QUESTIONS.map((q) => (
          <div key={q.id} className="bg-white p-4 rounded-md shadow-sm border border-gray-100">
            <p className="font-medium text-gray-800 mb-3">{q.question}</p>
            <div className="flex flex-col sm:flex-row gap-3">
              {q.options.map((option) => (
                <label
                  key={option}
                  className={`flex items-center p-3 rounded-full cursor-pointer transition-all duration-200 ease-in-out
                    ${currentAnswers[q.id] === option
                      ? 'bg-indigo-100 text-indigo-800 border-indigo-500 border-2 shadow-md'
                      : 'bg-gray-100 text-gray-700 border-gray-300 border hover:bg-gray-200'
                    }`}
                >
                  <input
                    type="radio"
                    name={q.id}
                    value={option}
                    checked={currentAnswers[q.id] === option}
                    onChange={() => onAnswerChange(q.id, option)}
                    className="hidden" // Hide native radio button
                    aria-label={option}
                  />
                  <span className="text-sm font-medium">{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};