import type { NextApiRequest, NextApiResponse } from 'next'
import jsonData from "./exd2.json"

console.log(jsonData);



export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.status(200).json( jsonData )
}
