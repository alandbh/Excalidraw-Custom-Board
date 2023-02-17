import type { NextApiRequest, NextApiResponse } from 'next'
import jsonData from "./poc-claro.json"

// console.log(jsonData);

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
//   console.log(getJson('retail-30', 'magalu'));
  
  res.status(200).json( jsonData )
}
