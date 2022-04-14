import { UserInputError } from 'apollo-server-koa'
import fsPromise from 'fs/promises'

export async function downloadFile (filepath: string): Promise<string> {
  const encodedFile = await fsPromise.readFile(
    filepath,
    { encoding: 'base64' }
  ).catch(err => {
    console.log(err)
    throw new UserInputError('File does not exist')
  })

  return encodedFile
}
