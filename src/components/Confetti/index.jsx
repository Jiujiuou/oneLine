import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import styles from "./index.module.less";

// 彩带颜色常量
const COLORS = [
  "#f94144", // 红色
  "#f3722c", // 橙色
  "#f8961e", // 深橙色
  "#f9c74f", // 黄色
  "#90be6d", // 绿色
  "#43aa8b", // 青色
  "#577590", // 蓝色
];

/**
 * 彩带飘落组件（Canvas实现）
 * 仅在指定容器区域内显示彩带飘落效果
 * @param {boolean} active - 是否激活彩带效果
 * @param {number} count - 彩带数量
 */
const Confetti = ({ active, count = 100 }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const confettiRef = useRef([]);
  const animationFrameRef = useRef();

  useEffect(() => {
    const createParticle = (containerWidth, containerHeight) => ({
      x: Math.random() * containerWidth,
      y: Math.random() * -containerHeight, // 从容器顶部外开始
      rotation: Math.random() * 360,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: Math.random() * 10 + 5,
      speedY: Math.random() * 3 + 2,
      speedX: Math.random() * 2 - 1, // 横向飘动
      speedRotation: (Math.random() - 0.5) * 2,
    });
    if (!active) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    const container = containerRef.current?.parentElement;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");

    // 获取容器尺寸
    const updateCanvasSize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    updateCanvasSize();

    // 初始化彩带
    const containerWidth = canvas.width;
    const containerHeight = canvas.height;
    confettiRef.current = Array(count)
      .fill()
      .map(() => createParticle(containerWidth, containerHeight));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      confettiRef.current.forEach((particle, i) => {
        particle.y += particle.speedY;
        particle.x += particle.speedX;
        particle.rotation += particle.speedRotation;

        // 重置超出容器底部的彩带，从顶部重新开始
        if (particle.y > canvas.height) {
          const newParticle = createParticle(canvas.width, canvas.height);
          confettiRef.current[i] = newParticle;
          return;
        }

        // 横向边界处理：从一边出去，从另一边进来
        if (particle.x < 0) {
          particle.x = canvas.width;
        } else if (particle.x > canvas.width) {
          particle.x = 0;
        }

        // 绘制彩带（矩形，长宽比约3:1）
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate((particle.rotation * Math.PI) / 180);
        ctx.fillStyle = particle.color;
        ctx.fillRect(
          -particle.size / 2,
          -particle.size / 6,
          particle.size,
          particle.size / 3
        );
        ctx.restore();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // 监听窗口大小变化，更新Canvas尺寸
    const handleResize = () => {
      updateCanvasSize();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [active, count]);

  if (!active) {
    return null;
  }

  return (
    <div ref={containerRef} className={styles.confettiContainer}>
      <canvas ref={canvasRef} className={styles.confettiCanvas} />
    </div>
  );
};

Confetti.propTypes = {
  active: PropTypes.bool.isRequired,
  count: PropTypes.number,
};

export default Confetti;
