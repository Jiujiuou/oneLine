import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useGameStore, useSoundStore } from "@/store";
import {
  playClickSound,
  playCompleteSound,
  playErrorSound,
} from "@/utils/sound";
import Cell from "./Cell";
import styles from "./index.module.less";

/**
 * 游戏棋盘组件
 * @param {Object} props
 * @param {Object} props.theme - 当前主题配置
 */
const GridBoard = ({ theme }) => {
  const { rows, cols, hints, userPath, obstacles, setUserPath, gameState } =
    useGameStore();
  const { currentPreset } = useSoundStore();
  const [gridData, setGridData] = useState([]);
  const containerRef = useRef(null);
  const [cellSize, setCellSize] = useState(50);
  const [isDrawing, setIsDrawing] = useState(false);
  const errorCellsRef = useRef(new Set()); // 追踪错误格子的键集合
  const [errorClickCell, setErrorClickCell] = useState(null); // 追踪错误点击的格子键
  const startPosRef = useRef(null); // 保存当前绘制的起始位置，用于处理异步状态更新问题

  // 计算合适的格子大小
  useEffect(() => {
    const calculateSize = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth - 40;
      const containerHeight = containerRef.current.clientHeight - 40;
      const gap = 8;
      const padding = 24;

      const widthBasedSize =
        (containerWidth - padding - (cols - 1) * gap) / cols;
      const heightBasedSize =
        (containerHeight - padding - (rows - 1) * gap) / rows;

      const size = Math.min(Math.min(widthBasedSize, heightBasedSize), 50);
      setCellSize(Math.max(size, 30));
    };

    calculateSize();
    window.addEventListener("resize", calculateSize);
    return () => window.removeEventListener("resize", calculateSize);
  }, [rows, cols]);

  // --- 交互逻辑 ---

  const getCellKey = (r, c) => `${r},${c}`;

  const handleMouseDown = (r, c) => {
    if (gameState === "WON") return; // 赢了就不能再画了

    const isObstacle = obstacles.some((obs) => obs.r === r && obs.c === c);
    if (isObstacle) return;

    // 清除之前的错误点击状态（如果存在）
    if (errorClickCell) {
      setErrorClickCell(null);
    }

    // 允许从任意位置开始连线，错误提示由渲染逻辑处理
    // 保存起始位置到 ref，确保 handleMouseEnter 能立即使用
    startPosRef.current = { r, c };
    setIsDrawing(true);
    setUserPath([{ r, c }]);
  };

  const handleMouseEnter = (r, c) => {
    if (!isDrawing || gameState === "WON") return;

    const currentPath = [...userPath];

    // 如果路径为空，但正在绘制（可能是异步状态更新问题），使用 ref 中的起始位置
    let lastPos;
    if (currentPath.length === 0) {
      if (startPosRef.current) {
        lastPos = startPosRef.current;
        // 如果路径为空但 ref 有值，说明状态更新延迟，使用 ref 的值
        // 但这里我们不直接修改路径，而是等待状态更新
        // 实际上，我们应该使用 ref 的值来继续连线
        if (lastPos.r === r && lastPos.c === c) return;
        // 如果是从起始位置移动到相邻格子，应该允许连线
        const dr = Math.abs(r - lastPos.r);
        const dc = Math.abs(c - lastPos.c);
        const isNeighbor = (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
        if (isNeighbor) {
          // 直接设置路径，包含起始位置和目标位置
          setUserPath([lastPos, { r, c }]);
          return;
        }
      }
      return;
    }

    lastPos = currentPath[currentPath.length - 1];

    if (!lastPos || (lastPos.r === r && lastPos.c === c)) return;

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

    const isObstacle = obstacles.some((obs) => obs.r === r && obs.c === c);
    if (isObstacle) return;

    const isVisited = currentPath.some((pos) => pos.r === r && pos.c === c);
    if (isVisited) return;

    // 检查即将连接的格子是否会导致错误状态
    const cellKey = getCellKey(r, c);
    const hintVal = hints[cellKey];
    const willBeError =
      hintVal !== undefined && currentPath.length + 1 !== hintVal;

    currentPath.push({ r, c });
    setUserPath(currentPath);

    // 如果会导致错误状态，不播放连接音效（错误音效会在渲染逻辑中播放）
    if (!willBeError) {
      playClickSound(currentPreset); // 连线移动时播放音效
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    startPosRef.current = null; // 清除起始位置
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDrawing) {
        setIsDrawing(false);
        startPosRef.current = null; // 清除起始位置
      }
    };
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, [isDrawing]);

  // 监听游戏胜利状态，播放完成音效
  useEffect(() => {
    if (gameState === "WON") {
      playCompleteSound(currentPreset);
    }
  }, [gameState, currentPreset]);

  // --- 渲染逻辑 ---

  useEffect(() => {
    const hintMap = hints || {};
    const pathMap = {};
    userPath.forEach((pos, i) => {
      pathMap[getCellKey(pos.r, pos.c)] = i + 1;
    });
    const obstacleMap = {};
    obstacles.forEach((obs) => {
      obstacleMap[getCellKey(obs.r, obs.c)] = true;
    });

    const data = [];
    const isWon = gameState === "WON";
    const currentErrorCells = new Set(); // 当前帧的错误格子集合

    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        const key = getCellKey(r, c);
        let status = "normal";
        let value = "";

        if (obstacleMap[key]) {
          status = "obstacle";
        } else {
          const hintVal = hintMap[key];
          const userVal = pathMap[key];

          if (isWon) {
            // 胜利状态
            if (hintVal !== undefined) {
              status = "hint";
              value = hintVal;
            } else {
              status = "success";
              value = userVal;
            }
          } else {
            // 游戏进行中
            if (userVal) {
              status = "active";
              value = userVal;

              // 检查起点错误：如果有提示数字1，但路径不是从提示数字1的位置开始
              const hasStartHintValue = Object.values(hintMap).includes(1);
              if (userVal === 1 && hasStartHintValue) {
                const startHintKey = Object.keys(hintMap).find(
                  (hintKey) => hintMap[hintKey] === 1
                );
                if (startHintKey && key !== startHintKey) {
                  status = "error";
                  value = hintVal !== undefined ? hintVal : 1;
                  currentErrorCells.add(key); // 添加到当前错误集合
                } else if (hintVal !== undefined) {
                  // 检查是否与提示冲突
                  if (hintVal !== userVal) {
                    status = "error";
                    value = hintVal;
                    currentErrorCells.add(key); // 添加到当前错误集合
                  }
                }
              } else {
                // 检查是否与提示冲突
                if (hintVal !== undefined) {
                  if (hintVal !== userVal) {
                    status = "error";
                    value = hintVal;
                    currentErrorCells.add(key); // 添加到当前错误集合
                  }
                }
              }
            } else {
              // 未连接的格子
              // 检查是否是错误点击的格子
              if (errorClickCell === key) {
                status = "error";
                value = 1; // 显示应该从数字1开始
                currentErrorCells.add(key); // 添加到当前错误集合
              } else if (hintVal !== undefined) {
                status = "hint";
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

    // 检测新的错误格子（出现在当前帧但不在之前的错误集合中）
    const newErrorCells = [...currentErrorCells].filter(
      (key) => !errorCellsRef.current.has(key)
    );

    // 如果有新的错误格子，播放错误音效
    // 但是，如果错误是由点击空白格触发的（errorClickCell），
    // 则不在渲染逻辑中播放错误音效（因为已经在 handleMouseDown 中播放了）
    if (newErrorCells.length > 0) {
      const isClickBlankCellError =
        errorClickCell && newErrorCells.includes(errorClickCell);

      if (!isClickBlankCellError) {
        playErrorSound(currentPreset);
      }
    }

    // 更新错误格子集合
    errorCellsRef.current = currentErrorCells;
  }, [
    rows,
    cols,
    hints,
    userPath,
    obstacles,
    gameState,
    currentPreset,
    errorClickCell,
  ]);

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

    const d = userPath
      .map((pos, i) => {
        const point = getCenter(pos.r, pos.c);
        return i === 0 ? `M ${point}` : `L ${point}`;
      })
      .join(" ");

    return d;
  };

  return (
    <div
      ref={containerRef}
      className={styles.boardWrapper}
      onMouseDown={(e) => {
        // 只有当点击空白区域时才处理
        const clickedElement = e.target;
        const isClickOnCell =
          clickedElement.hasAttribute("data-cell") ||
          clickedElement.closest("[data-cell]");

        if (!isClickOnCell && userPath.length > 0 && gameState !== "WON") {
          setUserPath([]);
        }
      }}
    >
      <div
        className={`${styles.gridContainer} ${gameState === "WON" ? styles.breathing : ""}`}
        style={{
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
          position: "relative",
        }}
      >
        {/* SVG 连线层 */}
        <svg
          className={styles.svgLayer}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 0,
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
                zIndex: 1,
              }}
              data-cell="true"
              onMouseDown={() => {
                handleMouseDown(cell.r, cell.c);
                playClickSound(currentPreset);
              }}
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
