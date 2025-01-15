/**
 * InputDialog 组件
 *
 * 功能：模态对话框，用于获取用户输入
 * 用途：需要用户输入简短文本的交互场景
 * 使用位置：
 * - 添加自定义选项时（如新的App Key、命名空间等）
 * - 需要用户确认输入的各种场景
 * - 作为轻量级的用户输入收集界面
 */
import { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { useMessageStore } from "@/store";
import { useKeyboardEvents, useAutoFocus } from "@/hooks";
import { Button } from "@/components";
import styles from "./index.module.less";

const InputDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "输入内容",
  placeholder = "请输入...",
  defaultValue = "",
  confirmText = "确认",
  cancelText = "取消",
}) => {
  const [inputValue, setInputValue] = useState(defaultValue);
  const inputRef = useRef(null);
  const dialogRef = useRef(null);
  const { showMessage } = useMessageStore();

  // 重置输入值
  useEffect(() => {
    if (isOpen) {
      setInputValue(defaultValue);
    }
  }, [isOpen, defaultValue]);

  // 使用自定义Hook自动聚焦
  useAutoFocus(isOpen, inputRef);

  // 使用自定义Hook处理键盘事件
  useKeyboardEvents(
    isOpen,
    onClose,
    () => inputValue.trim() && handleConfirm()
  );

  // 点击背景关闭对话框
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (inputValue.trim()) {
      onConfirm(inputValue.trim());
      onClose();
    } else {
      showMessage("请输入内容", "warning");
    }
  };

  const handleCancel = () => {
    setInputValue(defaultValue);
    onClose();
  };

  if (!isOpen) return null;

  // 使用 Portal 渲染到 body，确保全局显示
  return ReactDOM.createPortal(
    <div className={styles.dialogOverlay} onClick={handleBackdropClick}>
      <div className={styles.dialogContainer} ref={dialogRef}>
        <div className={styles.dialogHeader}>
          <h3 className={styles.dialogTitle}>{title}</h3>
        </div>

        <div className={styles.dialogInputContainer}>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            className={styles.dialogInput}
          />
        </div>

        <div className={styles.dialogFooter}>
          <Button
            text={cancelText}
            type="secondary"
            size="medium"
            onClick={handleCancel}
            className={styles.dialogButtonCancel}
          />
          <Button
            text={confirmText}
            type="primary"
            size="medium"
            onClick={handleConfirm}
            className={styles.dialogButtonConfirm}
          />
        </div>
      </div>
    </div>,
    document.body
  );
};

InputDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string,
  placeholder: PropTypes.string,
  defaultValue: PropTypes.string,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
};

export default InputDialog;
