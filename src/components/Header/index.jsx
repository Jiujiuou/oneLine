import { useSoundStore } from "@/store";
import { DropdownSelect } from "@/components";
import {
  getSoundPresetKeys,
  getSoundPresetName,
} from "@/constants/soundPresets";
import styles from "./index.module.less";

function Header() {
  const { currentPreset, setPreset } = useSoundStore();

  // 获取音效预设选项
  const soundPresetOptions = getSoundPresetKeys();

  const handleSoundPresetChange = (preset) => {
    setPreset(preset);
  };

  return (
    <div className={styles.header}>
      <div className={styles.name}>Jiujiu-Game</div>
      <div className={styles.soundControl}>
        <DropdownSelect
          label="音效"
          value={currentPreset}
          options={soundPresetOptions}
          onSelect={handleSoundPresetChange}
          formatOptionLabel={(key) => getSoundPresetName(key)}
          placeholder="选择音效..."
        />
      </div>
    </div>
  );
}

export default Header;
