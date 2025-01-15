import styles from "./index.module.less";
import Header from "@/components/Header";
import Preview from "@/components/Preview";
import Control from "@/components/Control";

function App() {
  return (
    <div className={styles.wrapper}>
      <Header />
      <div className={styles.content}>
        <Preview />
        <Control />
      </div>
    </div>
  );
}

export default App;
