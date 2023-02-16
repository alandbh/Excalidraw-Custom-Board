"use client";
import React, { useState, useEffect } from "react";

type stateComp = React.MemoExoticComponent<any> | null;

export default function Board() {
    const [Comp, setComp] = useState<stateComp>(null);
    const [excalidrawAPI, setExcalidrawAPI] = useState<any>();
    const [jsonData, setJsonData] = useState(null);
    const UIOptions = {
        canvasActions: {
            changeViewBackgroundColor: true,
            toggleTheme: true,
        },
    };
    useEffect(() => {
        import("@excalidraw/excalidraw").then((comp) => {
            setComp(comp.Excalidraw);
        });
    }, []);

    useEffect(() => {
        fetch("/api/scene").then((data) => {
            data.json().then((dataJson) => {
                setJsonData(dataJson);
            });
        });
    }, []);

    /**
     *
     * ----------------------------------------------------------------
     *
     * ----------------------------------------------------------------
     */

    const updateScene = () => {
        if (excalidrawAPI !== null && jsonData !== null) {
            let filesInScene: any[] = [];
            const jsonFiles: any = jsonData["files"];

            for (const fileId in jsonFiles) {
                filesInScene.push(jsonData["files"][fileId]);
            }

            excalidrawAPI.updateScene(jsonData);
            excalidrawAPI.addFiles(filesInScene);

            // console.log(
            //     "aaaa",
            //     jsonData["files"]["17c63251d93085247b060fdb3ed3f07d4a48927f"]
            // );
            // console.log("bbb", filesInScene);
        }
    };

    if (!Comp) {
        return;
    }
    return (
        <>
            <div className="h-8 m-3">
                <button
                    className="px-4 py-2 border-blue-500 border-solid border-2 rounded-md text-blue-500"
                    onClick={updateScene}
                >
                    Import JSON and update Scene
                </button>
            </div>
            <div style={{ height: "calc(100vh - 64px)" }}>
                <Comp
                    ref={(api: any) => setExcalidrawAPI(api)}
                    appState={{
                        currentItemFillStyle: "solid",
                        currentItemRoughness: 0,
                    }}
                    UIOptions={UIOptions}
                />
            </div>
        </>
    );
}
