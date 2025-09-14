
import React from 'react';

const CONFETTI_COUNT = 150;

const Confetti: React.FC = () => {
  const confetti = Array.from({ length: CONFETTI_COUNT }).map((_, i) => {
    const style = {
      left: `${Math.random() * 100}%`,
      animationDuration: `${Math.random() * 3 + 2}s`, // 2-5 seconds
      animationDelay: `${Math.random() * 2}s`,
      backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
      transform: `rotate(${Math.random() * 360}deg)`,
    };
    return <i key={i} style={style} />;
  });

  return (
    <>
      <div className="confetti-container" aria-hidden="true">
        {confetti}
      </div>
      <style>{`
        .confetti-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          overflow: hidden;
          z-index: 9999;
        }
        .confetti-container i {
          position: absolute;
          top: -20px;
          width: 8px;
          height: 16px;
          opacity: 0;
          animation: confetti-fall 3s ease-in-out forwards;
        }
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
};

export default Confetti;
