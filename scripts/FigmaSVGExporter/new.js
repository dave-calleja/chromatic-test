// This script will pull all icons from the CUDL Primitives Figma file
// https://www.figma.com/file/j0zTO9Hxh8YqsSdPw81VCV/CUDL-%E2%80%93-Primitives
// via figma api and save them as SVG.
//
// This is intended to be run manually and with the agreement of product designers.
//
const fetch = require('node-fetch');
const fs = require('fs').promises;
const path = require('path');
const Utils = require("./util/utils");

const OUTPUT_FOLDER = "./src/svg_temp/";
const FINAL_OUTPUT_FOLDER = "./src/svg_temp/";

const FIGMA_TOKEN = '282252-9c5ee743-d6ca-4d9a-ace1-53110257b033';
const FIGMA_PROJECT_NODE = '2194:20064';
const FILE_ID = 'NFaDK40O0AoIeMzTCSTpRG';

const defaultHeaders = {
    method: 'GET',
    headers: {
        'X-Figma-Token': FIGMA_TOKEN
    }
};

const filterNodes = (key, value, array) => {
    return array.reduce((acc, item) => {
        if (item[key] && item[key].includes(value)) {
            acc.push(item);
        }
        if (item.children) {
            acc = acc.concat(filterNodes(key, value, item.children));
        }
        return acc;
    }, []);
};

const getSvgImageUrls = async nodeIds => {
    const nodes = decodeURIComponent(nodeIds.join(','));
    const response = await fetch(
        `https://api.figma.com/v1/images/${FILE_ID}/?ids=${nodes}&format=svg`,
        defaultHeaders
    ).then(response => response.json());

    if (response.err) {
        console.error(response.err);
    }

    return response.images;
};

const getIcons = async () => {
    try {
        console.log('Getting figma file...');
        const response = await fetch(
            `https://api.figma.com/v1/files/${FILE_ID}/nodes?ids=${FIGMA_PROJECT_NODE}`,
            defaultHeaders
        ).then(response => response.json());

        const children = response.nodes[FIGMA_PROJECT_NODE].document.children;
        const icons = filterNodes('type', 'COMPONENT', children);
        const iconIds = icons.map(icon => icon.id);
        console.log('Getting svg image urls...');
        const iconImagePaths = await getSvgImageUrls(iconIds);

        return icons.map(icon => ({
            iconName:Utils.camelCaseToDash(icon.name.replace(/[\s/]/g, '-')),
            iconFileName: `${icon.name.replace(/[\s/]/g, '-')}.svg`,
            iconFileNameWOExt: `${icon.name}`,
            iconImagePath: iconImagePaths[icon.id]
        }));
    } catch (error) {
        console.error(error);
    }
};

const generateSVG = async icon => {
    try {
        // const exportVariable = icon.iconName.charAt(0).toUpperCase() + icon.iconName.slice(1);
        const svg = await fetch(icon.iconImagePath).then(response =>
            response.text()
        );
        await Utils.writeToFile(
          OUTPUT_FOLDER + `${Utils.camelCaseToDash(icon.iconFileName)}`,
          svg
        );
        // await Utils.appendToFile(
        //   OUTPUT_FOLDER + `index.js`,
        //   `export ${exportVariable.replace(/[\s-/]/g, '')}Icon from "./${Utils.camelCaseToDash(icon.iconFileName)}";\n`
        // );
        console.log(
            `${path.resolve(OUTPUT_FOLDER, icon.iconFileName)} generated 👌"`
        );
    } catch (error) {
        console.error(error);
    }
};

const init = async () => {
    const icons = await getIcons();
    await Utils.createFolder(OUTPUT_FOLDER);
    await Utils.writeToFile(OUTPUT_FOLDER + `index.js`,"");
    console.log("file written");
    const generateSVGs = icons.map(generateSVG);
    // await Promise.all(generateSVGs);
    // console.log('Icon SVG generation is done. ✨');
};

init();
