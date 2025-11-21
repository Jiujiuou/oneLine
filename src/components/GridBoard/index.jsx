import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useGameStore, useSoundStore, useThemeStore } from "@/store";
import {
  playClickSound,
  playCompleteSound,
  playErrorSound,
} from "@/utils/sound";
import { LINE_COLOR_PRESETS } from "@/constants/lineColors";
import Cell from "./Cell";
import styles from "./index.module.less";

/**
 * 游戏棋盘组件
 * @param {Object} props
 * @param {Object} props.theme - 当前主题配置
 */
const GridBoard = ({ theme }) => {
  const {
    rows,
    cols,
    hints,
    userPath,
    obstacles,
    setUserPath,
    gameState,
    fullPath,
    hintPathLength,
    moveMode,
  } = useGameStore();
  const { currentPreset } = useSoundStore();
  const { lineColorPresetId } = useThemeStore();

  // 获取当前选择的路径颜色
  const getLineColor = () => {
    const preset = LINE_COLOR_PRESETS.find((p) => p.id === lineColorPresetId);
    return preset ? preset.color : theme.colors.line;
  };
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

  // 判断两个格子是否相邻（根据移动模式）
  const isNeighbor = (r1, c1, r2, c2) => {
    const dr = Math.abs(r2 - r1);
    const dc = Math.abs(c2 - c1);

    if (moveMode === "diagonal") {
      // 地狱模式：允许8方向移动（包括斜向）
      // 相邻条件：dr <= 1 && dc <= 1 && (dr + dc) > 0
      return dr <= 1 && dc <= 1 && dr + dc > 0;
    } else {
      // 标准模式：只允许4方向移动（正交）
      return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
    }
  };

  // 检测两条线段是否相交（用于防止路径交叉）
  // 使用向量叉积方法检测线段相交
  const doSegmentsIntersect = (p1, p2, p3, p4) => {
    // 将格子坐标转换为数值坐标（用于计算）
    const toPoint = (r, c) => ({ x: c, y: r });
    const a = toPoint(p1.r, p1.c);
    const b = toPoint(p2.r, p2.c);
    const c = toPoint(p3.r, p3.c);
    const d = toPoint(p4.r, p4.c);

    // 计算方向向量
    const ccw = (A, B, C) => {
      return (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
    };

    // 两条线段相交当且仅当：
    // (点C和D在AB两侧) 且 (点A和B在CD两侧)
    return ccw(a, c, d) !== ccw(b, c, d) && ccw(a, b, c) !== ccw(a, b, d);
  };

  // 检查新添加的线段是否会与现有路径交叉
  const wouldPathCross = (path, newPoint) => {
    if (path.length < 2) return false;

    // 新线段是从路径最后一个点到新点
    const lastPoint = path[path.length - 1];

    // 检查新线段是否与路径中已有的线段相交
    // 注意：相邻的线段共享端点，不算交叉
    for (let i = 0; i < path.length - 1; i++) {
      const segStart = path[i];
      const segEnd = path[i + 1];

      // 跳过共享端点的相邻线段（包括紧邻的线段）
      // 如果新线段的起点是现有线段的端点，或者新线段的终点是现有线段的端点，跳过
      const sharesStartPoint =
        (segStart.r === lastPoint.r && segStart.c === lastPoint.c) ||
        (segEnd.r === lastPoint.r && segEnd.c === lastPoint.c);
      const sharesEndPoint =
        (segStart.r === newPoint.r && segStart.c === newPoint.c) ||
        (segEnd.r === newPoint.r && segEnd.c === newPoint.c);

      // 如果共享端点，跳过（相邻线段不算交叉）
      if (sharesStartPoint || sharesEndPoint) {
        continue;
      }

      // 检查两条线段是否相交（不包括端点）
      if (doSegmentsIntersect(segStart, segEnd, lastPoint, newPoint)) {
        return true;
      }
    }

    return false;
  };

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
        if (isNeighbor(lastPos.r, lastPos.c, r, c)) {
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

    if (!isNeighbor(lastPos.r, lastPos.c, r, c)) return;

    const isObstacle = obstacles.some((obs) => obs.r === r && obs.c === c);
    if (isObstacle) return;

    const isVisited = currentPath.some((pos) => pos.r === r && pos.c === c);
    if (isVisited) return;

    // 地狱模式下，检查路径是否会交叉（斜向移动时）
    if (moveMode === "diagonal") {
      if (wouldPathCross(currentPath, { r, c })) {
        // 路径会交叉，不允许移动
        return;
      }
    }

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
    moveMode,
  ]);

  const getSvgPath = () => {
    if (userPath.length < 2) return "";
    const padding = 12;
    const gap = 8;
    const halfCell = cellSize / 2;
    const curveRadius = 10; // 弧线半径，控制转角的平滑程度

    const getCenter = (r, c) => {
      const x = padding + c * (cellSize + gap) + halfCell;
      const y = padding + r * (cellSize + gap) + halfCell;
      return { x, y };
    };

    if (userPath.length === 2) {
      // 只有两个点时，直接连线
      const start = getCenter(userPath[0].r, userPath[0].c);
      const end = getCenter(userPath[1].r, userPath[1].c);
      return `M ${start.x},${start.y} L ${end.x},${end.y}`;
    }

    // 使用直线段 + 转角弧线的方式绘制路径
    const pathCommands = [];
    const start = getCenter(userPath[0].r, userPath[0].c);
    pathCommands.push(`M ${start.x},${start.y}`);

    for (let i = 0; i < userPath.length - 1; i++) {
      const current = getCenter(userPath[i].r, userPath[i].c);
      const next = getCenter(userPath[i + 1].r, userPath[i + 1].c);

      if (i === userPath.length - 2) {
        // 最后一个点，检查是否是转角
        if (userPath.length > 2) {
          const prev = getCenter(userPath[i - 1].r, userPath[i - 1].c);
          const dx1 = current.x - prev.x;
          const dy1 = current.y - prev.y;
          const dx2 = next.x - current.x;
          const dy2 = next.y - current.y;
          const isCorner = (dx1 !== 0 && dy2 !== 0) || (dy1 !== 0 && dx2 !== 0);

          if (isCorner) {
            // 最后一个转角，先画直线到转角前
            const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
            const radius = Math.min(curveRadius, dist2 * 0.4);
            const ratio = radius / dist2;
            const beforeCornerX = next.x - dx2 * ratio;
            const beforeCornerY = next.y - dy2 * ratio;
            pathCommands.push(`L ${beforeCornerX},${beforeCornerY}`);

            // 用三次贝塞尔曲线连接到终点，确保路径经过转角点
            const control1X = next.x - dx2 * ratio * 0.3;
            const control1Y = next.y - dy2 * ratio * 0.3;
            const control2X = next.x;
            const control2Y = next.y;
            pathCommands.push(
              `C ${control1X},${control1Y} ${control2X},${control2Y} ${next.x},${next.y}`
            );
          } else {
            pathCommands.push(`L ${next.x},${next.y}`);
          }
        } else {
          pathCommands.push(`L ${next.x},${next.y}`);
        }
      } else {
        // 检查下一个点是否是转角
        const afterNext = getCenter(userPath[i + 2].r, userPath[i + 2].c);
        const dx1 = next.x - current.x;
        const dy1 = next.y - current.y;
        const dx2 = afterNext.x - next.x;
        const dy2 = afterNext.y - next.y;
        const isCorner = (dx1 !== 0 && dy2 !== 0) || (dy1 !== 0 && dx2 !== 0);

        if (isCorner) {
          // 有转角，先画直线到转角前
          const dist1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
          const radius = Math.min(curveRadius, dist1 * 0.4);
          const ratio = radius / dist1;
          const beforeCornerX = next.x - dx1 * ratio;
          const beforeCornerY = next.y - dy1 * ratio;
          pathCommands.push(`L ${beforeCornerX},${beforeCornerY}`);

          // 用三次贝塞尔曲线连接转角，确保路径经过转角点
          const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
          const ratio2 = Math.min(radius, dist2 * 0.4) / dist2;
          const afterCornerX = next.x + dx2 * ratio2;
          const afterCornerY = next.y + dy2 * ratio2;

          // 计算控制点，使路径平滑地经过转角点
          // 第一个控制点：在转角点前，稍微向转角点偏移
          const control1X = next.x - dx1 * ratio * 0.3;
          const control1Y = next.y - dy1 * ratio * 0.3;
          // 第二个控制点：在转角点后，稍微向转角点偏移
          const control2X = next.x + dx2 * ratio2 * 0.3;
          const control2Y = next.y + dy2 * ratio2 * 0.3;

          // 使用三次贝塞尔曲线，路径会平滑地经过转角点
          pathCommands.push(
            `C ${control1X},${control1Y} ${control2X},${control2Y} ${afterCornerX},${afterCornerY}`
          );
        } else {
          // 没有转角，直接画直线
          pathCommands.push(`L ${next.x},${next.y}`);
        }
      }
    }

    return pathCommands.join(" ");
  };

  // 获取提示路径的 SVG 路径
  const getHintSvgPath = () => {
    if (!fullPath || fullPath.length === 0 || hintPathLength === 0) return "";

    const hintPath = fullPath.slice(0, hintPathLength);
    if (hintPath.length < 2) return "";

    const padding = 12;
    const gap = 8;
    const halfCell = cellSize / 2;
    const curveRadius = 10;

    const getCenter = (r, c) => {
      const x = padding + c * (cellSize + gap) + halfCell;
      const y = padding + r * (cellSize + gap) + halfCell;
      return { x, y };
    };

    if (hintPath.length === 2) {
      const start = getCenter(hintPath[0].r, hintPath[0].c);
      const end = getCenter(hintPath[1].r, hintPath[1].c);
      return `M ${start.x},${start.y} L ${end.x},${end.y}`;
    }

    const pathCommands = [];
    const start = getCenter(hintPath[0].r, hintPath[0].c);
    pathCommands.push(`M ${start.x},${start.y}`);

    for (let i = 0; i < hintPath.length - 1; i++) {
      const current = getCenter(hintPath[i].r, hintPath[i].c);
      const next = getCenter(hintPath[i + 1].r, hintPath[i + 1].c);

      if (i === hintPath.length - 2) {
        if (hintPath.length > 2) {
          const prev = getCenter(hintPath[i - 1].r, hintPath[i - 1].c);
          const dx1 = current.x - prev.x;
          const dy1 = current.y - prev.y;
          const dx2 = next.x - current.x;
          const dy2 = next.y - current.y;
          const isCorner = (dx1 !== 0 && dy2 !== 0) || (dy1 !== 0 && dx2 !== 0);

          if (isCorner) {
            const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
            const radius = Math.min(curveRadius, dist2 * 0.4);
            const ratio = radius / dist2;
            const beforeCornerX = next.x - dx2 * ratio;
            const beforeCornerY = next.y - dy2 * ratio;
            pathCommands.push(`L ${beforeCornerX},${beforeCornerY}`);

            const control1X = next.x - dx2 * ratio * 0.3;
            const control1Y = next.y - dy2 * ratio * 0.3;
            const control2X = next.x;
            const control2Y = next.y;
            pathCommands.push(
              `C ${control1X},${control1Y} ${control2X},${control2Y} ${next.x},${next.y}`
            );
          } else {
            pathCommands.push(`L ${next.x},${next.y}`);
          }
        } else {
          pathCommands.push(`L ${next.x},${next.y}`);
        }
      } else {
        const afterNext = getCenter(hintPath[i + 2].r, hintPath[i + 2].c);
        const dx1 = next.x - current.x;
        const dy1 = next.y - current.y;
        const dx2 = afterNext.x - next.x;
        const dy2 = afterNext.y - next.y;
        const isCorner = (dx1 !== 0 && dy2 !== 0) || (dy1 !== 0 && dx2 !== 0);

        if (isCorner) {
          const dist1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
          const radius = Math.min(curveRadius, dist1 * 0.4);
          const ratio = radius / dist1;
          const beforeCornerX = next.x - dx1 * ratio;
          const beforeCornerY = next.y - dy1 * ratio;
          pathCommands.push(`L ${beforeCornerX},${beforeCornerY}`);

          const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
          const ratio2 = Math.min(radius, dist2 * 0.4) / dist2;
          const afterCornerX = next.x + dx2 * ratio2;
          const afterCornerY = next.y + dy2 * ratio2;

          const control1X = next.x - dx1 * ratio * 0.3;
          const control1Y = next.y - dy1 * ratio * 0.3;
          const control2X = next.x + dx2 * ratio2 * 0.3;
          const control2Y = next.y + dy2 * ratio2 * 0.3;

          pathCommands.push(
            `C ${control1X},${control1Y} ${control2X},${control2Y} ${afterCornerX},${afterCornerY}`
          );
        } else {
          pathCommands.push(`L ${next.x},${next.y}`);
        }
      }
    }

    return pathCommands.join(" ");
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
        className={`${styles.gridContainer} ${
          gameState === "WON" ? styles.breathing : ""
        }`}
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
            zIndex: 2,
          }}
        >
          {/* 提示路径（虚线，显示在用户路径下方，仅在游戏进行中显示） */}
          {hintPathLength > 0 && gameState === "PLAYING" && (
            <path
              d={getHintSvgPath()}
              stroke={getLineColor()}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="8 4"
              fill="none"
              opacity="0.5"
            />
          )}
          {/* 用户路径（实线，显示在提示路径上方） */}
          <path
            d={getSvgPath()}
            stroke={getLineColor()}
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
