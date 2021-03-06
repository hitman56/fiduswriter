/* Connects Fidus Writer citation system with citeproc */
import {CSLExporter} from "biblatex-csl-converter"

export class citeprocSys {
    constructor(bibDB, citationLocales) {
        this.bibDB = bibDB
        this.citationLocales = citationLocales
        this.abbreviations = {
            "default": {}
        }
        this.abbrevsname = "default"
        // We cache values retrieved once.
        this.items = {}
        this.missingItems = []

    }

    retrieveItem(id) {
        if (!this.items[id]) {
            if (this.bibDB.db[id]) {
                const cslGetter = new CSLExporter(this.bibDB.db, [id])
                const cslOutput = cslGetter.parse()
                Object.assign(this.items, cslOutput)
            } else {
                this.missingItems.push(id)
                this.items[id] = {author:{literal:''}, type: 'article', id}
            }
        }
        return this.items[id]
    }

    retrieveLocale(lang) {
        let langCode = lang.replace('-','')
        let locale = this.citationLocales.find(locale => locale.language_code===langCode)
        if (!locale) {
            locale = this.citationLocales.find(locale => locale.language_code==='enUS')
        }
        if (locale) {
            return locale.contents
        }
    }

    getAbbreviation(dummy, obj, jurisdiction, vartype, key) {
        try {
            if (this.abbreviations[this.abbrevsname][vartype][key]) {
                obj["default"][vartype][key] = this.abbreviations[this.abbrevsname][vartype][key]
            } else {
                obj["default"][vartype][key] = ""
            }
        } catch (error) {
            // There is breakage here that needs investigating.
        }
    }
}
