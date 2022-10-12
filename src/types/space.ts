// To parse this data:
//
//   import { Convert, Space } from "./file";
//
//   const space = Convert.toSpace(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface Space {
    id:                 string;
    name:               string;
    private:            boolean;
    statuses:           Status[];
    multiple_assignees: boolean;
    features:           Features;
}

export interface Features {
    due_dates:          DueDates;
    time_tracking:      Checklists;
    tags:               Checklists;
    time_estimates:     Checklists;
    checklists:         Checklists;
    custom_fields:      Checklists;
    remap_dependencies: Checklists;
    dependency_warning: Checklists;
    portfolios:         Checklists;
}

export interface Checklists {
    enabled: boolean;
}

export interface DueDates {
    enabled:               boolean;
    start_date:            boolean;
    remap_due_dates:       boolean;
    remap_closed_due_date: boolean;
}

export interface Status {
    status:     string;
    type:       string;
    orderindex: number;
    color:      string;
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
    public static toSpace(json: string): Space {
        return cast(JSON.parse(json), r("Space"));
    }

    public static spaceToJson(value: Space): string {
        return JSON.stringify(uncast(value, r("Space")), null, 2);
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
    "Space": o([
        { json: "id", js: "id", typ: "" },
        { json: "name", js: "name", typ: "" },
        { json: "private", js: "private", typ: true },
        { json: "statuses", js: "statuses", typ: a(r("Status")) },
        { json: "multiple_assignees", js: "multiple_assignees", typ: true },
        { json: "features", js: "features", typ: r("Features") },
    ], false),
    "Features": o([
        { json: "due_dates", js: "due_dates", typ: r("DueDates") },
        { json: "time_tracking", js: "time_tracking", typ: r("Checklists") },
        { json: "tags", js: "tags", typ: r("Checklists") },
        { json: "time_estimates", js: "time_estimates", typ: r("Checklists") },
        { json: "checklists", js: "checklists", typ: r("Checklists") },
        { json: "custom_fields", js: "custom_fields", typ: r("Checklists") },
        { json: "remap_dependencies", js: "remap_dependencies", typ: r("Checklists") },
        { json: "dependency_warning", js: "dependency_warning", typ: r("Checklists") },
        { json: "portfolios", js: "portfolios", typ: r("Checklists") },
    ], false),
    "Checklists": o([
        { json: "enabled", js: "enabled", typ: true },
    ], false),
    "DueDates": o([
        { json: "enabled", js: "enabled", typ: true },
        { json: "start_date", js: "start_date", typ: true },
        { json: "remap_due_dates", js: "remap_due_dates", typ: true },
        { json: "remap_closed_due_date", js: "remap_closed_due_date", typ: true },
    ], false),
    "Status": o([
        { json: "status", js: "status", typ: "" },
        { json: "type", js: "type", typ: "" },
        { json: "orderindex", js: "orderindex", typ: 0 },
        { json: "color", js: "color", typ: "" },
    ], false),
};
