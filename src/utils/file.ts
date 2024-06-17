import fs from 'fs-extra'
export const readFile = async (filePath: string) => {
    try {
        const file = await fs.readFile(filePath, 'utf8')
        return file
    } catch (error) {
        console.error(error)
        return null
    }
}

