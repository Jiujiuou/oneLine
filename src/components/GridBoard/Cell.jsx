import PropTypes from "prop-types";
import styles from "./index.module.less";

/**
 * 单个格子组件
 * @param {Object} props
 * @param {number} props.value - 显示的数字
 * @param {string} props.status - 状态: 'normal' | 'hint' | 'active' | 'error' | 'obstacle'
 * @param {Object} props.theme - 当前主题配置对象
 * @param {Object} props.style - 外部传入的样式 (用于动态尺寸)
 */
const Cell = ({
  value,
  status = "normal",
  theme,
  style = {},
  onMouseDown,
  onMouseEnter,
  onMouseUp,
  ...rest
}) => {
  // 根据状态获取对应的颜色样式
  const getThemeStyle = () => {
    const { colors } = theme;

    const baseStyle = {
      backgroundColor: colors.cellBg,
      borderColor: colors.cellBorder,
      color: colors.activeText,
      cursor: status === "obstacle" ? "not-allowed" : "pointer",
    };

    switch (status) {
      case "hint":
        return {
          ...baseStyle,
          backgroundColor: colors.hintBg,
          color: colors.hintText,
          borderColor: colors.hintBorder || colors.cellBorder,
          fontWeight: "bold",
        };
      case "active":
        return {
          ...baseStyle,
          backgroundColor: colors.activeBg,
          color: colors.activeText,
          borderColor: colors.activeBorder || colors.cellBorder,
          fontWeight: "bold",
        };
      case "success":
        return {
          ...baseStyle,
          backgroundColor: colors.successBg,
          color: colors.successText,
          borderColor: colors.successBorder || colors.cellBorder,
          fontWeight: "bold",
        };
      case "error":
        return {
          ...baseStyle,
          backgroundColor: colors.errorBg,
          color: colors.errorText,
          borderColor: colors.errorBorder || colors.cellBorder,
          fontWeight: "bold",
        };
      case "obstacle":
        return {
          ...baseStyle,
          backgroundColor: colors.obstacleBg,
          color: colors.obstacleText,
          borderColor: colors.obstacleBg,
        };
      default:
        return baseStyle;
    }
  };

  // 障碍物需要特殊样式类
  const cellClassName =
    status === "obstacle"
      ? `${styles.cell} ${styles.cellObstacle}`
      : styles.cell;

  return (
    <div
      className={cellClassName}
      style={{ ...style, ...getThemeStyle() }}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseUp={onMouseUp}
      {...rest}
    >
      {status !== "normal" && status !== "obstacle" && value}
      {/* 障碍物可以显示一个图标或符号 */}
      {status === "obstacle" && (
        <span style={{ fontSize: "1em", opacity: 0.7 }}></span>
      )}
    </div>
  );
};

Cell.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  status: PropTypes.oneOf([
    "normal",
    "hint",
    "active",
    "success",
    "error",
    "obstacle",
  ]),
  theme: PropTypes.object.isRequired,
  style: PropTypes.object,
  onMouseDown: PropTypes.func,
  onMouseEnter: PropTypes.func,
  onMouseUp: PropTypes.func,
};

export default Cell;
