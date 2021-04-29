const axios = require("axios");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

module.exports = async (req, res) => {

    const response = await axios.get("https://www.wahlrecht.de/umfragen/forsa.htm");

    const dom = new JSDOM(response.data);
    var htmlDoc = dom.window.document;
    let el_table = htmlDoc.getElementsByClassName("wilko")[0];
    let el_thead = el_table.getElementsByTagName("thead")[0];
    let el_tbody = el_table.getElementsByTagName("tbody")[0];

    function parse(text) {
        return Number(text.trim().replace("-", "").replace(" ", "").replace("%", "").replace(",", "."))
    }

    // colors from https://de.wikipedia.org/wiki/Vorlage:Wahldiagramm/Partei/DE
    let result = {
        parties: {
            CDU: {
                index: 2,
                name: "Christlich Demokratische Union Deutschlands",
                color: "#000000"
            },
            SPD: {
                index: 3,
                name: "Sozialdemokratische Partei Deutschlands",
                color: "#E3000F"
            },
            GRÜNE: {
                index: 4,
                name: "BÜNDNIS 90/DIE GRÜNEN",
                color: "#46962b"
            },
            FDP: {
                index: 5,
                name: "Freie Demokratische Partei",
                color: "#ffff00"
            },
            LINKE: {
                index: 6,
                name: "DIE LINKE",
                color: "#BE3075"
            },
            AfD: {
                index: 7,
                name: "Alternative für Deutschland",
                color: "#009ee0"
            },
            Sonstige: {
                index: 8,
                name: "Sonstige",
                color: "#cccccc"
            },
        },
        history: []
    }
    for (let i = 0; i < el_tbody.children.length; i++) {
        const el_tr = el_tbody.children[i];

        let row = {
            parties: {},
            date: el_tr.children[0].innerHTML,
            Befragte: parse(el_tr.children[10].innerHTML.replace(".", "")),
        };
        for (const party in result.parties) {
            if (Object.hasOwnProperty.call(result.parties, party)) {
                const index = result.parties[party].index;
                row.parties[party] = parse(el_tr.children[index].innerHTML);
            }
        }

        result.history.push(row);
    };

    for (const party in result.parties) {
        if (Object.hasOwnProperty.call(result.parties, party)) {
            result.parties[party].index = undefined;
        }
    }

    res.json(result)
}
