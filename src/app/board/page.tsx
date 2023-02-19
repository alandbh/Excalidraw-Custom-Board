"use client";
import React, { useState, useEffect } from "react";
import fetchAPI from "@/utils/graph";
import delay from "@/utils/delay";

let serializeAsJSON: any;
let MainMenu: any = null;

type stateComp = React.MemoExoticComponent<any> | null;

export default function Board() {
    const [Comp, setComp] = useState<stateComp>(null);
    // const [MainMenu, setMainMenu] = useState(null);
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
        import("@excalidraw/excalidraw").then((comp) => {
            MainMenu = comp.MainMenu;
        });
    }, []);

    useEffect(() => {
        // fetch("/api/scene").then((data) => {
        //     data.json().then((dataJson) => {
        //         setJsonData(dataJson);
        //     });
        // });
        if (excalidrawAPI) {
            const updateScene = (sceneObj: string | object) => {
                const sceneObject =
                    typeof sceneObj === "string"
                        ? JSON.parse(sceneObj)
                        : sceneObj;

                if (excalidrawAPI !== null && sceneObject !== null) {
                    let filesInScene: object[] = [];
                    const jsonFiles = sceneObject["files"];

                    for (const fileId in jsonFiles) {
                        filesInScene.push(sceneObject["files"][fileId]);
                    }

                    excalidrawAPI.updateScene(sceneObject);
                    excalidrawAPI.addFiles(filesInScene);
                }
            };

            fetchAPI(
                `query MyQuery($playerSlug:String, $projectSlug:String) {
                    drawings(where: {player: {slug: $playerSlug}, project: {slug: $projectSlug}}) {
                      id
                      title
                      slug
                      sceneObject
                    }
                  }`,
                {
                    variables: {
                        playerSlug: "claro",
                        projectSlug: "telco-10",
                    },
                }
            ).then((data) => {
                // setJsonData(data.drawings[0].sceneObject);
                const sceneObj = data.drawings[0].sceneObject;
                // console.log(data.drawings[0])
                // console.log("api", sceneObj);
                updateScene(sceneObj);
            });
        }
    }, [excalidrawAPI]);

    /**
     *
     * ----------------------------------------------------------------
     *
     * ----------------------------------------------------------------
     */

    /**
     * Dynamic import of serializeAsJSON, since this is a client side library, that doesn't work in SSR
     */
    useEffect(() => {
        const initImport = async () => {
            const exdModule = await import("@excalidraw/excalidraw");
            serializeAsJSON = exdModule.serializeAsJSON;
            // Add logic with `term`
        };
        initImport();
    }, []);

    function saveToBackend() {
        const json = serializeAsJSON(
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
            }
          }`,
            {
                variables: {
                    id,
                },
            }
        ).then((data) => {
            console.log("json saved", data);
        });
    }

    /**
     * Save the drawing on changes
     * --------------------------------
     */

    function handleOnChange() {
        // Under the limit of 5 reqs per second
        delay(saveToBackend, 300);
    }

    // ----------------------------------------------------------------

    if (Comp === null || MainMenu === null) {
        return <div>Loading...</div>;
    }

    if (!Comp || !MainMenu) {
        return;
    }
    // if (excalidrawAPI && jsonData !== null) {
    //     console.log("api", excalidrawAPI.ready);
    //     if (excalidrawAPI.ready) {
    //         setTimeout(() => {
    //             // updateScene();
    //         });
    //     }
    // }
    return (
        <>
            <div className="h-10 px-3 transition-opacity shadow-md mb-2">
                <div className="flex justify-between">
                    <svg
                        width="145"
                        height="28"
                        viewBox="0 0 145 28"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <rect
                            x="3.55005"
                            y="2.7998"
                            width="22.4"
                            height="22.4"
                            fill="#F80303"
                        />
                        <path
                            d="M36.2052 15.4896H33.1736V21H30.304V6.94753H37.1967C38.1819 6.9666 38.9382 7.08736 39.4657 7.30981C39.9996 7.53226 40.4509 7.85958 40.8195 8.29177C41.1246 8.64769 41.3661 9.04174 41.544 9.47393C41.722 9.90612 41.811 10.3987 41.811 10.9516C41.811 11.619 41.6425 12.2768 41.3057 12.9251C40.9688 13.567 40.4127 14.0214 39.6373 14.2884C40.2856 14.549 40.7432 14.9208 41.0102 15.4038C41.2835 15.8805 41.4201 16.6114 41.4201 17.5965V18.5403C41.4201 19.1823 41.4455 19.6176 41.4964 19.8464C41.5726 20.2087 41.7506 20.4757 42.0302 20.6473V21H38.7984C38.7094 20.6886 38.6458 20.4375 38.6077 20.2468C38.5314 19.8528 38.4901 19.4492 38.4838 19.0361L38.4647 17.73C38.452 16.8338 38.2867 16.2364 37.969 15.9377C37.6575 15.639 37.0696 15.4896 36.2052 15.4896ZM37.988 12.9346C38.5727 12.6677 38.8651 12.1401 38.8651 11.352C38.8651 10.5004 38.5823 9.92836 38.0166 9.636C37.6988 9.47075 37.2222 9.38813 36.5866 9.38813H33.1736V13.1634H36.5008C37.1618 13.1634 37.6575 13.0871 37.988 12.9346ZM41.7919 21L47.2356 6.51852H49.495L44.0323 21H41.7919ZM58.3994 20.6568C57.624 21.1335 56.6706 21.3718 55.5393 21.3718C53.6771 21.3718 52.1517 20.7267 50.9632 19.4365C49.7238 18.1399 49.1041 16.3667 49.1041 14.1168C49.1041 11.8414 49.7302 10.0173 50.9823 8.64451C52.2343 7.27168 53.89 6.58526 55.9492 6.58526C57.7352 6.58526 59.1684 7.03969 60.2489 7.94856C61.3357 8.85107 61.9586 9.97921 62.1175 11.333H59.2288C59.0063 10.3733 58.4629 9.70273 57.5986 9.32139C57.1155 9.11165 56.5785 9.00678 55.9874 9.00678C54.8561 9.00678 53.925 9.43579 53.194 10.2938C52.4695 11.1455 52.1072 12.4293 52.1072 14.1454C52.1072 15.8741 52.5013 17.0976 53.2894 17.8158C54.0775 18.534 54.9736 18.8931 55.9778 18.8931C56.963 18.8931 57.7702 18.6103 58.3994 18.0446C59.0286 17.4726 59.4163 16.7258 59.5625 15.8042H56.3115V13.459H62.1651V21H60.2203L59.9247 19.2458C59.3591 19.9132 58.8506 20.3835 58.3994 20.6568ZM73.205 18.1113H68.0283L67.0558 21H63.986L69.0007 6.94753H72.3184L77.2949 21H74.1107L73.205 18.1113ZM72.3851 15.6898L70.6309 10.1603L68.8195 15.6898H72.3851ZM83.891 21L86.8783 6.94219H91.6814C92.0719 6.94219 92.4494 6.95521 92.8138 6.98124C93.1913 6.99426 93.5558 7.03982 93.9072 7.11792C94.2587 7.183 94.5906 7.28713 94.903 7.43031C95.2284 7.57349 95.5278 7.76223 95.8011 7.99653C96.1916 8.33496 96.4845 8.75149 96.6797 9.24611C96.875 9.72772 97.0051 10.2419 97.0702 10.7886C97.1353 11.3222 97.1418 11.8689 97.0898 12.4286C97.0377 12.9753 96.9661 13.483 96.875 13.9516C96.7708 14.4202 96.6407 14.8953 96.4845 15.3769C96.3283 15.8585 96.133 16.3336 95.8987 16.8022C95.6775 17.2578 95.4106 17.7003 95.0982 18.1299C94.7858 18.5464 94.4344 18.9304 94.0439 19.2818C93.6404 19.6463 93.2239 19.9392 92.7943 20.1604C92.3648 20.3817 91.9222 20.5574 91.4666 20.6876C91.0111 20.8048 90.549 20.8894 90.0804 20.9414C89.6248 20.9805 89.1627 21 88.6941 21H83.891ZM85.453 19.8676H88.6355C89.2343 19.8676 89.807 19.835 90.3537 19.7699C90.9004 19.6918 91.4731 19.5096 92.0719 19.2232C92.5926 18.989 93.0481 18.67 93.4386 18.2665C93.8291 17.863 94.161 17.427 94.4344 16.9584C94.7208 16.4768 94.9485 15.9756 95.1178 15.455C95.3 14.9343 95.4432 14.4332 95.5473 13.9516C95.6514 13.4439 95.723 12.9298 95.7621 12.4091C95.8141 11.8754 95.8011 11.3743 95.723 10.9057C95.6449 10.4241 95.4887 9.98805 95.2544 9.59756C95.0201 9.19405 94.6882 8.86213 94.2587 8.6018C93.8812 8.38052 93.4126 8.23734 92.8529 8.17225C92.3062 8.10717 91.74 8.07463 91.1542 8.07463H87.9717L85.453 19.8676ZM105.03 13.483C105.525 13.483 105.993 13.4309 106.436 13.3268C106.891 13.2226 107.295 13.0599 107.646 12.8387C108.011 12.6044 108.317 12.3115 108.564 11.9601C108.824 11.6086 109.007 11.1856 109.111 10.6909C109.228 10.1703 109.228 9.74074 109.111 9.40231C108.994 9.06388 108.798 8.79704 108.525 8.6018C108.252 8.40655 107.913 8.26988 107.51 8.19178C107.119 8.11368 106.703 8.07463 106.26 8.07463H102.043L100.891 13.483H105.03ZM100.657 14.6154L99.2898 21H97.9621L100.949 6.94219H106.455C108.004 6.94219 109.124 7.23507 109.814 7.82081C110.517 8.39353 110.731 9.33072 110.458 10.6324C110.276 11.5175 109.944 12.2204 109.462 12.741C108.994 13.2617 108.317 13.7043 107.432 14.0687C107.822 14.2119 108.102 14.4202 108.271 14.6935C108.453 14.9669 108.564 15.2793 108.603 15.6307C108.655 15.9821 108.655 16.3531 108.603 16.7436C108.551 17.1341 108.492 17.5116 108.427 17.876C108.323 18.4097 108.245 18.8523 108.193 19.2037C108.154 19.5552 108.134 19.8415 108.134 20.0628C108.134 20.2841 108.154 20.4598 108.193 20.59C108.232 20.7071 108.291 20.7982 108.369 20.8633L108.349 21H106.885C106.794 20.7527 106.761 20.4273 106.787 20.0238C106.813 19.6072 106.859 19.1712 106.924 18.7156C106.989 18.26 107.061 17.8175 107.139 17.3879C107.217 16.9454 107.256 16.5939 107.256 16.3336C107.256 15.9561 107.191 15.6567 107.061 15.4355C106.93 15.2012 106.755 15.0254 106.533 14.9083C106.325 14.7911 106.071 14.713 105.772 14.674C105.473 14.6349 105.16 14.6154 104.835 14.6154H100.657ZM109.716 21L118.229 6.94219H119.732L122.134 21H120.767L120.083 16.5874H113.679L111.083 21H109.716ZM114.363 15.455H119.869L118.697 8.07463L114.363 15.455ZM134.725 19.1256H134.764L140.426 6.94219H141.793L135.115 21H133.651L133.026 8.58227H132.987L127.091 21H125.626L124.982 6.94219H126.31L126.739 19.1256H126.778L132.636 6.94219H134.119L134.725 19.1256Z"
                            fill="black"
                        />
                    </svg>

                    <button
                        className="px-4 py-0 border-blue-500 border-solid border rounded-md text-blue-500"
                        onClick={() => {
                            saveToBackend();
                        }}
                    >
                        Save to Backend
                    </button>

                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="67"
                        height="31"
                        fill="none"
                        viewBox="0 0 67 31"
                    >
                        <path
                            fill="red"
                            d="M46.846 4c.814.006 1.634 0 2.449 0v7.5h-2.45c0-2.497-.005-4.998 0-7.5zm5.413 8.466c2.244-2.314 4.459-4.658 6.703-6.972.574.61 1.165 1.195 1.728 1.816-2.215 2.338-4.459 4.646-6.673 6.978-.598-.598-1.172-1.213-1.758-1.822zM9.32 11.089a7.03 7.03 0 011.887-.205c2.103-.053 4.148 1.055 5.449 2.754a7.48 7.48 0 011.324 2.748c-.967.006-1.928 0-2.888 0-.422-.88-1.079-1.664-1.922-2.127a4.127 4.127 0 00-1.512-.51c-.492-.012-.996-.053-1.482.076A4.162 4.162 0 008.03 15.08c-.75.738-1.254 1.77-1.301 2.853-.094 1.032.094 2.11.656 2.977.54.832 1.307 1.523 2.215 1.88 1.517.586 3.357.235 4.523-.96.392-.416.732-.891.978-1.413.961-.005 1.916-.005 2.877 0-.24 1.061-.756 2.04-1.412 2.877-.451.486-.89 1.002-1.441 1.365-2.479 1.781-6.082 1.682-8.408-.334-.726-.644-1.388-1.382-1.84-2.261-.837-1.553-1.048-3.422-.75-5.162.252-1.476.99-2.83 2.016-3.873.855-.925 1.957-1.634 3.175-1.939zm10.125-.205h2.747v15.104h-2.747V10.884zm8.302 3.012c.521-.112 1.054-.047 1.582-.065.609.053 1.224.147 1.804.363.58.211 1.183.475 1.588.979.48.592.65 1.382.685 2.144V26c-.931-.006-1.857.018-2.789-.012-.011-.392.006-.785-.005-1.183-.809.726-1.881 1.06-2.924 1.148-.662.117-1.348.012-1.974-.21a2.758 2.758 0 01-1.723-1.846c-.258-.92-.205-1.922.1-2.818.328-.914 1.125-1.565 1.997-1.864 1.12-.41 2.315-.474 3.475-.714.398 0 .797-.258.943-.65.106-.428.012-.967-.345-1.237-.399-.275-.885-.328-1.348-.346-.416.012-.85.018-1.219.247-.474.28-.691.843-.785 1.376-.92-.017-1.84 0-2.76-.017.118-.944.305-1.951.956-2.666.668-.838 1.722-1.23 2.742-1.312zm2.027 6.526c-.545.13-1.078.3-1.629.387-.44.088-.902.24-1.213.592-.433.533-.469 1.36-.129 1.957.147.275.44.41.71.503a2.733 2.733 0 002.466-.761c.65-.85.539-2.004.533-3.023-.264.088-.475.298-.738.345zm10.177-6.187c.568-.146 1.124-.386 1.716-.328.006.979.059 1.957.035 2.936-.504-.07-1.037-.13-1.529.023-1.072.31-1.968 1.295-2.091 2.467-.006.257-.077.51-.077.767v5.894c-.913 0-1.828.006-2.741-.006-.012-3.867 0-7.733.005-11.606.885-.006 1.77.023 2.654.059 0 .474-.011.954.006 1.435.522-.715 1.201-1.342 2.022-1.64zm6.843-.298c.41-.041.82-.082 1.23-.047 2.467.035 4.71 2.015 5.302 4.488.51 2.02.012 4.353-1.453 5.817-.85.956-2.015 1.606-3.245 1.8-.598.005-1.19 0-1.787 0-1.776-.265-3.322-1.53-4.201-3.13-.914-1.757-.914-3.99-.024-5.759.85-1.629 2.397-2.906 4.178-3.17zm.222 2.865c-.82.193-1.517.796-1.939 1.546-.627 1.096-.527 2.59.252 3.574.791 1.19 2.42 1.594 3.668.985.726-.34 1.277-1.008 1.582-1.764a3.414 3.414 0 00-.13-2.713c-.427-.837-1.218-1.5-2.126-1.652-.434-.035-.873-.053-1.307.024zm8.226.433h7.341v2.543c-2.443-.006-4.892.006-7.335 0-.006-.844 0-1.693-.006-2.543z"
                        ></path>
                    </svg>

                    <div className="h-7 flex content-end gap-7 items-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="149"
                            height="30"
                            fill="none"
                            viewBox="0 0 149 30"
                        >
                            <path
                                fill="#EA4335"
                                d="M20.667 9.77h.794l2.263-2.263.11-.962c-4.21-3.717-10.638-3.315-14.355.896a10.168 10.168 0 00-2.191 4.067c.251-.103.531-.12.794-.046l4.525-.747s.23-.382.35-.358a5.645 5.645 0 017.726-.588h-.016z"
                            ></path>
                            <path
                                fill="#4285F4"
                                d="M26.948 11.509a10.185 10.185 0 00-3.073-4.954L20.7 9.73a5.646 5.646 0 012.072 4.479v.564a2.827 2.827 0 010 5.654H17.12l-.565.572v3.39l.565.565h5.653a7.352 7.352 0 004.176-13.445z"
                            ></path>
                            <path
                                fill="#34A853"
                                d="M11.457 24.917h5.654V20.39h-5.654c-.403 0-.8-.087-1.167-.254l-.794.247-2.278 2.262-.199.794a7.297 7.297 0 004.438 1.477z"
                            ></path>
                            <path
                                fill="#FBBC05"
                                d="M11.457 10.237a7.351 7.351 0 00-4.438 13.18l3.279-3.279a2.827 2.827 0 012.326-5.152 2.834 2.834 0 011.413 1.413l3.279-3.279a7.336 7.336 0 00-5.859-2.883z"
                            ></path>
                            <path
                                fill="#5F6368"
                                d="M45.233 21.758a7.23 7.23 0 01-5.24-2.151 6.98 6.98 0 01-2.199-5.177 6.995 6.995 0 012.199-5.178 7.23 7.23 0 015.24-2.19 7.018 7.018 0 015.025 2.025l-1.413 1.438a5.093 5.093 0 00-3.612-1.43 5.037 5.037 0 00-3.732 1.587 5.191 5.191 0 00-1.533 3.77 5.18 5.18 0 001.533 3.725 5.328 5.328 0 007.432.087 4.22 4.22 0 001.088-2.469h-4.765v-2.031h6.741c.066.41.093.823.08 1.239a6.356 6.356 0 01-1.74 4.685 6.763 6.763 0 01-5.104 2.07zm15.673-1.35a4.86 4.86 0 01-6.726 0 4.525 4.525 0 01-1.373-3.374 4.53 4.53 0 011.373-3.373 4.87 4.87 0 016.726 0 4.531 4.531 0 011.374 3.373 4.527 4.527 0 01-1.382 3.374h.008zm-5.241-1.325a2.571 2.571 0 003.636.119c.04-.04.081-.078.119-.119a2.83 2.83 0 00.794-2.049 2.835 2.835 0 00-.794-2.056 2.614 2.614 0 00-3.772 0 2.835 2.835 0 00-.794 2.056c-.02.763.269 1.502.802 2.049h.009zm15.578 1.325a4.86 4.86 0 01-6.726 0 4.525 4.525 0 01-1.373-3.374 4.53 4.53 0 011.373-3.373 4.86 4.86 0 016.726 0 4.531 4.531 0 011.374 3.373 4.52 4.52 0 01-1.374 3.374zm-5.24-1.325a2.571 2.571 0 003.637.119c.04-.04.081-.078.119-.119a2.83 2.83 0 00.793-2.049 2.835 2.835 0 00-.793-2.056 2.612 2.612 0 00-3.771 0 2.835 2.835 0 00-.794 2.056c-.02.763.269 1.502.802 2.049h.008zm12.036 6.915a4.164 4.164 0 01-2.644-.843 4.872 4.872 0 01-1.54-1.953l1.809-.755c.197.463.505.87.897 1.183.419.338.945.516 1.484.5a2.385 2.385 0 001.85-.714 2.903 2.903 0 00.66-2.064v-.683h-.072A3.03 3.03 0 0178 21.741a4.311 4.311 0 01-3.176-1.381 4.57 4.57 0 01-1.358-3.327 4.616 4.616 0 011.358-3.35A4.302 4.302 0 0178 12.292a3.42 3.42 0 011.46.325c.396.172.748.43 1.034.755h.071v-.755h1.97v8.456a4.93 4.93 0 01-1.263 3.692 4.446 4.446 0 01-3.232 1.232zm.144-6.098a2.31 2.31 0 001.794-.793c.489-.561.748-1.288.722-2.034a2.998 2.998 0 00-.722-2.072 2.305 2.305 0 00-1.794-.793 2.456 2.456 0 00-1.858.793 2.898 2.898 0 00-.794 2.057 2.844 2.844 0 00.794 2.033c.473.523 1.15.819 1.858.81zm7.852-12.305v13.877h-2.072V7.595h2.072zm5.685 14.163a4.505 4.505 0 01-3.342-1.358 4.596 4.596 0 01-1.343-3.366 4.661 4.661 0 011.294-3.398 4.264 4.264 0 013.176-1.327 4.01 4.01 0 011.587.31 3.74 3.74 0 011.214.793c.3.29.566.611.794.961.185.296.34.607.47.928l.213.541-6.35 2.613a2.383 2.383 0 002.286 1.43 2.71 2.71 0 002.327-1.31l1.587 1.072a5.215 5.215 0 01-1.525 1.446 4.324 4.324 0 01-2.388.665zm-2.652-4.867l4.224-1.755a1.454 1.454 0 00-.66-.722 2.152 2.152 0 00-1.087-.278 2.451 2.451 0 00-1.706.755 2.514 2.514 0 00-.77 2zM106.639 21.759a6.542 6.542 0 01-6.652-6.693 6.543 6.543 0 016.388-6.693l.264-.001a5.927 5.927 0 014.708 2.095l-1.144 1.111a4.315 4.315 0 00-3.556-1.628 4.856 4.856 0 00-3.533 1.412 4.962 4.962 0 00-1.438 3.7 4.954 4.954 0 001.438 3.701 4.85 4.85 0 003.533 1.413 5.048 5.048 0 003.969-1.858l1.144 1.144a6.252 6.252 0 01-2.199 1.675 6.693 6.693 0 01-2.922.622zM114.832 21.473h-1.644V8.65h1.644v12.823zM117.517 13.755a4.598 4.598 0 016.479 0 4.65 4.65 0 011.27 3.335 4.65 4.65 0 01-1.27 3.334 4.598 4.598 0 01-6.479 0 4.65 4.65 0 01-1.271-3.334 4.643 4.643 0 011.271-3.335zm1.222 5.638a2.771 2.771 0 004.025 0c.58-.622.886-1.452.85-2.302a3.166 3.166 0 00-.85-2.302 2.771 2.771 0 00-4.025 0 3.178 3.178 0 00-.85 2.302 3.169 3.169 0 00.858 2.294l-.008.008zM134.372 21.473h-1.588v-1.214h-.047c-.283.46-.683.839-1.159 1.095a3.238 3.238 0 01-1.629.436 3.089 3.089 0 01-2.492-1 3.974 3.974 0 01-.85-2.683v-5.399h1.644v5.097c0 1.636.722 2.454 2.167 2.454a2.018 2.018 0 001.668-.794 2.99 2.99 0 00.643-1.897v-4.86h1.644v8.765h-.001zM139.953 21.759a3.856 3.856 0 01-2.937-1.343 4.762 4.762 0 01-1.232-3.326 4.762 4.762 0 011.232-3.327 3.862 3.862 0 012.937-1.342 3.729 3.729 0 011.794.428 3.03 3.03 0 011.191 1.072h.072l-.072-1.214V8.65h1.644v12.823h-1.588v-1.214h-.072a3.02 3.02 0 01-1.19 1.072 3.722 3.722 0 01-1.779.428zm.271-1.5a2.616 2.616 0 001.976-.858 3.216 3.216 0 00.794-2.311 3.218 3.218 0 00-.794-2.311 2.682 2.682 0 00-3.969 0 3.183 3.183 0 00-.794 2.301c-.051.843.235 1.67.794 2.302a2.617 2.617 0 001.993.877z"
                            ></path>
                        </svg>
                    </div>
                </div>
            </div>
            <div style={{ height: "calc(100vh - 80px)" }}>
                <Comp
                    ref={(api: any) => setExcalidrawAPI(api)}
                    // zenModeEnabled={true}
                    UIOptions={UIOptions}
                    scrollToContent={true}
                    onChange={handleOnChange}
                    // onChange={(
                    //     excalidrawElements: object[],
                    //     appState: {},
                    //     files: any
                    // ) => saveToBackend(excalidrawElements, appState, files)}
                >
                    <MainMenu>
                        <MainMenu.DefaultItems.LoadScene />
                        <MainMenu.DefaultItems.Export />
                        <MainMenu.DefaultItems.SaveAsImage />
                        <hr />
                        <MainMenu.DefaultItems.ToggleTheme />
                        <hr />
                        <MainMenu.DefaultItems.ChangeCanvasBackground />
                        <hr style={{ marginTop: 20 }} />
                        <MainMenu.DefaultItems.Help />
                    </MainMenu>
                </Comp>
            </div>
        </>
    );
}
