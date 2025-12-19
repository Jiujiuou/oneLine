import { useState } from "react";
import styles from "./index.module.less";
import Header from "@/components/Header";
import Preview from "@/components/Preview";
import Control from "@/components/Control";
import Drawer from "@/components/Drawer";

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className={styles.wrapper}>
      <Header />
      <div className={styles.content}>
        <Preview />
        
        {/* 桌面端: 直接显示 Control */}
        <Control className={styles.desktopControl} />
        
        {/* 移动端: FAB 按钮 */}
        <button 
          className={styles.fabButton}
          onClick={() => setDrawerOpen(true)}
          aria-label="打开设置"
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v6m0 6v6m-9-9h6m6 0h6" />
          </svg>
        </button>
        
        {/* 移动端: 抽屉 */}
        <Drawer 
          open={drawerOpen} 
          onClose={() => setDrawerOpen(false)}
        >
          <Control className={styles.mobileControl} />
        </Drawer>
      </div>
    </div>
  );
}

export default App;
