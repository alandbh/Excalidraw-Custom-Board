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
