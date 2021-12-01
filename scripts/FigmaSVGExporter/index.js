require("dotenv").config();
const axios = require("axios");
const figmaRestApi = require("./util/figmaRestApi");
const Utils = require("./util/utils");
const outputFolder = "./src/svg_temp/";

const getProjectNode = async () => {
  return await figmaRestApi.get(
    "files/" +
      process.env.FIGMA_PROJECT_ID +
      "/nodes?ids=" +
      process.env.FIGMA_PROJECT_NODE_ID
  );
};

const getSVGURL = async (ids) => {
  return await figmaRestApi.get(
    "images/" + process.env.FIGMA_PROJECT_ID + "/?ids=" + ids.join(",") + "&format=svg"
  );
};

const svgExporter = async () => {
  try {
    const response = await getProjectNode();
    const children = await response.data.nodes[
      process.env.FIGMA_PROJECT_NODE_ID
    ].document.children;

    // If ignoring private components
    let svgs;
    if(process.env.FILTER_PRIVATE_COMPONENTS === 'false') {
      svgs = Utils.findAllByValue(children, "COMPONENT")
    } else {
      svgs = Utils.filterPrivateComponents(Utils.findAllByValue(children, "COMPONENT"));
    }

    const numOfSvgs = svgs.length;

    console.log("Number of SVGs", numOfSvgs);

    Utils.createFolder(outputFolder);

    const svgDetailsMapping = {};

    for (let i = 0; i < numOfSvgs; i++) {
      const svg = svgs[i];
      let svgName = svg.name;

      if (svgName.includes("/")) {
        const nameArr = svg.name.split("/").join("-");
        svgName = nameArr;
      }

      svgDetailsMapping[svg.id] = {
        id: svg.id,
        name: svgName
      };
    }
    const svgIds = Object.keys(svgDetailsMapping);
    const svgURLResponse = await getSVGURL(svgIds);

    for (let i = 0; i < svgIds.length; i++) {
      const svgDetails = svgDetailsMapping[svgIds[i]];
      const svgDOM = await axios.get(svgURLResponse.data.images[svgDetails.id]);
      Utils.writeToFile(
        outputFolder + `${Utils.camelCaseToDash(svgDetails.name)}.svg`,
        svgDOM.data
      );
    }
  } catch (err) {
    console.error(err);
  }
};

svgExporter();
