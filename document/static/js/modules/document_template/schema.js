import hash from "object-hash"

import {schema} from "prosemirror-schema-basic"
import {Schema, DOMSerializer} from "prosemirror-model"
import {buildMenuItems} from "prosemirror-example-setup"
import {MenuItem, Dropdown, blockTypeItem}  from "prosemirror-menu"
import {
    addColumnAfter,
    addColumnBefore,
    deleteColumn,
    addRowAfter,
    addRowBefore,
    deleteRow,
    mergeCells,
    splitCell,
    toggleHeaderRow,
    toggleHeaderColumn,
    toggleHeaderCell
}  from "prosemirror-tables"

import {docSchema} from "../schema/document"

const doc = {
    content: 'block+',
    toDOM(_node) {
        return ["div", 0]
    }
}

export const helpSchema = new Schema({
    nodes: schema.spec.nodes.remove('code_block').remove('image').remove('heading').remove('horizontal_rule').update('doc', doc),
    marks: schema.spec.marks.remove('code')
})

export const helpMenuContent = buildMenuItems(helpSchema).fullMenu
helpMenuContent.splice(1, 1) // full menu minus drop downs

const helpSerializer = DOMSerializer.fromSchema(helpSchema)

export const serializeHelp = content => {
    const doc = {type: 'doc', content},
        pmNode = helpSchema.nodeFromJSON(doc),
        dom = helpSerializer.serializeNode(pmNode)
    return dom.innerHTML
}

export const richtextPartSchema = new Schema({
    nodes: docSchema.spec.nodes.update('doc', {content: 'richtext_part'}),
    marks: docSchema.spec.marks
})

export const richtextMenuContent = buildMenuItems(richtextPartSchema).fullMenu
for (let i = 1; i <= 6; i++) {
    let type = richtextPartSchema.nodes[`heading${i}`]
    richtextMenuContent[1][1].content.push(blockTypeItem(type, {
        title: gettext("Change to heading ") + i,
        label: gettext("Heading level ") + i
    }))
}

export const tablePartSchema = new Schema({
    nodes: docSchema.spec.nodes.update('doc', {content: 'table_part'}).update('table_row', {
        content: "(table_cell | table_header)+",
        tableRole: "row",
        parseDOM: [{tag: "tr"}],
        toDOM() { return ["tr", 0] }
    }),
    marks: docSchema.spec.marks
})

export const tableMenuContent = buildMenuItems(tablePartSchema).fullMenu
for (let i = 1; i <= 6; i++) {
    let type = tablePartSchema.nodes[`heading${i}`]
    tableMenuContent[1][1].content.push(blockTypeItem(type, {
        title: gettext("Change to heading ") + i,
        label: gettext("Heading level ") + i
    }))
}
function tableMenuItem(label, cmd) {
    return new MenuItem({label, select: cmd, run: cmd})
}
const tableMenu = [
    tableMenuItem(gettext("Insert column before"), addColumnBefore),
    tableMenuItem(gettext("Insert column after"), addColumnAfter),
    tableMenuItem(gettext("Delete column"), deleteColumn),
    tableMenuItem(gettext("Insert row before"), addRowBefore),
    tableMenuItem(gettext("Insert row after"), addRowAfter),
    tableMenuItem(gettext("Delete row"), deleteRow),
    tableMenuItem(gettext("Split cell"), splitCell),
    tableMenuItem(gettext("Merge cells"), mergeCells),
    tableMenuItem(gettext("Toggle header column"), toggleHeaderColumn),
    tableMenuItem(gettext("Toggle header row"), toggleHeaderRow),
    tableMenuItem(gettext("Toggle header cells"), toggleHeaderCell)
]
tableMenuContent.splice(2, 0, [new Dropdown(tableMenu, {label: gettext("Table")})])

export const headingPartSchema = new Schema({
    nodes: docSchema.spec.nodes.update('doc', {content: 'heading_part'}).remove('horizontal_rule').remove('paragraph').remove('code_block'),
    marks: docSchema.spec.marks
})

export const headingMenuContent = buildMenuItems(headingPartSchema).fullMenu
for (let i = 1; i <= 6; i++) {
    let type = headingPartSchema.nodes[`heading${i}`]
    headingMenuContent[1][1].content.push(blockTypeItem(type, {
        title: gettext("Change to heading ") + i,
        label: gettext("Heading level ") + i
    }))
}

export const tagsPartSchema = new Schema({
    nodes: {
        doc: {content: "tags_part"},
        tags_part: docSchema.spec.nodes.get('tags_part'),
        tag: docSchema.spec.nodes.get('tag'),
        text: docSchema.spec.nodes.get('text')
    },
    marks: docSchema.spec.marks
})

export const contributorsPartSchema = new Schema({
    nodes: {
        doc: {content: "contributors_part"},
        contributors_part: docSchema.spec.nodes.get('contributors_part'),
        contributor: docSchema.spec.nodes.get('contributor'),
        text: docSchema.spec.nodes.get('text')
    },
    marks: docSchema.spec.marks
})

export function templateHash(template) {
    return hash(
        template,
        {
            algorithm: 'md5',
            encoding: 'base64'
        }
    ).slice(null, 22)
}
