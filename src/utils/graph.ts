type Variables = {
    variables: {}
}


export default async function fetchAPI(query:string, variables?:Variables) {

    const apiURL:string = process.env.NEXT_PUBLIC_GRAPHCMS_API ?? ''
    
    const fetchVariables = variables !== undefined ? variables["variables"] : {};

    
    
    
    const res = await fetch(apiURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: 'Bearer ' + process.env.NEXT_PUBLIC_GRAPHCMS_TOKEN
        },
        body: JSON.stringify({
            query,
            variables: fetchVariables,
        }),
    });
    
    const json = await res.json();
    console.log('api', json);

    if (json.errors) {
        console.error(json.errors);
        throw new Error("Failed to fetch API");
    }

    return json.data;
}
