// To parse this data:
//
//   import { Convert, View } from "./file";
//
//   const view = Convert.toView(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface View {
    id:           string;
    name:         string;
    type:         string;
    parent:       Parent;
    grouping:     Divide;
    divide:       Divide;
    sorting:      Columns;
    filters:      Filters;
    columns:      Columns;
    team_sidebar: TeamSidebar;
    settings:     Settings;
}

export interface Columns {
    fields: any[];
}

export interface Divide {
    field:     null | string;
    dir:       number | null;
    collapsed: any[];
    ignore?:   boolean;
}

export interface Filters {
    op:          string;
    fields:      any[];
    search:      string;
    show_closed: boolean;
}

export interface Parent {
    id:   string;
    type: number;
}

export interface Settings {
    show_task_locations:       boolean;
    show_subtasks:             number;
    show_subtask_parent_names: boolean;
    show_closed_subtasks:      boolean;
    show_assignees:            boolean;
    show_images:               boolean;
    collapse_empty_columns:    null;
    me_comments:               boolean;
    me_subtasks:               boolean;
    me_checklists:             boolean;
}

export interface TeamSidebar {
    assignees:         any[];
    assigned_comments: boolean;
    unassigned_tasks:  boolean;
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
    public static toView(json: string): View {
        return cast(JSON.parse(json), r("View"));
    }

    public static viewToJson(value: View): string {
        return JSON.stringify(uncast(value, r("View")), null, 2);
    }
}

function invalidValue(typ: any, val: any, key: any = ''): never {
    if (key) {
        throw Error(`Invalid value for key "${key}". Expected type ${JSON.stringify(typ)} but got ${JSON.stringify(val)}`);
    }
    throw Error(`Invalid value ${JSON.stringify(val)} for type ${JSON.stringify(typ)}`, );
}

function jsonToJSProps(typ: any): any {
    if (typ.jsonToJS === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.json] = { key: p.js, typ: p.typ });
        typ.jsonToJS = map;
    }
    return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
    if (typ.jsToJSON === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.js] = { key: p.json, typ: p.typ });
        typ.jsToJSON = map;
    }
    return typ.jsToJSON;
}

function transform(val: any, typ: any, getProps: any, key: any = ''): any {
    function transformPrimitive(typ: string, val: any): any {
        if (typeof typ === typeof val) return val;
        return invalidValue(typ, val, key);
    }

    function transformUnion(typs: any[], val: any): any {
        // val must validate against one typ in typs
        const l = typs.length;
        for (let i = 0; i < l; i++) {
            const typ = typs[i];
            try {
                return transform(val, typ, getProps);
            } catch (_) {}
        }
        return invalidValue(typs, val);
    }

    function transformEnum(cases: string[], val: any): any {
        if (cases.indexOf(val) !== -1) return val;
        return invalidValue(cases, val);
    }

    function transformArray(typ: any, val: any): any {
        // val must be an array with no invalid elements
        if (!Array.isArray(val)) return invalidValue("array", val);
        return val.map(el => transform(el, typ, getProps));
    }

    function transformDate(val: any): any {
        if (val === null) {
            return null;
        }
        const d = new Date(val);
        if (isNaN(d.valueOf())) {
            return invalidValue("Date", val);
        }
        return d;
    }

    function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
        if (val === null || typeof val !== "object" || Array.isArray(val)) {
            return invalidValue("object", val);
        }
        const result: any = {};
        Object.getOwnPropertyNames(props).forEach(key => {
            const prop = props[key];
            const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
            result[prop.key] = transform(v, prop.typ, getProps, prop.key);
        });
        Object.getOwnPropertyNames(val).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = transform(val[key], additional, getProps, key);
            }
        });
        return result;
    }

    if (typ === "any") return val;
    if (typ === null) {
        if (val === null) return val;
        return invalidValue(typ, val);
    }
    if (typ === false) return invalidValue(typ, val);
    while (typeof typ === "object" && typ.ref !== undefined) {
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ)) return transformEnum(typ, val);
    if (typeof typ === "object") {
        return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty("arrayItems")    ? transformArray(typ.arrayItems, val)
            : typ.hasOwnProperty("props")         ? transformObject(getProps(typ), typ.additional, val)
            : invalidValue(typ, val);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== "number") return transformDate(val);
    return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
    return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
    return transform(val, typ, jsToJSONProps);
}

function a(typ: any) {
    return { arrayItems: typ };
}

function u(...typs: any[]) {
    return { unionMembers: typs };
}

function o(props: any[], additional: any) {
    return { props, additional };
}

function m(additional: any) {
    return { props: [], additional };
}

function r(name: string) {
    return { ref: name };
}

const typeMap: any = {
    "View": o([
        { json: "id", js: "id", typ: "" },
        { json: "name", js: "name", typ: "" },
        { json: "type", js: "type", typ: "" },
        { json: "parent", js: "parent", typ: r("Parent") },
        { json: "grouping", js: "grouping", typ: r("Divide") },
        { json: "divide", js: "divide", typ: r("Divide") },
        { json: "sorting", js: "sorting", typ: r("Columns") },
        { json: "filters", js: "filters", typ: r("Filters") },
        { json: "columns", js: "columns", typ: r("Columns") },
        { json: "team_sidebar", js: "team_sidebar", typ: r("TeamSidebar") },
        { json: "settings", js: "settings", typ: r("Settings") },
    ], false),
    "Columns": o([
        { json: "fields", js: "fields", typ: a("any") },
    ], false),
    "Divide": o([
        { json: "field", js: "field", typ: u(null, "") },
        { json: "dir", js: "dir", typ: u(0, null) },
        { json: "collapsed", js: "collapsed", typ: a("any") },
        { json: "ignore", js: "ignore", typ: u(undefined, true) },
    ], false),
    "Filters": o([
        { json: "op", js: "op", typ: "" },
        { json: "fields", js: "fields", typ: a("any") },
        { json: "search", js: "search", typ: "" },
        { json: "show_closed", js: "show_closed", typ: true },
    ], false),
    "Parent": o([
        { json: "id", js: "id", typ: "" },
        { json: "type", js: "type", typ: 0 },
    ], false),
    "Settings": o([
        { json: "show_task_locations", js: "show_task_locations", typ: true },
        { json: "show_subtasks", js: "show_subtasks", typ: 0 },
        { json: "show_subtask_parent_names", js: "show_subtask_parent_names", typ: true },
        { json: "show_closed_subtasks", js: "show_closed_subtasks", typ: true },
        { json: "show_assignees", js: "show_assignees", typ: true },
        { json: "show_images", js: "show_images", typ: true },
        { json: "collapse_empty_columns", js: "collapse_empty_columns", typ: null },
        { json: "me_comments", js: "me_comments", typ: true },
        { json: "me_subtasks", js: "me_subtasks", typ: true },
        { json: "me_checklists", js: "me_checklists", typ: true },
    ], false),
    "TeamSidebar": o([
        { json: "assignees", js: "assignees", typ: a("any") },
        { json: "assigned_comments", js: "assigned_comments", typ: true },
        { json: "unassigned_tasks", js: "unassigned_tasks", typ: true },
    ], false),
};
