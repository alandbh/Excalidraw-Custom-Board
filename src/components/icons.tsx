type fillProps = {
    fill?: string;
    className?: string;
};
export function Back(props: fillProps) {
    const fillColor = props.fill || "#5F6368";
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            fill="none"
            viewBox="0 0 28 28"
            className={props.className}
        >
            <path
                fill={props.fill}
                d="M20.375 13.096H10.29l4.406-4.406a.91.91 0 00-.292-1.477.899.899 0 00-.981.195l-5.95 5.95a.9.9 0 000 1.273l5.95 5.95a.9.9 0 101.273-1.274l-4.406-4.405h10.085a.906.906 0 00.902-.903.906.906 0 00-.902-.903z"
            ></path>
        </svg>
    );
}

export function Trash() {
    return (
        <svg
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 20 20"
        >
            <path
                strokeWidth="1.25"
                d="M3.333 5.833h13.334M8.333 9.167v5m3.334-5v5m-7.5-8.334l.833 10c0 .92.746 1.667 1.667 1.667h6.666c.92 0 1.667-.746 1.667-1.667l.833-10m-8.333 0v-2.5c0-.46.373-.833.833-.833h3.334c.46 0 .833.373.833.833v2.5"
            ></path>
        </svg>
    );
}
