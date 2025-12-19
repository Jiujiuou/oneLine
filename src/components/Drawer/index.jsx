import { useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./index.module.less";

function Drawer({ open, onClose, children }) {
  // 防止背景滚动
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // ESC 键关闭
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* 遮罩层 */}
      <div className={styles.overlay} onClick={onClose} />

      {/* 抽屉容器 */}
      <div className={styles.drawer}>
        {/* 顶部拖拽条 */}
        <div className={styles.handle} />

        {/* 关闭按钮 */}
        <button className={styles.closeButton} onClick={onClose}>
          ✕
        </button>

        {/* 内容区域 */}
        <div className={styles.content}>{children}</div>
      </div>
    </>
  );
}

Drawer.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node,
};

export default Drawer;
