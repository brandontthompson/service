import { authType, format, imethod, iservice, IO, iresult } from "../index";
import { print } from "./method.print";

const print2:imethod = {
    name: "print2",
    request: "GET",
    // protect: {
    //     type: authType.BEARER,
    //     fnc: oauth,
    // },
    args: [
        {
            name: "value",
            type: "string",
            format: format.PARAM,
        },
    ],
    fnc: ((str: string) : iresult => {
        let response:iresult = {
            error:false,
            code: 200,
            message:str,
        };

        return response;
    }),
}

const postPrint:imethod = {
    name: "print",
    request: "POST",
    alias: "",
    desc: "",
    args: [
        {
            name: "value",
            alias: "",
            desc: "",
            type: "string",
            format: format.JSON,
        },
    ],
    fnc: print.fnc,
}

export const test:iservice = {
    name: "testservice",
    method: [print, print2, postPrint],
    // interface: IO.WEB | IO.SOC,
    interface: IO.WEB,
}