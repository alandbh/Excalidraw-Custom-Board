// const debounce = <F extends ((...args: any) => any)>(func: F, waitFor: number) => {
//     let timeout: number = 0

//     const debounced = (...args: any) => {
//         clearTimeout(timeout)
//         setTimeout(() => func(...args), waitFor)
//     }
    
//     return debounced as (...args: Parameters<F>) => ReturnType<F>
// }

// export default debounce


const debounce = (func: (args:any)=>any, waitFor: number) => {
    let timeout: number = 0

    const debounced = (...args: any) => {
        clearTimeout(timeout)
        setTimeout(() => func(args), waitFor)
    }
    
    return debounced
}

export default debounce