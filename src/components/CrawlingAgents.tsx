
import React, { useEffect, useState } from 'react';

interface Agent {
  id: string;
  name: string;
  color: string;
  emoji: string;
  position: number;
  isVisible: boolean;
}

interface CrawlingAgentsProps {
  isActive: boolean;
  currentStep: string;
}

export const CrawlingAgents: React.FC<CrawlingAgentsProps> = ({ isActive, currentStep }) => {
  const [agents, setAgents] = useState<Agent[]>([
    { id: 'lexi', name: 'Lexi', color: 'text-green-400', emoji: '🕷️', position: 0, isVisible: false },
    { id: 'poly', name: 'Poly', color: 'text-blue-400', emoji: '🤖', position: 0, isVisible: false },
    { id: 'vera', name: 'Vera', color: 'text-amber-400', emoji: '🦋', position: 0, isVisible: false },
    { id: 'tala', name: 'Tala', color: 'text-purple-400', emoji: '🐛', position: 0, isVisible: false },
    { id: 'zane', name: 'Zane', color: 'text-red-400', emoji: '🦀', position: 0, isVisible: false }
  ]);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setAgents(prevAgents => 
        prevAgents.map(agent => {
          if (Math.random() < 0.3) {
            return {
              ...agent,
              isVisible: !agent.isVisible,
              position: Math.random() * 90
            };
          }
          return {
            ...agent,
            position: agent.position + (Math.random() - 0.5) * 10
          };
        })
      );
    }, 800);

    return () => clearInterval(interval);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
      {agents.map(agent => (
        <div
          key={agent.id}
          className={`absolute transition-all duration-1000 ${agent.color} ${
            agent.isVisible ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            left: `${Math.max(0, Math.min(95, agent.position))}%`,
            top: `${10 + Math.sin(Date.now() / 1000 + agent.position) * 5}%`,
            transform: 'translateY(-50%)',
            fontSize: '2rem'
          }}
        >
          <div className="animate-bounce-slow">
            {agent.emoji}
          </div>
          <div className="text-xs font-bold mt-1 text-center">{agent.name}</div>
        </div>
      ))}
    </div>
  );
};
