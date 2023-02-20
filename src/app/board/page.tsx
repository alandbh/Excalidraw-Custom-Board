"use client";
import React, { useState, useEffect, useCallback } from "react";
import fetchAPI from "@/utils/graph";
import delay from "@/utils/delay";
import { Claro, GoogleCloud, RgaDraw } from "@/components/logos";

type ExcalidrawType = React.MemoExoticComponent<any> | null;

let drawingVersion: string;

export default function Board() {
    const [Excalidraw, setExcalidraw] = useState<ExcalidrawType>(null);
    const [MainComp, setMainComp] = useState<any>(null);
    const [excalidrawAPI, setExcalidrawAPI] = useState<any>();

    const UIOptions = {
        canvasActions: {
            changeViewBackgroundColor: true,
            toggleTheme: true,
        },
    };
    useEffect(() => {
        import("@excalidraw/excalidraw").then((comp) => {
            setExcalidraw(comp.Excalidraw);
            setMainComp(comp);
        });
    }, []);

    const updateScene = useCallback(
        (sceneObj: string | object) => {
            const sceneObject =
                typeof sceneObj === "string" ? JSON.parse(sceneObj) : sceneObj;

            if (excalidrawAPI !== null && sceneObject !== null) {
                let filesInScene: object[] = [];
                const jsonFiles = sceneObject["files"];

                for (const fileId in jsonFiles) {
                    filesInScene.push(sceneObject["files"][fileId]);
                }

                excalidrawAPI.updateScene(sceneObject);
                excalidrawAPI.addFiles(filesInScene);
            }
        },
        [excalidrawAPI]
    );

    const fetchDrawing = useCallback(
        async (
            shouldUpdateVersion: boolean = false,
            loadCurrentScene: boolean = false
        ) => {
            const data = await fetchAPI(
                `query MyQuery($playerSlug:String, $projectSlug:String) {
                drawings(where: {player: {slug: $playerSlug}, project: {slug: $projectSlug}}) {
                  id
                  title
                  updatedAt
                  sceneObject
                }
              }`,
                {
                    variables: {
                        playerSlug: "claro",
                        projectSlug: "telco-10",
                    },
                }
            );

            const sceneObj = data.drawings[0].sceneObject;
            if (shouldUpdateVersion) {
                drawingVersion = data.drawings[0].updatedAt;
            }
            if (loadCurrentScene) {
                updateScene(sceneObj);
            }
            return data.drawings[0];
        },
        [updateScene]
    );

    /**
     *
     * ----------------------------------------------------------------
     * Initializing The Scene
     * ----------------------------------------------------------------
     */

    useEffect(() => {
        if (excalidrawAPI) {
            fetchDrawing(true, true);
        }
    }, [excalidrawAPI, fetchDrawing]);

    /**
     *
     * Saving to backend
     * ----------------------------------------------------------------
     */
    function handleOnChange() {
        // Under the limit of 5 reqs per second
        delay(saveToBackend, 500);
    }

    async function saveToBackend() {
        // Check if there's a newer version of the drawing on the backend
        const remoteDrawing = await fetchDrawing();
        const remoteDrawingVersion = new Date(remoteDrawing.updatedAt);
        const currentDrawingVersion = new Date(drawingVersion);

        if (remoteDrawingVersion > currentDrawingVersion) {
            fetchDrawing(true, true);
            return;
        }

        const json = MainComp.serializeAsJSON(
            excalidrawAPI.getSceneElements(),
            excalidrawAPI.getAppState(),
            excalidrawAPI.getFiles(),
            "local"
        );

        doMutate(
            `mutation MyMutation($json: Json) {
            updateDrawing(
              where: {id: "cle8x88jd3qti0blrt5pac2uz"}
              data: {sceneObject: $json}
            ) {
              id
              title
            }
          }`,
            {
                variables: {
                    json,
                },
            }
        );

        // console.log("json", json);
    }

    function doMutate(gqlString: string, variables: { variables: {} }) {
        fetchAPI(gqlString, variables).then((data) => {
            console.log("json", data.updateDrawing.id);
            doPublish(data.updateDrawing.id);
        });
    }

    function doPublish(id: string) {
        fetchAPI(
            `mutation PublishDrawing($id: ID) {
            publishDrawing(
              where: {id: $id}
            ) {
              id
              title
              updatedAt
            }
          }`,
            {
                variables: {
                    id,
                },
            }
        ).then((data) => {
            console.log("json saved", data);
            drawingVersion = data.publishDrawing.updatedAt;
        });
    }

    // ----------------------------------------------------------------

    if (Excalidraw === null || MainComp.MainMenu === null) {
        return <div>Loading...</div>;
    }

    let hideMenu = "hideMenu";
    return (
        <>
            <header className="h-14  transition-opacity shadow-md fixed z-[3] w-full">
                <div className="flex px-3 justify-between h-14 items-center pl-14 bg-white">
                    <div className="flex gap-7 items-center">
                        <GoogleCloud />
                        <Claro />
                    </div>

                    {/* <button
                        className="px-4 py-0 border-blue-500 border-solid border rounded-md text-blue-500"
                        onClick={() => {
                            saveToBackend();
                        }}
                    >
                        Save to Backend
                    </button> */}

                    <div className="flex content-end gap-7 items-center">
                        <RgaDraw />
                    </div>
                </div>
            </header>
            <div style={{ height: "calc(100vh - 0px)" }} className={hideMenu}>
                <Excalidraw
                    ref={(api: any) => setExcalidrawAPI(api)}
                    // zenModeEnabled={true}
                    UIOptions={UIOptions}
                    scrollToContent={true}
                    onChange={handleOnChange}
                    // viewModeEnabled={true}
                    // onChange={(
                    //     excalidrawElements: object[],
                    //     appState: {},
                    //     files: any
                    // ) => saveToBackend(excalidrawElements, appState, files)}
                >
                    <MainComp.MainMenu>
                        <MenuItems
                            isVisible={true}
                            parent={MainComp.MainMenu}
                        />
                    </MainComp.MainMenu>
                </Excalidraw>
            </div>
            <footer className="hidden">
                <RgaDraw />
            </footer>
        </>
    );
}

type MenuProps = {
    isVisible: boolean;
    parent: {
        DefaultItems: {
            LoadScene: React.FC;
            Export: React.FC;
            SaveAsImage: React.FC;
            ToggleTheme: React.FC;
            ChangeCanvasBackground: React.FC;
            Help: React.FC;
        };
    };
};

function MenuItems({ isVisible, parent }: MenuProps) {
    const MainMenu = parent;
    if (isVisible && MainMenu) {
        return (
            <>
                <MainMenu.DefaultItems.LoadScene />
                <MainMenu.DefaultItems.Export />
                <MainMenu.DefaultItems.SaveAsImage />
                <hr />
                <MainMenu.DefaultItems.ToggleTheme />
                <hr />
                <MainMenu.DefaultItems.ChangeCanvasBackground />
                <hr style={{ marginTop: 20 }} />
                <MainMenu.DefaultItems.Help />
            </>
        );
    } else {
        return null;
    }
}
