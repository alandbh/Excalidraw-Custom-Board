import Image from "next/image";
import React, { useCallback, useRef, useState } from "react";

type LoggedUserProps = {
    name: string | null;
    email: string;
    picture?: string | null;
    size?: number;
    auth: {
        signOut: () => void;
    };
};

function LoggedUser(props: LoggedUserProps) {
    const [popOver, setPopOver] = useState(false);
    const popUpRef = useRef<HTMLDivElement>(null);

    function handlePopOver() {
        setPopOver((prev) => !prev);
        console.log("click ");
    }

    const closePopOverCallBack = useCallback(
        (e: any) => {
            if (e) {
                console.log("click fora Esc?", e.key);
                setPopOver(false);
            }
            if (popUpRef && popOver) {
                if (!popUpRef.current?.contains(e.target)) {
                    console.log("click fora");
                    setPopOver(false);
                }
            }
            window.removeEventListener("click", closePopOverCallBack, true);
            window.removeEventListener("keydown", closePopOverCallBack, true);
        },
        [popOver]
    );

    if (window !== undefined) {
        window.addEventListener("click", closePopOverCallBack, true);
        window.addEventListener("keydown", closePopOverCallBack, true);
    }

    return (
        <div ref={popUpRef} className="relative top-0">
            <button
                onClick={handlePopOver}
                className="flex items-center"
                style={{ width: props.size || 28, height: props.size || 28 }}
            >
                <Image
                    className="rounded-full overflow-hidden"
                    src={props.picture || "/vercel.svg"}
                    width={props.size || 28}
                    height={props.size || 28}
                    alt={`${props.name}'s picture`}
                />
            </button>

            <div
                className={`absolute z-10 min-w-[250px] flex flex-col items-center gap-2 top-0 right-0 px-6 py-6 bg-white dark:bg-slate-800 shadow-lg ${
                    popOver ? "block" : "hidden"
                }`}
            >
                <span>
                    <Image
                        src={props.picture || "/vercel.svg"}
                        width={50}
                        height={50}
                        alt={`${props.name}'s picture`}
                        className="rounded-full overflow-hidden"
                    />
                </span>
                <h2 className="text-sm font-bold whitespace-nowrap">
                    Hi, {props.name}!
                </h2>
                <p className="text-slate-400 text-sm">{props.email}</p>
                <h3 className="mt-6">Log out?</h3>
                <div className="flex justify-around w-full mt-2">
                    {/* <Link tabIndex={0} href="/api/auth/logout">
                        <a className="border border-slate-400 px-4 py-1 text-sm rounded-md hover:bg-primary hover:text-white hover:border-transparent">
                            Yes
                        </a>
                    </Link> */}
                    <button
                        className="border border-slate-400 px-4 py-1 text-sm rounded-md hover:bg-blue-500 hover:text-white hover:border-transparent"
                        onClick={() => {
                            props.auth.signOut();
                        }}
                    >
                        Yes
                    </button>
                    <button
                        onClick={() => setPopOver(false)}
                        className="text-sm hover:underline underline-offset-2 px-4"
                    >
                        No
                    </button>
                </div>
            </div>
        </div>
    );
}

export default LoggedUser;
