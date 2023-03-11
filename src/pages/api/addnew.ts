import type { NextApiRequest, NextApiResponse } from 'next'
import fetchAPI from '@/utils/graph'

export default function handler(req:NextApiRequest, res:NextApiResponse) {
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
    res.status(200).json({ data: `CRIADOOO ${body.title} ${body.client}` })

    const newSceneObject = {
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
    }

    doCreate(
      `mutation CreateDrawing($title: String!) {
        createDrawing(data: {title: $title}) {
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
  }

function doCreate(gqlString: string, variables: { variables: {} }) {
    fetchAPI(gqlString, variables).then((data) => {
        console.log("created data", data);
        doPublish(data.createDrawing.id);
    });
}

function doPublish(id: string) {
  fetchAPI(
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
  ).then((data) => {
      console.log("published data", data);
  });
}