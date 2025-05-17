import { useState, useRef, useEffect } from 'react'
import './App.css'

const CARD_COUNT = 8;
const CARD_WIDTH = 120;
const CARD_HEIGHT = 180;
const CARD_GAP = 32;
const MOVE_SPEED = 1.2; // px per frame

const cardData = Array.from({ length: CARD_COUNT }, (_, i) => ({
  id: i,
  title: `卡牌 ${i + 1}`,
  text: `這是卡牌 ${i + 1} 的內容。`
}))

function App() {
  const [positions, setPositions] = useState(
    Array.from({ length: CARD_COUNT }, (_, i) => i * (CARD_WIDTH + CARD_GAP))
  );
  const [isPaused, setIsPaused] = useState(false);
  const animationRef = useRef();
  const containerRef = useRef();

  // 循環移動動畫
  useEffect(() => {
    if (isPaused) return;
    const animate = () => {
      setPositions(prev => {
        const containerWidth = containerRef.current?.offsetWidth || 1200;
        return prev.map((x, i) => {
          let nx = x + MOVE_SPEED;
          const totalWidth = CARD_COUNT * (CARD_WIDTH + CARD_GAP);
          if (nx > containerWidth) {
            nx -= totalWidth;
          }
          return nx;
        });
      });
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [isPaused]);

  return (
    <div className="card-container" ref={containerRef}>
      {cardData.map((card, i) => (
        <div
          className="card"
          key={card.id}
          style={{
            left: positions[i],
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            top: '50%',
            transform: 'translateY(-50%)',
            position: 'absolute',
            transition: isPaused ? 'none' : 'left 0.1s linear',
            zIndex: 1
          }}
        >
          <div className="card-title">{card.title}</div>
        </div>
      ))}
    </div>
  );
}

export default App
