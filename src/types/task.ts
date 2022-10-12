// To parse this data:
//
//   import { Convert, Task } from "./file";
//
//   const task = Convert.toTask(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface Task {
    id:            string;
    custom_id:     string;
    name:          string;
    text_content:  string;
    description:   string;
    status:        Status;
    orderindex:    string;
    date_created:  string;
    date_updated:  string;
    date_closed:   string;
    creator:       Creator;
    assignees:     string[];
    checklists:    string[];
    tags:          string[];
    parent:        string;
    priority:      string;
    due_date:      string;
    start_date:    string;
    time_estimate: string;
    time_spent:    string;
    custom_fields: CustomField[];
    list:          Folder;
    folder:        Folder;
    space:         Folder;
    url:           string;
}

export interface Creator {
    id:             number;
    username:       string;
    color:          string;
    profilePicture: string;
}

export interface CustomField {
    id:               string;
    name:             string;
    type:             string;
    type_config:      TypeConfig;
    date_created:     string;
    hide_from_guests: boolean;
    value:            Value;
    required:         boolean;
}

export interface TypeConfig {
}

export interface Value {
    id:             number;
    username:       string;
    email:          string;
    color:          string;
    initials:       string;
    profilePicture: null;
}

export interface Folder {
    id: string;
}

export interface Status {
    status:     string;
    color:      string;
    orderindex: number;
    type:       string;
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
    public static toTask(json: string): Task {
        return cast(JSON.parse(json), r("Task"));
    }

    public static taskToJson(value: Task): string {
        return JSON.stringify(uncast(value, r("Task")), null, 2);
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
    "Task": o([
        { json: "id", js: "id", typ: "" },
        { json: "custom_id", js: "custom_id", typ: "" },
        { json: "name", js: "name", typ: "" },
        { json: "text_content", js: "text_content", typ: "" },
        { json: "description", js: "description", typ: "" },
        { json: "status", js: "status", typ: r("Status") },
        { json: "orderindex", js: "orderindex", typ: "" },
        { json: "date_created", js: "date_created", typ: "" },
        { json: "date_updated", js: "date_updated", typ: "" },
        { json: "date_closed", js: "date_closed", typ: "" },
        { json: "creator", js: "creator", typ: r("Creator") },
        { json: "assignees", js: "assignees", typ: a("") },
        { json: "checklists", js: "checklists", typ: a("") },
        { json: "tags", js: "tags", typ: a("") },
        { json: "parent", js: "parent", typ: "" },
        { json: "priority", js: "priority", typ: "" },
        { json: "due_date", js: "due_date", typ: "" },
        { json: "start_date", js: "start_date", typ: "" },
        { json: "time_estimate", js: "time_estimate", typ: "" },
        { json: "time_spent", js: "time_spent", typ: "" },
        { json: "custom_fields", js: "custom_fields", typ: a(r("CustomField")) },
        { json: "list", js: "list", typ: r("Folder") },
        { json: "folder", js: "folder", typ: r("Folder") },
        { json: "space", js: "space", typ: r("Folder") },
        { json: "url", js: "url", typ: "" },
    ], false),
    "Creator": o([
        { json: "id", js: "id", typ: 0 },
        { json: "username", js: "username", typ: "" },
        { json: "color", js: "color", typ: "" },
        { json: "profilePicture", js: "profilePicture", typ: "" },
    ], false),
    "CustomField": o([
        { json: "id", js: "id", typ: "" },
        { json: "name", js: "name", typ: "" },
        { json: "type", js: "type", typ: "" },
        { json: "type_config", js: "type_config", typ: r("TypeConfig") },
        { json: "date_created", js: "date_created", typ: "" },
        { json: "hide_from_guests", js: "hide_from_guests", typ: true },
        { json: "value", js: "value", typ: r("Value") },
        { json: "required", js: "required", typ: true },
    ], false),
    "TypeConfig": o([
    ], false),
    "Value": o([
        { json: "id", js: "id", typ: 0 },
        { json: "username", js: "username", typ: "" },
        { json: "email", js: "email", typ: "" },
        { json: "color", js: "color", typ: "" },
        { json: "initials", js: "initials", typ: "" },
        { json: "profilePicture", js: "profilePicture", typ: null },
    ], false),
    "Folder": o([
        { json: "id", js: "id", typ: "" },
    ], false),
    "Status": o([
        { json: "status", js: "status", typ: "" },
        { json: "color", js: "color", typ: "" },
        { json: "orderindex", js: "orderindex", typ: 0 },
        { json: "type", js: "type", typ: "" },
    ], false),
};
