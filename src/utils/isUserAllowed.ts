export function isUserAuthorized(email: string | null) {
    if (
        email?.includes("alandbh@gmail.com") ||
        email?.includes("alanfuncionario@gmail.com") ||
        email?.includes("cindy.gcp.rga") ||
        email?.includes("@rga.com")
    ) {
        return true;
    }
}
