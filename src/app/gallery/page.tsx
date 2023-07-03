"use client";
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../utils/firebase";
import LoggedUser from "@/components/LoggedUser";
import { isUserAuthorized } from "@/utils/isUserAllowed";
import { useRouter } from "next/navigation";
import { RgaDraw } from "@/components/logos";
import Link from "next/link";
import fetchAPI from "@/utils/graph";

type drawingType = {
    title: string;
    id: string;
};

type allDrawingsType = {
    drawings: drawingType[];
};

let router;

export default function Gallery() {
    router = useRouter();
    const [user, loadingUser] = useAuthState(auth);

    const [allDrawings, setAllDrawings] = useState<allDrawingsType | null>(
        null
    );

    useEffect(() => {
        fetchAPI(`query QueryAllDrawings {
            drawings(last: 10000) {
              title
              id
            }
          }`).then((data) => {
            console.log("allDrawingsData", data);
            setAllDrawings(data);
        });
    }, []);

    if (typeof window !== "undefined") {
        if (!user && !loadingUser) {
            router.push("/login");
            // return;
        }
    }

    if (!user) {
        // router.push("/login");
        return null;
    }

    // console.log("allDrawingsData", allDrawingsData);

    return (
        <>
            <header className="flex justify-between p-8">
                <div className="flex">
                    <RgaDraw style={{ width: 320, height: 60 }} />
                    {/* <h1 className="text-2xl text-gray-400">Welcome</h1> */}
                </div>
                {isUserAuthorized(user.email) && (
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleOnClickAddNew}
                            className="border border-blue-500 px-6 py-3 text-blue-500 hover:bg-blue-500/10"
                        >
                            Add New
                        </button>

                        <LoggedUser
                            picture={user?.photoURL}
                            name={user?.displayName?.split(" ")[0] || "Unknown"}
                            email={user?.email || "Unknown"}
                            size={40}
                            auth={auth}
                        />
                    </div>
                )}
            </header>
            <main className="p-8 flex flex-col">
                {isUserAuthorized(user.email) ? (
                    <div className="grid sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5  gap-4 max-w-[1144px] self-center">
                        {allDrawings?.drawings.map((drawing) => (
                            <Link
                                key={drawing.id}
                                className="border border-blue-500 px-6 py-3 text-blue-500 hover:bg-blue-500/10"
                                href={`/board?id=${drawing.id}`}
                            >
                                {drawing.title}
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="text-center m-20">
                        Sorry. Currently this app is only for R/GA&lsquo;s
                        fellows
                    </p>
                )}

                {/* <div>
                    <h1 className="text-2xl text-gray-400 mb-8">New Drawing</h1>

                    <form
                        onSubmit={(evt) => handleOnSubmit(evt)}
                        className="flex flex-col gap-7"
                    >
                        <div className="flex flex-col gap-2">
                            <label
                                className="font-bold text-lg"
                                htmlFor="title"
                            >
                                Title
                            </label>
                            <div>
                                <input
                                    className="border border-slate-400 px-6 py-3"
                                    type="text"
                                    id="title"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label
                                className="font-bold text-lg"
                                htmlFor="title"
                            >
                                Client
                            </label>
                            <div>
                                <input
                                    className="border border-slate-400 px-6 py-3"
                                    type="text"
                                    id="client"
                                />
                            </div>
                        </div>

                        <div className="flex  gap-2">
                            <button
                                type="submit"
                                className="border border-blue-500 px-6 py-3 text-white/80 font-bold bg-blue-500 hover:bg-blue-700"
                            >
                                Save
                            </button>
                            <button className="border border-blue-500 px-6 py-3 text-blue-500 hover:bg-blue-500/10">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div> */}
            </main>
        </>
    );
}

// async function handleOnSubmit(evt: React.SyntheticEvent) {
//     evt.preventDefault();
//     const target = evt.target as typeof evt.target & {
//         title: { value: string };
//         client: { value: string };
//     };
//     const data = {
//         title: target.title.value,
//         client: target.client.value || "",
//     };
//     const response = await fetch("/api/addnew", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//         },
//         body: JSON.stringify(data),
//     });

//     const returnedData = await response.json();

//     if (response.ok) {
//         router.push(`/board?id=${returnedData.publishDrawing.id}`);
//     }
//     console.log("evento", returnedData);
// }

async function handleOnClickAddNew() {
    const data = {
        title: "Untitled",
        client: "",
    };
    const response = await fetch("/api/addnew", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    const returnedData = await response.json();

    if (response.ok) {
        router.push(`/board?id=${returnedData.publishDrawing.id}`);
    }
    console.log("evento", returnedData);
}
