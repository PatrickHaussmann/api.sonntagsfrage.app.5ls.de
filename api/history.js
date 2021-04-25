const axios = require("axios");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

module.exports = async (req, res) => {

    let result = {}

    const response = await axios.get("https://www.wahlrecht.de/umfragen/dimap.htm");
    
    const dom = new JSDOM(response.data);
    var htmlDoc = dom.window.document
    

    res.json(result)
}
