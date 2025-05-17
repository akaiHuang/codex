import { useState, useRef, useEffect, useMemo } from 'react'
import './App.css'

const CARD_COUNT = 8;
const CARD_WIDTH = 120;
const CARD_HEIGHT = 180;
const CARD_GAP = 32;
const MOVE_SPEED = 1.2; // px per frame

const cardData = Array.from({ length: CARD_COUNT }, (_, i) => ({
  id: i,
  title: `卡牌 ${i + 1}`,
  text: `這是卡牌 ${i + 1} 的詳細內容，展示點擊後可翻頁的文字。`.repeat(3)
}))

function App() {
  // 以卡牌中心點的 X 座標紀錄位置
  const [positions, setPositions] = useState(
    Array.from({ length: CARD_COUNT }, (_, i) =>
      i * (CARD_WIDTH + CARD_GAP) + CARD_WIDTH / 2,
    ),
  )
  const [isPaused, setIsPaused] = useState(false)
  const [selected, setSelected] = useState(null)
  const [page, setPage] = useState(0)
  const animationRef = useRef()
  const containerRef = useRef()

  const handleCardClick = idx => {
    setSelected(idx)
    setPage(0)
    setIsPaused(true)
  }

  const handleClose = () => {
    setSelected(null)
    setIsPaused(false)
  }

  const textChunks = useMemo(() => {
    if (selected == null) return []
    const txt = cardData[selected].text
    return txt.match(/.{1,30}/g) || []
  }, [selected])

  // 循環移動動畫
  useEffect(() => {
    if (isPaused) return
    const animate = () => {
      setPositions(prev => {
        const containerWidth = containerRef.current?.offsetWidth || 1200
        const totalWidth = CARD_COUNT * (CARD_WIDTH + CARD_GAP)
        return prev.map(x => {
          let nx = x + MOVE_SPEED
          if (nx > containerWidth + CARD_WIDTH / 2) {
            nx -= totalWidth
          }
          return nx
        })
      })
      animationRef.current = requestAnimationFrame(animate)
    }
    animationRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationRef.current)
  }, [isPaused])

  const containerHeight = containerRef.current?.offsetHeight || 800
  const centerY = containerHeight / 2
  const angleStep = (2 * Math.PI) / (CARD_COUNT - 1)
  const radius = 220

  return (
    <div className="card-container" ref={containerRef}>
      {cardData.map((card, i) => {
        const isSel = selected === i
        let left = positions[i]
        let top = centerY
        let transform = 'translate(-50%, -50%)'
        let zIndex = isSel ? 10 : 1

        if (selected != null) {
          if (isSel) {
            transform += ' scale(2)'
          } else {
            const idx = i > selected ? i - 1 : i
            const angle = idx * angleStep
            left = positions[selected] + Math.cos(angle) * radius
            top = centerY + Math.sin(angle) * radius
          }
        }

        return (
          <div
            key={card.id}
            className="card"
            onClick={() => handleCardClick(i)}
            style={{
              left,
              top,
              width: CARD_WIDTH,
              height: CARD_HEIGHT,
              position: 'absolute',
              transform,
              transition: 'left 0.3s, top 0.3s, transform 0.3s',
              zIndex,
            }}
          >
            <div className="card-title">{card.title}</div>
            {isSel && (
              <div className="detail-box">
                <div className="close-btn" onClick={handleClose}>
                  ✕
                </div>
                <div className="detail-text">{textChunks[page]}</div>
                <div className="detail-nav">
                  <button
                    onClick={() => setPage(p => Math.max(p - 1, 0))}
                    disabled={page === 0}
                  >
                    ‹
                  </button>
                  <button
                    onClick={() =>
                      setPage(p => Math.min(p + 1, textChunks.length - 1))
                    }
                    disabled={page === textChunks.length - 1}
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default App
