let saveTimeout: any = null;

export default function delay(func: Function, wait: number = 2000) {
    if (saveTimeout !== null) {
        clearTimeout(saveTimeout);
    }
    saveTimeout = window.setTimeout(() => {
        func();
    }, wait);
}