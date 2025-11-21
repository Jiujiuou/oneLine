import { useEffect } from "react";
import Layout from "./components/Layout";
import MessageProvider from "./components/Message";
import { initAudioContext } from "@/utils/sound";

function App() {
  // 初始化音频
  useEffect(() => {
    initAudioContext();
  }, []);

  return (
    <>
      <Layout />
      <MessageProvider />
    </>
  );
}

export default App;
