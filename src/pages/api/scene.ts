import type { NextApiRequest, NextApiResponse } from 'next'
import jsonData from "./poc-claro.json"


// function getJson(project: string, player: string) {
//   let result;
//   fetch('./scene-retail30-magalu.json')
//     .then((response) => response.json())
//     .then((json) => result = json);
// }


export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  
  res.status(200).json( jsonData )
}
