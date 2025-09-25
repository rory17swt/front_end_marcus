const tokenName = 'itinero-token'

export const setToken = (token) => {
    if (!token) {
        console.log('No token provided to setToken()')
        return
    }
    localStorage.setItem(tokenName, token)
    console.log('Token stored:', token)
}

export const getToken = () => {
    return localStorage.getItem(tokenName)
}

export const removeToken = () => {
    localStorage.removeItem(tokenName)
}

export const getUserFromToken = () => {
    const token = getToken()
    if (!token) return null

    const payload = token.split('.')[1]
    const payloadAsObject = JSON.parse(atob(payload))

    const timeNow = Date.now() / 1000
    const expTime = payloadAsObject.exp
    if (expTime < timeNow) {
        removeToken()
        console.log('Token removed')
        return null
    }
    return payloadAsObject.user
}