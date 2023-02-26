import { RgaDraw } from "@/components/logos";
import Link from "next/link";

export default function Home() {
    return (
        <main className="p-8 flex flex-col items-center justify-center h-full">
            <div className="flex flex-col items-center lg:-mt-96">
                <h1 className="text-2xl mb-8 text-gray-400">Welcome</h1>
                <div className="mb-5">
                    <RgaDraw style={{ width: 300, height: 100 }} />
                </div>
                <Link
                    className="border border-blue-500 px-6 py-3 text-blue-500 hover:bg-blue-500/10"
                    href="/board"
                >
                    Go To The Board
                </Link>
            </div>
        </main>
    );
}
