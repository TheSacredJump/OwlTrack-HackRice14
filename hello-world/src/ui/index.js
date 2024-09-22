// Import the necessary Adobe SDK functions

import "@spectrum-web-components/theme/src/themes.js";
import "@spectrum-web-components/theme/theme-light.js";
import "@spectrum-web-components/theme/express/theme-light.js";
import "@spectrum-web-components/theme/express/scale-medium.js";
import "@spectrum-web-components/theme/sp-theme.js";

import "@spectrum-web-components/button/sp-button.js";

import addOnUISdk from "https://new.express.adobe.com/static/add-on-sdk/sdk.js"

addOnUISdk.ready.then(async() => {
    console.log('ready');
    const createShapeButton = document.getElementById("createShape");

    const { runtime } = addOnUISdk.instance;
    const sandboxProxy = await runtime.apiProxy("documentSandbox");
    sandboxProxy.log("Document sandbox up and running");

    createShapeButton.onclick = async () => {
        console.log('yeee')
    }

    createShapeButton.disabled = false;
})

