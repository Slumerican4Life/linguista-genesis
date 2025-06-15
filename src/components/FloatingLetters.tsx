
import React from 'react';

export const FloatingLetters = () => {
  const letters = ['A', 'B', 'L', 'Y', 'R', 'I', 'N', 'G', 'U', 'S', 'T', 'X'];
  
  const getRandomDelay = (index: number) => `${index * 0.5}s`;
  const getRandomDuration = () => `${3 + Math.random() * 2}s`;

  return (
    <div className="floating-letters">
      {letters.map((letter, index) => (
        <div
          key={index}
          className="floating-letter animate-float-letter"
          style={{
            animationDelay: getRandomDelay(index),
            animationDuration: getRandomDuration()
          }}
        >
          {letter}
        </div>
      ))}
    </div>
  );
};
