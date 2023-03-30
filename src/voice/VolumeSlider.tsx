import { getConfig } from "../ConfigPage";
import { GptConfig } from "../GptConfig";

export function VolumeSlider({setGain}: {setGain?: (gain: string) => void}) {
    return <input type="range"
        onChange={e => {
            localStorage.setItem(GptConfig.GAIN, e.currentTarget.value);
            if (setGain) setGain(e.currentTarget.value);
        }}
        defaultValue={getConfig(GptConfig.GAIN, "100")}
        className="absolute top-7 left-16 w-[100px] h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
    />
}