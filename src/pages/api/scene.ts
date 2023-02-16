import type { NextApiRequest, NextApiResponse } from 'next'
import jsonData from "./scene-with-shapes-and-images.json"

console.log(jsonData);



export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.status(200).json( jsonData )
}
