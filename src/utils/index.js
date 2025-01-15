// 导入XLSX库
import { useEffect } from "react";

// 处理外部点击的通用hook
export const useOutsideClick = (ref, callback) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, callback]);
};

// 复制到剪贴板
export const copyToClipboard = async (text, type = "内容") => {
  try {
    await navigator.clipboard.writeText(text);
    return { success: true, message: `${type}已复制到剪贴板` };
  } catch {
    // 降级处理
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      return { success: true, message: `${type}已复制到剪贴板` };
    } catch {
      return { success: false, message: "复制失败，请手动复制" };
    }
  }
};

// 简单高效的防抖函数 - 专注于防抖逻辑
export const createDebounce = (callback, delay = 500) => {
  let timeoutId = null;
  let lastArgs = null;
  let callCount = 0;
  let executionCount = 0;

  const executeCallback = () => {
    executionCount++;

    if (lastArgs !== null) {
      callback(...lastArgs);
      lastArgs = null;
    }
    timeoutId = null;
  };

  const debouncedFunction = (...args) => {
    callCount++;
    lastArgs = args;

    // 清除之前的定时器
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // 设置新的定时器
    timeoutId = setTimeout(executeCallback, delay);
  };

  // 立即执行函数
  debouncedFunction.flush = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    executeCallback();
  };

  // 取消执行函数
  debouncedFunction.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    lastArgs = null;
  };

  // 获取统计信息
  debouncedFunction.getStats = () => {
    return {
      callCount,
      executionCount,
      efficiency: callCount > 0 ? 1 - executionCount / callCount : 0,
    };
  };

  return debouncedFunction;
};
