"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../utils/firebase";
import LoggedUser from "@/components/LoggedUser";
import { isUserAuthorized } from "@/utils/isUserAllowed";

import { useRouter, useSearchParams } from "next/navigation";

import fetchAPI from "@/utils/graph";
import delay from "@/utils/delay";
import { Vivo, GoogleCloud, RgaDraw } from "@/components/logos";
import { Back } from "@/components/icons";
import Head from "../head";

type ExcalidrawType = React.MemoExoticComponent<any> | null;

let drawingVersion: string;

const UIOptions = {
    canvasActions: {
        changeViewBackgroundColor: true,
        toggleTheme: true,
    },
};

const initialData = {
    // elements: [
    //     {
    //         type: "rectangle",
    //         version: 93,
    //         versionNonce: 268541241,
    //         isDeleted: false,
    //         id: "0",
    //         fillStyle: "solid",
    //         strokeWidth: 1,
    //         strokeStyle: "solid",
    //         roughness: 0,
    //         opacity: 100,
    //         angle: 0,
    //         x: 30,
    //         y: 30,
    //         // x: -1418.675537109375,
    //         // y: -484.9792175292969,
    //         strokeColor: "#aaaaaa",
    //         backgroundColor: "transparent",
    //         width: 40,
    //         height: 40,
    //         seed: 1968410350,
    //         groupIds: [],
    //         roundness: null,
    //         boundElements: [],
    //         updated: 1677372276611,
    //         link: null,
    //         locked: false,
    //     },
    // ],
    appState: { viewBackgroundColor: "#ff0000" },
    scrollToContent: true,
};

export default function Board() {
    const [user, loadingUser] = useAuthState(auth);
    const router = useRouter();
    const searchParams = useSearchParams();
    const drawindId: string = searchParams.get("id") || "";
    // console.log(searchParams.get("id"));

    // const { id } = router.query || "";
    const [Excalidraw, setExcalidraw] = useState<ExcalidrawType>(null);
    const [MainComp, setMainComp] = useState<any>(null);
    const [excalidrawAPI, setExcalidrawAPI] = useState<any>();
    const [isValidDrawing, setIsValidDrawing] = useState<boolean>(false);
    const [drawingTitle, setDrawingTitle] = useState<string | null>(null);

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
                setTimeout(() => {
                    excalidrawAPI.addFiles(filesInScene);
                }, 500);
            }
        },
        [excalidrawAPI]
    );

    const getCurrentDrawingJson = useCallback(() => {
        if (MainComp !== null && MainComp !== undefined) {
            const json = MainComp?.serializeAsJSON(
                excalidrawAPI?.getSceneElements(),
                excalidrawAPI?.getAppState(),
                excalidrawAPI?.getFiles(),
                "local"
            );
            return json;
        }
    }, [MainComp, excalidrawAPI]);

    const fetchDrawing = useCallback(
        async (
            shouldUpdateVersion: boolean = false,
            loadCurrentScene: boolean = false
        ) => {
            const currentDrawingJson = await getCurrentDrawingJson();
            const data = await fetchAPI(
                `query MyQuery($id:ID) {
                drawing(where: {id: $id}) {
                  id
                  title
                  updatedAt
                  sceneObject
                }
              }`,
                {
                    variables: {
                        id: drawindId,
                    },
                }
            );

            if (data.drawing !== null) {
                setIsValidDrawing(true);

                const sceneObj = data.drawing.sceneObject;

                setDrawingTitle(data.drawing.title);

                if (shouldUpdateVersion) {
                    drawingVersion = data.drawing.updatedAt;
                }
                if (loadCurrentScene && excalidrawAPI) {
                    let mergedJson = JSON.stringify(
                        Object.assign(
                            JSON.parse(currentDrawingJson),
                            JSON.parse(sceneObj)
                        )
                    );
                    updateScene(mergedJson);
                }
                return data.drawing;
            }

            router.push("/gallery");
        },
        [updateScene, drawindId, excalidrawAPI, router]
    );

    /**
     *
     * ----------------------------------------------------------------
     * Initializing The Scene
     * ----------------------------------------------------------------
     */

    useEffect(() => {
        fetchDrawing(true, true);
        if (excalidrawAPI) {
            // excalidrawAPI.updateScene(initialData);
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

        console.log("ELEMENTS", excalidrawAPI.getAppState());

        const json = getCurrentDrawingJson();

        doMutate(
            `mutation MyMutation($json: Json, $id: ID, $title: String) {
            updateDrawing(
              where: {id: $id}
              data: {sceneObject: $json, title: $title}
            ) {
              id
              title
            }
          }`,
            {
                variables: {
                    id: drawindId,
                    json,
                    title: drawingTitle,
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

    function saveNewTitle(id: string, title: string) {
        doMutate(
            `mutation MyMutation($id: ID, $title: String) {
            updateDrawing(
              where: {id: $id}
              data: {title: $title}
            ) {
              id
              title
            }
          }`,
            {
                variables: {
                    id,
                    title,
                },
            }
        );
    }

    /**
     *
     * On Click on the Title
     */

    function handleOnClickTitle(evt: React.SyntheticEvent) {
        const target = evt.target as typeof evt.target & {
            contentEditable: boolean;
            focus: () => void;
        };
        target.contentEditable = true;
        target.focus();

        // console.log(target.add);
    }

    function handleOnTitleBlur(evt: React.SyntheticEvent) {
        const target = evt.target as typeof evt.target & {
            contentEditable: boolean;
            innerText: string;
        };
        setDrawingTitle(target.innerText);

        // console.log("blurrr", target.textContent);
        // console.log("blurrr state", drawingTitle);
        // delay(handleOnChange, 500);
        saveNewTitle(drawindId, target.innerText);

        target.contentEditable = false;
    }

    function handleOnTitleKeyDown(evt: React.SyntheticEvent) {
        const event = evt as typeof evt & {
            keyCode: number;
            target: {
                contentEditable: boolean;
                innerText: string;
                blur: () => void;
            };
        };
        const target = event.target;
        if (event.keyCode === 13) {
            event.preventDefault();
            setDrawingTitle(target.innerText);
            target.contentEditable = false;

            // handleOnChange();
            target.blur();
        }
    }

    function handleBackToGallery() {
        router.push("/gallery");
    }

    // ----------------------------------------------------------------

    if (Excalidraw === null || MainComp.MainMenu === null || !isValidDrawing) {
        return <div>Loading...</div>;
    }

    let hideMenu = "hideMenu";

    if (typeof window !== "undefined") {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);

        if (!user && !loadingUser) {
            router.push("/login?redirect=" + urlParams.get("id"));
            // return;
        }
    }

    if (!user) {
        // router.push("/login");
        return null;
    }
    return (
        <>
            {drawingTitle !== null && <Head title={drawingTitle} />}
            <header className="transition-opacity shadow-md fixed z-[3] w-full">
                <div className="flex px-3 justify-between h-14 items-center pl-4 bg-white">
                    <div className="flex items-center">
                        <button
                            className="hover:bg-slate-100 w-9 h-9 flex items-center justify-center"
                            onClick={handleBackToGallery}
                        >
                            <span className="sr-only">Back To Gallery</span>
                            <Back className="fill-slate-400 hover:fill-slate-700" />
                        </button>
                        <h1
                            contentEditable={false}
                            onClick={(evt) => handleOnClickTitle(evt)}
                            onBlur={handleOnTitleBlur}
                            onKeyDown={handleOnTitleKeyDown}
                            // onChange={handleOnTitleChange}
                            // onFocus={(evt) => handleClickTitle(evt)}
                            className="font-bold text-xl p-1 pl-3"
                        >
                            {drawingTitle}
                        </h1>
                    </div>
                    <div className="flex content-end gap-7 items-center">
                        <button onClick={handleBackToGallery}>
                            <RgaDraw />
                        </button>
                        <LoggedUser
                            picture={user?.photoURL}
                            name={user?.displayName?.split(" ")[0] || "Unknown"}
                            email={user?.email || "Unknown"}
                            size={40}
                            auth={auth}
                        />
                    </div>
                </div>
                <div className="flex px-3 justify-between h-14 items-center pl-14 bg-white">
                    <div className="flex gap-7 items-center">
                        {/* <GoogleCloud /> */}
                        {/* <Vivo /> */}
                    </div>

                    {/* <button
                        className="px-4 py-0 border-blue-500 border-solid border rounded-md text-blue-500"
                        onClick={() => {
                            saveToBackend();
                        }}
                    >
                        Save to Backend
                    </button> */}

                    {/* <div className="flex content-end gap-7 items-center">
                        <RgaDraw />
                    </div> */}
                </div>
            </header>

            <div style={{ height: "calc(100vh - 0px)" }} className={hideMenu}>
                <Excalidraw
                    ref={(api: any) => setExcalidrawAPI(api)}
                    // zenModeEnabled={true}
                    UIOptions={UIOptions}
                    scrollToContent={true}
                    onChange={handleOnChange}
                    // initialData={initialData}
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
