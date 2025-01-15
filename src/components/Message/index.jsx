/**
 * Message 组件
 *
 * 功能：提供统一风格的消息提示，支持成功、错误、警告和信息类型
 * 用途：用于向用户展示操作结果反馈、错误警告或系统通知
 * 使用位置：
 * - 操作成功/失败提示
 * - 表单验证错误提示
 * - 系统状态通知
 * - 其他需要临时消息提示的场景
 *
 * 通过 useMessageStore 中的 showMessage 方法调用
 * 使用示例：
 * import { useMessageStore } from "@/store";
 * const { showMessage } = useMessageStore();
 * showMessage("操作成功", "success");
 */
import { MESSAGE_TYPES, THEME_TYPES } from "@/constants";
import { useThemeStore, useMessageStore } from "@/store";
import styles from "./index.module.less";

/**
 * 全局消息提示组件
 */
const Message = () => {
  const { message, messageVisible } = useMessageStore();
  const { theme } = useThemeStore();
  const isDark = theme === THEME_TYPES.DARK;

  if (!message || !messageVisible) return null;

  const { text, type } = message;

  // 获取消息类型对应的样式
  const getTypeStyle = () => {
    switch (type) {
      case MESSAGE_TYPES.SUCCESS:
        return styles.messageSuccess;
      case MESSAGE_TYPES.ERROR:
        return styles.messageError;
      case MESSAGE_TYPES.WARNING:
        return styles.messageWarning;
      default:
        return styles.messageInfo;
    }
  };

  return (
    <div
      className={`${styles.messageContainer} ${
        styles.messageFloating
      } ${getTypeStyle()} ${styles[`message${isDark ? "Dark" : "Light"}`]}`}
    >
      {text}
    </div>
  );
};

/**
 * 应用根级消息提供器
 * 需要在应用根组件中引入此组件
 */
const MessageProvider = () => {
  return <Message />;
};

export default MessageProvider;
