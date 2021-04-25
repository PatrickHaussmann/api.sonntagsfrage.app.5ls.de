const axios = require("axios");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

module.exports = async (req, res) => {

    const response = await axios.get("https://www.wahlrecht.de/umfragen/dimap.htm");

    const dom = new JSDOM(response.data);
    var htmlDoc = dom.window.document;
    let el_table = htmlDoc.getElementsByClassName("wilko")[0];
    let el_thead = el_table.getElementsByTagName("thead")[0];
    let el_tbody = el_table.getElementsByTagName("tbody")[0];

    let indices = {
        CDU: 2,
        SPD: 3,
        GRÜNE: 4,
        FDP: 5,
        LINKE: 6,
        AfD: 7,
        Sonstige: 8,
    }


    function parse(text) {
        return Number(text.trim().replace("-", "").replace(" ", "").replace("%", "").replace(",", "."))
    }

    /* parties: Object.keys(indices), */
    let result = {
        history: [],
    }
    for (let i = 0; i < el_tbody.children.length; i++) {
        const el_tr = el_tbody.children[i];

        let row = {
            parties: {},
            date: el_tr.children[0].innerHTML,
            Befragte: parse(el_tr.children[10].innerHTML.replace(".", "")),
        };
        for (const party in indices) {
            if (Object.hasOwnProperty.call(indices, party)) {
                const index = indices[party];
                row.parties[party] = parse(el_tr.children[index].innerHTML);
            }
        }

        result.history.push(row);
    };

    res.json(result)
}
