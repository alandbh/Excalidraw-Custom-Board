type HeadProps = {
    title: string | null;
};

export default function Head(props: HeadProps) {
    return (
        <>
            <title>{`R/DRAW :: ${props.title || "by R/GA"}`}</title>
            <meta
                content="width=device-width, initial-scale=1"
                name="viewport"
            />
            <meta
                name="description"
                content={`R/DRAW :: ${props.title || "by R/GA"}`}
            />
            <link rel="icon" href="/rdraw/favicon.ico" />
        </>
    );
}
