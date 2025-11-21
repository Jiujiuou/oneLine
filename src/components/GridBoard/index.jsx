import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useGameStore } from "@/store";
import Cell from "./Cell";
import styles from "./index.module.less";

/**
 * 游戏棋盘组件
 * @param {Object} props
 * @param {Object} props.theme - 当前主题配置
 */
const GridBoard = ({ theme }) => {
  const { rows, cols, hints, userPath, obstacles, setUserPath, gameState } = useGameStore();
  const [gridData, setGridData] = useState([]);
  const containerRef = useRef(null);
  const [cellSize, setCellSize] = useState(50);
  const [isDrawing, setIsDrawing] = useState(false);

  // 计算合适的格子大小
  useEffect(() => {
    const calculateSize = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth - 40;
      const containerHeight = containerRef.current.clientHeight - 40;
      const gap = 8;
      const padding = 24;
      
      const widthBasedSize = (containerWidth - padding - (cols - 1) * gap) / cols;
      const heightBasedSize = (containerHeight - padding - (rows - 1) * gap) / rows;
      
      const size = Math.min(Math.min(widthBasedSize, heightBasedSize), 50);
      setCellSize(Math.max(size, 30));
    };

    calculateSize();
    window.addEventListener('resize', calculateSize);
    return () => window.removeEventListener('resize', calculateSize);
  }, [rows, cols]);

  // --- 交互逻辑 ---

  const getCellKey = (r, c) => `${r},${c}`;

  // 检查盘面上是否有提示数字 1
  const hasStartHint = () => {
      return Object.values(hints).includes(1);
  };

  const handleMouseDown = (r, c) => {
    if (gameState === 'WON') return; // 赢了就不能再画了

    const isObstacle = obstacles.some(obs => obs.r === r && obs.c === c);
    if (isObstacle) return;

    // 起点校验规则：
    // 1. 如果盘面上有提示数字 1，必须从那个位置开始
    // 2. 如果没有提示数字 1，可以从任意位置开始
    if (hasStartHint()) {
        const startHintKey = Object.keys(hints).find(key => hints[key] === 1);
        const [startR, startC] = startHintKey.split(',').map(Number);
        
        if (r !== startR || c !== startC) {
            // 不是正确的起点，不能开始
            return;
        }
    }

    setIsDrawing(true);
    setUserPath([{ r, c }]);
  };

  const handleMouseEnter = (r, c) => {
    if (!isDrawing || gameState === 'WON') return;

    const currentPath = [...userPath];
    const lastPos = currentPath[currentPath.length - 1];
    
    if (lastPos.r === r && lastPos.c === c) return;

    // 回撤逻辑
    if (currentPath.length >= 2) {
        const prevPos = currentPath[currentPath.length - 2];
        if (prevPos.r === r && prevPos.c === c) {
            currentPath.pop();
            setUserPath(currentPath);
            return;
        }
    }

    const dr = Math.abs(r - lastPos.r);
    const dc = Math.abs(c - lastPos.c);
    const isNeighbor = (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
    if (!isNeighbor) return; 

    const isObstacle = obstacles.some(obs => obs.r === r && obs.c === c);
    if (isObstacle) return;

    const isVisited = currentPath.some(pos => pos.r === r && pos.c === c);
    if (isVisited) return; 

    currentPath.push({ r, c });
    setUserPath(currentPath);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  useEffect(() => {
      const handleGlobalMouseUp = () => {
          if (isDrawing) setIsDrawing(false);
      };
      window.addEventListener('mouseup', handleGlobalMouseUp);
      return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isDrawing]);


  // --- 渲染逻辑 ---
  
  useEffect(() => {
    const hintMap = hints || {};
    const pathMap = {};
    userPath.forEach((pos, i) => {
        pathMap[getCellKey(pos.r, pos.c)] = i + 1;
    });
    const obstacleMap = {};
    obstacles.forEach(obs => {
        obstacleMap[getCellKey(obs.r, obs.c)] = true;
    });

    const data = [];
    const isWon = gameState === 'WON';
    // 查找数字 1 的位置，用于特殊样式（可选）
    const startHintKey = Object.keys(hintMap).find(key => hintMap[key] === 1);

    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        const key = getCellKey(r, c);
        let status = 'normal';
        let value = '';

        if (obstacleMap[key]) {
            status = 'obstacle';
        } else {
            const hintVal = hintMap[key];
            const userVal = pathMap[key];
            
            if (isWon) {
                // 胜利状态
                if (hintVal !== undefined) {
                    status = 'hint';
                    value = hintVal;
                } else {
                    status = 'success';
                    value = userVal;
                }
            } else {
                // 游戏进行中
                if (userVal) {
                    status = 'active';
                    value = userVal;
                    // 检查是否与提示冲突
                    if (hintVal !== undefined) {
                        if (hintVal !== userVal) {
                            status = 'error';
                            value = hintVal; 
                        }
                    }
                } else {
                    // 未连接的格子
                    if (hintVal !== undefined) {
                        status = 'hint';
                        value = hintVal;
                    }
                }
            }
        }
        row.push({ r, c, status, value });
      }
      data.push(row);
    }
    setGridData(data);
  }, [rows, cols, hints, userPath, obstacles, gameState]); 

  const getSvgPath = () => {
      if (userPath.length < 2) return "";
      const padding = 12; 
      const gap = 8;
      const halfCell = cellSize / 2;

      const getCenter = (r, c) => {
          const x = padding + c * (cellSize + gap) + halfCell;
          const y = padding + r * (cellSize + gap) + halfCell;
          return `${x},${y}`;
      };

      const d = userPath.map((pos, i) => {
          const point = getCenter(pos.r, pos.c);
          return i === 0 ? `M ${point}` : `L ${point}`;
      }).join(" ");

      return d;
  };

  return (
    <div 
      ref={containerRef}
      className={styles.boardWrapper}
    >
      <div
        className={styles.gridContainer}
        style={{
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
          position: 'relative'
        }}
      >
        {/* SVG 连线层 */}
        <svg 
            className={styles.svgLayer}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 0
            }}
        >
            <path 
                d={getSvgPath()} 
                stroke={theme.colors.line} 
                strokeWidth="6" 
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
        </svg>

        {gridData.map((row, rIndex) =>
          row.map((cell, cIndex) => (
            <Cell
              key={`${rIndex}-${cIndex}`}
              value={cell.value}
              status={cell.status}
              theme={theme}
              style={{ 
                  width: cellSize, 
                  height: cellSize, 
                  fontSize: cellSize * 0.4,
                  zIndex: 1 
              }}
              onMouseDown={() => handleMouseDown(cell.r, cell.c)}
              onMouseEnter={() => handleMouseEnter(cell.r, cell.c)}
              onMouseUp={handleMouseUp}
            />
          ))
        )}
      </div>
    </div>
  );
};

GridBoard.propTypes = {
  theme: PropTypes.object.isRequired,
};

export default GridBoard;
