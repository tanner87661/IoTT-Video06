[
    {
        "id": "ff1dcf99.9fcb5",
        "type": "function",
        "z": "ce0d3bcc.85e348",
        "name": "Request System Setup",
        "func": "function createJSON(fromData)\n{\n    var retStr = \"{\\\"From\\\":\\\"Ctrl\\\", \\\"Valid\\\":1, \\\"Data\\\":[\";\n    var xorCode = 0;\n    for (i = 0; i < fromData.length; i++)\n    {\n        var byteCode = parseInt(fromData[i]);\n        //if (byteCode < 0x10)\n        //  retStr = retStr + \"0x0\"\n        //else\n        //  retStr = retStr + \"0x\";\n        retStr = retStr + byteCode.toString() + \",\"\n        xorCode = xorCode ^ byteCode;\n    }\n    xorCode = xorCode ^ 0xFF;\n    retStr = retStr + xorCode.toString() + \"]}\";\n    return retStr;\n}\n\nif ((msg.payload == \"change\") && (msg.name == \"LocoNet Setup\"))\n{\n    var RequestSlot= [0xBB, 0x7F, 0x00];\n//    var ReadRouteALM = [0xEE, 0x10, 0x01, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];\n    msg = {payload : createJSON(RequestSlot)};\n    return msg;\n}",
        "outputs": 1,
        "noerr": 0,
        "x": 1147.8181915283203,
        "y": 1253.4545593261719,
        "wires": [
            [
                "d5bcd152.dfaae"
            ]
        ]
    },
    {
        "id": "7d282425.1c0ffc",
        "type": "debug",
        "z": "ce0d3bcc.85e348",
        "name": "",
        "active": false,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "payload",
        "x": 1401.9092178344727,
        "y": 1395.909218788147,
        "wires": []
    },
    {
        "id": "d5bcd152.dfaae",
        "type": "mqtt out",
        "z": "ce0d3bcc.85e348",
        "name": "",
        "topic": "lnIn",
        "qos": "1",
        "retain": "",
        "broker": "5bc7cc44.39f4b4",
        "x": 1355.8181915283203,
        "y": 1253.4545593261719,
        "wires": []
    },
    {
        "id": "46b123df.c1e84c",
        "type": "ui_ui_control",
        "z": "ce0d3bcc.85e348",
        "name": "",
        "x": 112.81823348999023,
        "y": 1252.7274017333984,
        "wires": [
            [
                "ff1dcf99.9fcb5"
            ]
        ]
    },
    {
        "id": "8f7c42bc.22e51",
        "type": "mqtt in",
        "z": "ce0d3bcc.85e348",
        "name": "",
        "topic": "lnIn",
        "qos": "1",
        "broker": "5bc7cc44.39f4b4",
        "x": 99.72727584838867,
        "y": 1388.0000381469727,
        "wires": [
            [
                "b3fbd0f4.4ed83"
            ]
        ]
    },
    {
        "id": "c8239100.37aac",
        "type": "function",
        "z": "ce0d3bcc.85e348",
        "name": "Store OpSwitches",
        "func": "function createJSON(fromData)\n{\n    var retStr = \"{\\\"From\\\":\\\"OpSwCtrl\\\", \\\"Valid\\\":1, \\\"Data\\\":[\";\n    var xorCode = 0;\n    for (i = 0; i < fromData.length; i++)\n    {\n        var byteCode = parseInt(fromData[i]);\n        //if (byteCode < 0x10)\n        //  retStr = retStr + \"0x0\"\n        //else\n        //  retStr = retStr + \"0x\";\n        retStr = retStr + byteCode.toString() + \",\"\n        xorCode = xorCode ^ byteCode;\n    }\n    xorCode = xorCode ^ 0xFF;\n    retStr = retStr + xorCode.toString() + \"]}\";\n    return retStr;\n}\n\nfunction getByteNr(swNr)\n{\n    var byteNr = Math.trunc(swNr/8) + 3;\n    if (byteNr > 6)\n      byteNr++;\n    return byteNr  \n}\n\nfunction getBitMask(swNr)\n{\n    return 0x01 << ((swNr % 8)-1)\n}\n\nfunction getOpSwVal(swNr)\n{\n    var opSwData = context.get(\"DCSOpSw\");\n    if (opSwData === undefined)\n        return null\n    else\n    {\n        var bitMask = getBitMask(swNr);\n        var byteNr = getByteNr(swNr);\n        if ((opSwData[byteNr] & bitMask) > 0)\n            return 1\n        else\n            return 0;\n    }\n}\n\nfunction setOpSwVal(swNr, swVal)\n{\n    var opSwData = context.get(\"DCSOpSw\");\n    if (opSwData === undefined)\n        return null\n    else\n    {\n        var bitMask = getBitMask(swNr);\n        if (bitMask == 0x80)\n            return false;\n        var byteNr = getByteNr(swNr);\n        if (swVal > 0)\n            opSwData[byteNr] = (opSwData[byteNr] | bitMask);\n        else\n            opSwData[byteNr] = (opSwData[byteNr] & ~bitMask);\n        context.set(\"DCSOpSw\", opSwData);\n        return true;\n    }\n}\n\nif (msg.topic == \"OpSwitch\")\n{\n    for (var i=0; i<msg.payload.SwNr.length; i++)\n    {\n        setOpSwVal(msg.payload.SwNr[i], msg.payload.Status[i])\n    }\n    var opSwData = context.get(\"DCSOpSw\");\n    //send update\n    msg = {payload : createJSON(opSwData)};\n    return msg\n}\n\nif (msg.topic == \"lnIn\")\n{\n    var res = msg.payload.Data.length;\n    var myOpCode = (parseInt(msg.payload.Data[0]) << 8) + parseInt(msg.payload.Data[1]);\n    switch(myOpCode)\n    {\n        case 0xE70E : //SL_RD_DATA\n            {\n                var slotNr = parseInt(msg.payload.Data[2]);\n                if (slotNr == 0x7F)  //OpSw Bits\n                {\n                    msg.payload.Data[0] = 0xEF; //WR_SL for sending\n                    msg.payload.Data[7] = 0x07; //Track Status Byte\n                    msg.payload.Data[11] = 0x70; //Net Priority\n                    msg.payload.Data[12] = 0x7F; //for writing\n                    msg.payload.Data.splice(13,1);\n                    context.set(\"DCSOpSw\", msg.payload.Data);\n                    return null;\n                }\n                break;\n            }\n        default: \n            {\n                break;\n            }\n    }\n    return null;\n}\n",
        "outputs": 1,
        "noerr": 0,
        "x": 1109.5455932617188,
        "y": 1383.9092197418213,
        "wires": [
            [
                "d5bcd152.dfaae",
                "7d282425.1c0ffc"
            ]
        ]
    },
    {
        "id": "b3fbd0f4.4ed83",
        "type": "json",
        "z": "ce0d3bcc.85e348",
        "name": "",
        "property": "payload",
        "action": "",
        "pretty": false,
        "x": 284.45454025268555,
        "y": 1388.0000715255737,
        "wires": [
            [
                "c8239100.37aac",
                "11fcaf47.491ed1"
            ]
        ]
    },
    {
        "id": "bf68d659.d87338",
        "type": "ui_switch",
        "z": "ce0d3bcc.85e348",
        "name": "",
        "label": "OpSw27 - Bushby Bit",
        "group": "b81002d.aa397",
        "order": 3,
        "width": 0,
        "height": 0,
        "passthru": false,
        "decouple": "true",
        "topic": "OpSwitch",
        "style": "",
        "onvalue": "{\"SwNr\":[27],\"Status\":[1]}",
        "onvalueType": "json",
        "onicon": "",
        "oncolor": "",
        "offvalue": "{\"SwNr\":[27],\"Status\":[0]}",
        "offvalueType": "json",
        "officon": "",
        "offcolor": "",
        "x": 664.7273101806641,
        "y": 1523.1820087432861,
        "wires": [
            [
                "c8239100.37aac"
            ]
        ]
    },
    {
        "id": "c69bf51c.3d5018",
        "type": "ui_dropdown",
        "z": "ce0d3bcc.85e348",
        "name": "Speed Steps",
        "label": "Speed Step Settings",
        "place": "Select option",
        "group": "b81002d.aa397",
        "order": 1,
        "width": 0,
        "height": 0,
        "passthru": false,
        "options": [
            {
                "label": "128 Steps",
                "value": "{\"SwNr\":[21,22,23],\"Status\":[0,0,0]}",
                "type": "str"
            },
            {
                "label": "14 Steps",
                "value": "{\"SwNr\":[21,22,23],\"Status\":[0,0,1]}",
                "type": "str"
            },
            {
                "label": "28 Steps",
                "value": "{\"SwNr\":[21,22,23],\"Status\":[0,1,0]}",
                "type": "str"
            },
            {
                "label": "Motorola",
                "value": "{\"SwNr\":[21,22,23],\"Status\":[0,1,1]}",
                "type": "str"
            },
            {
                "label": "128 Step FX",
                "value": "{\"SwNr\":[21,22,23],\"Status\":[1,0,0]}",
                "type": "str"
            },
            {
                "label": "28 Step FX",
                "value": "{\"SwNr\":[21,22,23],\"Status\":[1,0,1]}",
                "type": "str"
            }
        ],
        "payload": "",
        "topic": "OpSwitch",
        "x": 635.8907623291016,
        "y": 1572.0350408554077,
        "wires": [
            [
                "4955d683.72e128"
            ]
        ]
    },
    {
        "id": "5ae7b340.bb861c",
        "type": "ui_switch",
        "z": "ce0d3bcc.85e348",
        "name": "",
        "label": "OpSw26 - Enbale Routes",
        "group": "b81002d.aa397",
        "order": 2,
        "width": 0,
        "height": 0,
        "passthru": false,
        "decouple": "true",
        "topic": "OpSwitch",
        "style": "",
        "onvalue": "{\"SwNr\":[26],\"Status\":[1]}",
        "onvalueType": "json",
        "onicon": "",
        "oncolor": "",
        "offvalue": "{\"SwNr\":[26],\"Status\":[0]}",
        "offvalueType": "json",
        "officon": "",
        "offcolor": "",
        "x": 675.1976470947266,
        "y": 1473.292685508728,
        "wires": [
            [
                "c8239100.37aac"
            ]
        ]
    },
    {
        "id": "11fcaf47.491ed1",
        "type": "function",
        "z": "ce0d3bcc.85e348",
        "name": "Button Updater",
        "func": "function getByteNr(swNr)\n{\n    var byteNr = Math.trunc(swNr/8) + 3;\n    if (byteNr > 6)\n      byteNr++;\n    return byteNr  \n}\n\nfunction getBitMask(swNr)\n{\n    return 0x01 << ((swNr % 8)-1)\n}\n\nfunction getOpSwVal(swNr)\n{\n    var opSwData = context.get(\"DCSOpSw\");\n    if (opSwData === undefined)\n        return null\n    else\n    {\n        var bitMask = getBitMask(swNr);\n        var byteNr = getByteNr(swNr);\n        if ((opSwData[byteNr] & bitMask) > 0)\n            return 1\n        else\n            return 0;\n    }\n}\n\nif (msg.topic == \"lnIn\")\n{\n    var res = msg.payload.Data.length;\n    var myOpCode = (parseInt(msg.payload.Data[0]) << 8) + parseInt(msg.payload.Data[1]);\n    switch(myOpCode)\n    {\n        case 0xE70E, 0xEF0E : //SL_RD_DATA, WR_SL_DATA\n            {\n                var slotNr = parseInt(msg.payload.Data[2]);\n                if (slotNr == 0x7F)  //OpSw Bits\n                {\n                    context.set(\"DCSOpSw\", msg.payload.Data);\n                    var OpSw26 = { payload:{\"SwNr\":[26],\"Status\":[getOpSwVal(26)]}}\n                    var OpSw27 = { payload:{\"SwNr\":[27],\"Status\":[getOpSwVal(27)]}}\n                    var OpSw41 = { payload:{\"SwNr\":[41],\"Status\":[getOpSwVal(41)]}}\n                    var OpSw2123 = {payload: {\"SwNr\":[21,22,23],\"Status\":[getOpSwVal(21),getOpSwVal(22),getOpSwVal(23)]}}\n                    return [OpSw26, OpSw27, OpSw2123, OpSw41];\n                }\n                break;\n            }\n        default: \n            {\n                break;\n            }\n    }\n    return null;\n}\n",
        "outputs": 4,
        "noerr": 0,
        "x": 222.43893432617188,
        "y": 1564.2224159240723,
        "wires": [
            [
                "5ae7b340.bb861c"
            ],
            [
                "bf68d659.d87338"
            ],
            [
                "6aa3e175.368c2"
            ],
            [
                "24f52b5a.155694"
            ]
        ]
    },
    {
        "id": "4955d683.72e128",
        "type": "json",
        "z": "ce0d3bcc.85e348",
        "name": "",
        "property": "payload",
        "action": "",
        "pretty": false,
        "x": 834.0000228881836,
        "y": 1571.0000467300415,
        "wires": [
            [
                "c8239100.37aac"
            ]
        ]
    },
    {
        "id": "6aa3e175.368c2",
        "type": "json",
        "z": "ce0d3bcc.85e348",
        "name": "",
        "property": "payload",
        "action": "",
        "pretty": false,
        "x": 450.0000114440918,
        "y": 1572.0000457763672,
        "wires": [
            [
                "c69bf51c.3d5018"
            ]
        ]
    },
    {
        "id": "24f52b5a.155694",
        "type": "ui_switch",
        "z": "ce0d3bcc.85e348",
        "name": "",
        "label": "OpSw41 - Debug Beep",
        "group": "b81002d.aa397",
        "order": 4,
        "width": 0,
        "height": 0,
        "passthru": false,
        "decouple": "true",
        "topic": "OpSwitch",
        "style": "",
        "onvalue": "{\"SwNr\":[41],\"Status\":[1]}",
        "onvalueType": "json",
        "onicon": "",
        "oncolor": "",
        "offvalue": "{\"SwNr\":[41],\"Status\":[0]}",
        "offvalueType": "json",
        "officon": "",
        "offcolor": "",
        "x": 675,
        "y": 1633.3333740234375,
        "wires": [
            [
                "c8239100.37aac"
            ]
        ]
    },
    {
        "id": "20bdc8fc.040f38",
        "type": "ui_template",
        "z": "ce0d3bcc.85e348",
        "group": "b81002d.aa397",
        "name": "GP_ON Button",
        "order": 4,
        "width": "0",
        "height": "0",
        "format": "<md-button class=\"vibrate filled touched bigfont rounded\" style=\"background-color:#FFFFFF\" ng-click=\"send({payload: {&quot;From&quot;:&quot;OpSwCtrl&quot;, &quot;Valid&quot;:1, &quot;Data&quot;:[131,124]} })\"> \n<svg  width=\"260px\" height=\"90px\" version=\"1.1\" viewBox=\"0 0 800 200\">\n <g id=\"Button_Long\">\n  \n  <rect fill=\"#FFFFFF\" width=\"800\" height=\"200\"/>\n  <g ng-style=\"{fill: 'lime'}\">\n    <rect width=\"800\" height=\"200\" rx=\"80\" ry=\"80\"/>\n  </g>\n  \n  <g ng-style=\"{fill: 'lime'}\">\n    <rect x=\"11\" y=\"10\" width=\"778\" height=\"180\" rx=\"90\" ry=\"90\"/>\n  </g>\n  <g ng-style=\"{fill: 'black'}\">\n      \n    <text x=\"400\" y=\"125\" style=\"text-anchor:middle\"  font-weight=\"bold\" font-size=\"80\" font-family=\"Arial\">{{\" GO \"}} </text>\n    </g>\n  </g>\n</svg>\n</md-button>\n",
        "storeOutMessages": false,
        "fwdInMessages": false,
        "templateScope": "local",
        "x": 644.0000152587891,
        "y": 1431.3333721160889,
        "wires": [
            [
                "633060cf.5acff"
            ]
        ]
    },
    {
        "id": "633060cf.5acff",
        "type": "json",
        "z": "ce0d3bcc.85e348",
        "name": "",
        "property": "payload",
        "action": "",
        "pretty": false,
        "x": 1075.0000267028809,
        "y": 1318.000039100647,
        "wires": [
            [
                "d5bcd152.dfaae"
            ]
        ]
    },
    {
        "id": "5bc7cc44.39f4b4",
        "type": "mqtt-broker",
        "z": "",
        "name": "",
        "broker": "192.168.87.52",
        "port": "1883",
        "clientid": "",
        "usetls": false,
        "compatmode": true,
        "keepalive": "60",
        "cleansession": true,
        "birthTopic": "",
        "birthQos": "0",
        "birthRetain": "false",
        "birthPayload": "",
        "willTopic": "",
        "willQos": "0",
        "willPayload": ""
    },
    {
        "id": "b81002d.aa397",
        "type": "ui_group",
        "z": "",
        "name": "DCS OpSw Settings",
        "tab": "fdba4392.641a",
        "order": 2,
        "disp": true,
        "width": "6",
        "collapse": false
    },
    {
        "id": "fdba4392.641a",
        "type": "ui_tab",
        "z": "",
        "name": "LocoNet Setup",
        "icon": "dashboard",
        "order": 3
    }
]
