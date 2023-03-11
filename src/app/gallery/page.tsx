"use client";
import React from "react";
import { RgaDraw } from "@/components/logos";
import Link from "next/link";
export default function Gallery() {
    return (
        <>
            <header className="flex justify-between p-8">
                <div className="flex">
                    <RgaDraw style={{ width: 150, height: 50 }} />
                    <h1 className="text-2xl text-gray-400">Welcome</h1>
                </div>
                <div>
                    <Link
                        className="border border-blue-500 px-6 py-3 text-blue-500 hover:bg-blue-500/10"
                        href="/board"
                    >
                        Add New
                    </Link>
                </div>
            </header>
            <main className="p-8 flex flex-col">
                <div className="grid sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5  gap-4 max-w-[1144px] self-center">
                    <Link
                        className="border border-blue-500 px-6 py-3 text-blue-500 hover:bg-blue-500/10"
                        href="/board"
                    >
                        Go To The Board XXX
                    </Link>
                    <Link
                        className="border border-blue-500 px-6 py-3 text-blue-500 hover:bg-blue-500/10"
                        href="/board"
                    >
                        Go To The Board XXX
                    </Link>
                    <Link
                        className="border border-blue-500 px-6 py-3 text-blue-500 hover:bg-blue-500/10"
                        href="/board"
                    >
                        Go To The Board XXX
                    </Link>
                    <Link
                        className="border border-blue-500 px-6 py-3 text-blue-500 hover:bg-blue-500/10"
                        href="/board"
                    >
                        Go To The Board XXX
                    </Link>
                    <Link
                        className="border border-blue-500 px-6 py-3 text-blue-500 hover:bg-blue-500/10"
                        href="/board"
                    >
                        Go To The Board XXX
                    </Link>
                    <Link
                        className="border border-blue-500 px-6 py-3 text-blue-500 hover:bg-blue-500/10"
                        href="/board"
                    >
                        Go To The Board XXX
                    </Link>
                    <Link
                        className="border border-blue-500 px-6 py-3 text-blue-500 hover:bg-blue-500/10"
                        href="/board"
                    >
                        Go To The Board XXX
                    </Link>
                </div>

                <div>
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
                </div>
            </main>
        </>
    );
}

async function handleOnSubmit(evt: React.SyntheticEvent) {
    evt.preventDefault();
    const target = evt.target as typeof evt.target & {
        title: { value: string };
        client: { value: string };
    };
    const data = {
        title: target.title.value,
        client: target.client.value || "",
    };
    const response = await fetch("/api/addnew", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    const returnedData = await response.json();
    console.log("evento", returnedData);
}
