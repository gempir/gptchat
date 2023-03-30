import dynamic from "next/dynamic";
// @ts-ignore
const GptPage = dynamic(() => import("@/src/components/GptPage"), {
    ssr: false,
  });

export default function Home() {
    return (
        <main>
            <GptPage />
        </main>
    )
}
