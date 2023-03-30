import { useStore } from "../store";

export function VolumeSlider() {
    const gain = useStore(state => state.gain);
    const setStoreGain = useStore(state => state.setGain);

    return <input type="range"
        onChange={e => {
            setStoreGain(Number(e.currentTarget.value));
        }}
        value={gain}
        className="absolute top-7 left-16 w-[100px] h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
    />
}