import type { NextApiRequest, NextApiResponse } from 'next'
import fetchAPI from '@/utils/graph'

export default async function handler(req:NextApiRequest, res:NextApiResponse) {
    // Get data submitted in request's body.
    const body = req.body
  
    // Optional logging to see the responses
    // in the command line where next.js app is running.
    console.log('body: ', body)
  
    // Guard clause checks for first and last name,
    // and returns early if they are not found
    if (!body.title) {
      // Sends a HTTP bad request error code
      return res.status(400).json({ data: 'Missing Title' })
    }
  
    // Found the name.
    // Sends a HTTP success code
    

    const newSceneObject = `{
      "type": "excalidraw",
      "version": 2,
      "source": "http://localhost:3000",
      "elements": [
      ],
      "appState": {
        "gridSize": null,
        "viewBackgroundColor": "#edf2ff"
      },
      "files": {
        
      }
    }`

    const createdId = await doCreate(
      `mutation CreateDrawing($title: String!, $sceneObject: Json) {
        createDrawing(data: {
          title: $title
          sceneObject: $sceneObject
        }) {
          id
          title
        }
      }`,
      {
          variables: {
            title: body.title,
            sceneObject: newSceneObject
          },
      }
  );

  const publishedData = await doPublish(createdId);
  res.status(200).json(publishedData)
  }

async function doCreate(gqlString: string, variables: { variables: {} }) {
  const createdData = await fetchAPI(gqlString, variables);
  return createdData.createDrawing.id
    // fetchAPI(gqlString, variables).then((data) => {
    //     console.log("created data", data);
    //     doPublish(data.createDrawing.id);
    // });
}

async function doPublish(id: string) {
  const publishedData = await fetchAPI(
      `mutation PublishDrawing($id: ID) {
      publishDrawing(
        where: {id: $id}
      ) {
        id
        title
        updatedAt
      }
    }`,
      {
          variables: {
              id,
          },
      }
  );

  return publishedData
}