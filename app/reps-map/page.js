import dynamic from "next/dynamic";

const RepsMapClient = dynamic(() => import("./RepsMapClient"), {
  ssr: false,
});

export default function RepsMapPage() {
  return <RepsMapClient />;
}

