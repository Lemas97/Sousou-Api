import fsPromise from 'fs/promises'
import path from 'path'

export async function uploadFile (filepath: string, fileName: string, file: string): Promise<string> {
  filepath = path.join(process.cwd(), filepath)

  await fsPromise.readdir(filepath).catch(async () => {
    await fsPromise.mkdir(filepath, { recursive: true })
  })

  const splitBase64 = file.split(';base64,')

  const type = splitBase64[0].split('/').pop()

  const base64File = file.split(';base64,').pop()

  if (!base64File) throw new Error('File is empty')

  filepath = `${filepath}/${fileName}.${type ?? 'pdf'}`

  let fileNameExist = true
  let fileNameNumber = 0

  while (fileNameExist) {
    try {
      await fsPromise.access(filepath)
      fileNameNumber++
      filepath = `${filepath.split('.')[0]}-${fileNameNumber}.${filepath.split('.')[1]}`
    } catch (err) {
      fileNameExist = false
    }
  }

  await fsPromise.writeFile(
    filepath,
    base64File,
    { encoding: 'base64' }
  )

  return filepath
}
