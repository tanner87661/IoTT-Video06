[
    {
        "id": "7fa9c036.a16df",
        "type": "ui_dropdown",
        "z": "ce0d3bcc.85e348",
        "name": "SM ProgMode",
        "label": "",
        "place": "Select Programming Mode",
        "group": "ce90176a.b864b8",
        "order": 1,
        "width": 0,
        "height": 0,
        "passthru": true,
        "options": [
            {
                "label": "Service Mode Paged",
                "value": 32,
                "type": "num"
            },
            {
                "label": "Service Mode Direct",
                "value": 40,
                "type": "num"
            }
        ],
        "payload": "",
        "topic": "ProgMode",
        "x": 131.79258346557617,
        "y": 689.90625,
        "wires": [
            [
                "ad0156be.00d728"
            ]
        ]
    },
    {
        "id": "984c4d6b.0d0be",
        "type": "ui_numeric",
        "z": "ce0d3bcc.85e348",
        "name": "Prog Track CV #",
        "label": "CV #",
        "group": "ce90176a.b864b8",
        "order": 2,
        "width": 0,
        "height": 0,
        "passthru": true,
        "topic": "CVNr",
        "format": "{{value}}",
        "min": "1",
        "max": "1024",
        "step": 1,
        "x": 130.78121948242188,
        "y": 727.04541015625,
        "wires": [
            [
                "ad0156be.00d728"
            ]
        ]
    },
    {
        "id": "9fc28669.943568",
        "type": "ui_text",
        "z": "ce0d3bcc.85e348",
        "group": "ce90176a.b864b8",
        "order": 4,
        "width": 0,
        "height": 0,
        "name": "Service Mode Status",
        "label": "Status",
        "format": "{{msg.payload}}",
        "layout": "row-left",
        "x": 731.7925720214844,
        "y": 1028.9686279296875,
        "wires": []
    },
    {
        "id": "e7d7aaf0.fac6b8",
        "type": "ui_numeric",
        "z": "ce0d3bcc.85e348",
        "name": "Service Mode CV Value",
        "label": "CV Value",
        "group": "ce90176a.b864b8",
        "order": 3,
        "width": 0,
        "height": 0,
        "passthru": true,
        "topic": "CVVal",
        "format": "{{value}}",
        "min": 0,
        "max": "255",
        "step": 1,
        "x": 741.01416015625,
        "y": 1111.005615234375,
        "wires": [
            [
                "ad0156be.00d728"
            ]
        ]
    },
    {
        "id": "229af4cf.6db7fc",
        "type": "mqtt out",
        "z": "ce0d3bcc.85e348",
        "name": "lnBC",
        "topic": "lnIn",
        "qos": "1",
        "retain": "",
        "broker": "5bc7cc44.39f4b4",
        "x": 1248.0142211914062,
        "y": 846.1875610351562,
        "wires": []
    },
    {
        "id": "61f4ea13.fe73b4",
        "type": "mqtt in",
        "z": "ce0d3bcc.85e348",
        "name": "",
        "topic": "lnIn",
        "qos": "1",
        "broker": "5bc7cc44.39f4b4",
        "x": 119,
        "y": 1088,
        "wires": [
            [
                "129321c.f2a00de"
            ]
        ]
    },
    {
        "id": "5a84bb77.c2e8c4",
        "type": "function",
        "z": "ce0d3bcc.85e348",
        "name": "Response Processor",
        "func": "var dispMsgSM = null;\nvar valMsgSM = null;\nvar dispMsgOM = null;\nvar valMsgOM = null;\nif ((msg.payload.Valid == 1) && (msg.payload.From == \"LocoNetGateway\"))\n{\n    var res = msg.payload.Data.length;\n    var myNumber = parseInt(msg.payload.Data[0]);\n    switch(myNumber)\n    {\n        case 0xB4 : //LACK\n            {\n                if (context.get(\"AwaitLACK\") > 0)\n                {\n                    var newMsg;\n                    var lackResult = parseInt(msg.payload.Data[2]);\n                    switch (lackResult)\n                    {\n                        case 0x00: newMsg = {payload : \"Programmer busy\"}; break;\n                        case 0x01: newMsg = {payload : \"Working. Please wait...\"}; break;\n                        case 0x40: newMsg = {payload : \"Task completed, no E7 Reply\"}; break;\n                        case 0x7F: newMsg = {payload : \"not implemented\"}; break;\n                        default  : newMsg = {payload : \"unknown Status\"}; break; \n                    }\n                    if (context.get(\"AwaitLACK\") == 1)\n                        dispMsgSM = newMsg;\n                    else\n                        dispMsgOM = newMsg;\n                    context.set(\"AwaitLACK\", 0);\n                }\n                break;\n            }\n        case 0xE7 : //SL_RD_DATA\n            {\n                if (parseInt(msg.payload.Data[1]) == 0x0E)\n                {\n                    var valMsg;\n                    var dispMsg;\n                    var slotNr = parseInt(msg.payload.Data[2]);\n                    if (slotNr == 0x7C)\n                    {\n                        var slrdPSTAT = parseInt(msg.payload.Data[4]);\n                        var retString = \"\";\n                        if (slrdPSTAT === 0)\n                        {\n                            retString = \"Task Successfull\"\n                            var CVValue = (parseInt(msg.payload.Data[10]) & 0x7F) + ((parseInt(msg.payload.Data[8]) & 0x02) << 6);\n                            valMsg = {payload : CVValue.toString()};\n                        }\n                        else\n                        {\n                            if ((slrdPSTAT & 0x01) > 0)    \n                                retString += \"Prog Track Empty \";\n                            if ((slrdPSTAT & 0x02) > 0)    \n                                retString += \"No ACK from Decoder \";\n                            if ((slrdPSTAT & 0x04) > 0)    \n                                retString += \"No Read Compare ACK \";\n                            if ((slrdPSTAT & 0x08) > 0)    \n                                retString += \"Task Aborted by User\";\n                        }\n                        dispMsg = {payload : retString};\n                        if ((msg.payload.Data[3] & 0x04) === 0)\n                        {\n                            dispMsgSM = dispMsg;\n                            valMsgSM = valMsg;\n                        }\n                        else\n                        {\n                            dispMsgOM = dispMsg;\n                            valMsgOM = valMsg;\n                        }\n                    }\n                    context.set(\"AwaitLACK\", 0);\n                }\n                break;\n            }\n\n        case 0xEF : //SL_WR_DATA\n            {\n                if (parseInt(msg.payload.Data[1]) == 0x0E)\n                {\n                    var slotNr = parseInt(msg.payload.Data[2]);\n                    if (slotNr == 0x7C)\n                    {\n                        if ((msg.payload.Data[3] & 0x04) === 0)\n                        {\n                            context.set(\"AwaitLACK\", 1);\n                            dispMsgSM = {payload : \"Start Task \" + msg.payload.Data[3]};\n                        }\n                        else\n                        {\n                            context.set(\"AwaitLACK\", 2);\n                            dispMsgOM = {payload : \"Start Task \" + msg.payload.Data[3]};\n                        }\n                    }\n                }\n                break;\n            }\n        default: \n            {\n                context.set(\"AwaitLACK\", 0);\n                break;\n            }\n    }\n}\nreturn [dispMsgSM, dispMsgOM, valMsgSM, valMsgOM];\n",
        "outputs": 4,
        "noerr": 0,
        "x": 451,
        "y": 1089,
        "wires": [
            [
                "9fc28669.943568"
            ],
            [
                "c2216f07.c6535"
            ],
            [
                "e7d7aaf0.fac6b8"
            ],
            [
                "1c1ce3b7.6d93ec"
            ]
        ]
    },
    {
        "id": "ad0156be.00d728",
        "type": "function",
        "z": "ce0d3bcc.85e348",
        "name": "OpCode SM Generator",
        "func": "if (msg.topic == \"ProgMode\")\n{\n    context.set(\"ProgMode\", msg.payload)\n    return null\n}\nif (msg.topic == \"CVNr\")\n{\n    context.set(\"CVNr\", msg.payload)\n    return null\n}\nif (msg.topic == \"CVVal\")\n{\n    context.set(\"CVVal\", msg.payload)\n    return null\n}\n\nfunction createJSON(fromData)\n{\n    var retStr = \"{\\\"From\\\":\\\"SM Prog\\\", \\\"Valid\\\":1, \\\"Data\\\":[\";\n    var xorCode = 0;\n    for (i = 0; i < fromData.length; i++)\n    {\n        var byteCode = parseInt(fromData[i]);\n        retStr = retStr + byteCode.toString() + \",\"\n        xorCode = xorCode ^ byteCode;\n    }\n    xorCode = xorCode ^ 0xFF;\n    retStr = retStr + xorCode.toString() + \"]}\";\n    return retStr;\n}\n\nvar data= [0xEF,0x0E,0x7C,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00];\n\n//data[3] = parseInt(flow.get(\"ProgModeSM\")) + parseInt(msg.payload);\n\nvar ProgMode = context.get(\"ProgMode\");\nif (ProgMode === undefined)\n    ProgMode = 32; //Service Mode Paged\ndata[3] = ProgMode | (msg.payload << 6);\n\nvar CVAddr = context.get(\"CVNr\");\nif (CVAddr === undefined) \n    return null;\nCVAddr = CVAddr - 1;\nvar CVValue = context.get(\"CVVal\");\nif (CVValue === undefined) \n    return null;\n//data[7] = 0x07; //Track Status can be 0\ndata[8] = ((CVValue & 0x80) >> 6) + ((CVAddr & 0x0080) >> 7) + ((CVAddr & 0x0300) >> 4);\ndata[9] = (CVAddr & 0x007F);\ndata[10] = (CVValue & 0x7F);\nmsg = {payload : createJSON(data)};\n\nreturn msg",
        "outputs": 1,
        "noerr": 0,
        "x": 953,
        "y": 741.0000610351562,
        "wires": [
            [
                "e7c53460.a25168",
                "229af4cf.6db7fc"
            ]
        ]
    },
    {
        "id": "129321c.f2a00de",
        "type": "json",
        "z": "ce0d3bcc.85e348",
        "name": "",
        "property": "payload",
        "action": "obj",
        "pretty": false,
        "x": 260.00000381469727,
        "y": 1087.6667013168335,
        "wires": [
            [
                "5a84bb77.c2e8c4",
                "a0593b0f.d0c828"
            ]
        ]
    },
    {
        "id": "e7c53460.a25168",
        "type": "debug",
        "z": "ce0d3bcc.85e348",
        "name": "",
        "active": false,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "payload",
        "x": 1269,
        "y": 802,
        "wires": []
    },
    {
        "id": "c243a74d.328de8",
        "type": "ui_dropdown",
        "z": "ce0d3bcc.85e348",
        "name": "OpsProgMode",
        "label": "",
        "place": "Select Programming Mode",
        "group": "72376ecd.b3567",
        "order": 1,
        "width": 0,
        "height": 0,
        "passthru": true,
        "options": [
            {
                "label": "Operations Mode No Feedback",
                "value": 36,
                "type": "num"
            },
            {
                "label": "Operations Mode with Feedback",
                "value": 44,
                "type": "num"
            }
        ],
        "payload": "",
        "topic": "ProgMode",
        "x": 128.00000381469727,
        "y": 863,
        "wires": [
            [
                "c2015392.7b9ad"
            ]
        ]
    },
    {
        "id": "c2216f07.c6535",
        "type": "ui_text",
        "z": "ce0d3bcc.85e348",
        "group": "72376ecd.b3567",
        "order": 5,
        "width": 0,
        "height": 0,
        "name": "Operations Mode Status",
        "label": "Status",
        "format": "{{msg.payload}}",
        "layout": "row-left",
        "x": 740.9999694824219,
        "y": 1069,
        "wires": []
    },
    {
        "id": "1c1ce3b7.6d93ec",
        "type": "ui_numeric",
        "z": "ce0d3bcc.85e348",
        "name": "Ops Mode CV Value",
        "label": "CV Value",
        "group": "72376ecd.b3567",
        "order": 4,
        "width": "0",
        "height": "0",
        "passthru": true,
        "topic": "CVVal",
        "format": "{{value}}",
        "min": 0,
        "max": "255",
        "step": 1,
        "x": 731.9999694824219,
        "y": 1151,
        "wires": [
            [
                "c2015392.7b9ad"
            ]
        ]
    },
    {
        "id": "d907b557.6b7b08",
        "type": "ui_numeric",
        "z": "ce0d3bcc.85e348",
        "name": "Main Line CV #",
        "label": "CV #",
        "group": "72376ecd.b3567",
        "order": 3,
        "width": "0",
        "height": "0",
        "passthru": true,
        "topic": "CVNr",
        "format": "{{value}}",
        "min": "1",
        "max": "1024",
        "step": 1,
        "x": 125,
        "y": 939,
        "wires": [
            [
                "c2015392.7b9ad"
            ]
        ]
    },
    {
        "id": "9d2823cf.88e1d",
        "type": "ui_numeric",
        "z": "ce0d3bcc.85e348",
        "name": "DecoderAddress",
        "label": "Decoder Address",
        "group": "72376ecd.b3567",
        "order": 2,
        "width": 0,
        "height": 0,
        "passthru": true,
        "topic": "DecAddr",
        "format": "{{value}}",
        "min": "1",
        "max": "9983",
        "step": 1,
        "x": 136,
        "y": 901,
        "wires": [
            [
                "c2015392.7b9ad"
            ]
        ]
    },
    {
        "id": "c2015392.7b9ad",
        "type": "function",
        "z": "ce0d3bcc.85e348",
        "name": "OpCode ML Generator",
        "func": "if (msg.topic == \"ProgMode\")\n{\n    context.set(\"ProgMode\", msg.payload)\n    return null\n}\nif (msg.topic == \"CVNr\")\n{\n    context.set(\"CVNr\", msg.payload)\n    return null\n}\nif (msg.topic == \"CVVal\")\n{\n    context.set(\"CVVal\", msg.payload)\n    return null\n}\nif (msg.topic == \"DecAddr\")\n{\n    context.set(\"DecAddr\", msg.payload)\n    return null\n}\n\n\nfunction createJSON(fromData)\n{\n    var retStr = \"{\\\"From\\\":\\\"ML Prog\\\", \\\"Valid\\\":1,\\\"Data\\\":[\";\n    var xorCode = 0;\n    for (i = 0; i < fromData.length; i++)\n    {\n        var byteCode = parseInt(fromData[i]);\n        retStr = retStr + byteCode.toString() + \",\"\n        xorCode = xorCode ^ byteCode;\n    }\n    xorCode = xorCode ^ 0xFF;\n    retStr = retStr + xorCode.toString() + \"]}\";\n    return retStr;\n}\n\nvar data= [0xEF,0x0E,0x7C,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00];\n\nvar ProgMode = context.get(\"ProgMode\");\nif (ProgMode === undefined)\n    ProgMode = 36; //Ops Mode No Feedback\ndata[3] = ProgMode | (msg.payload << 6);\n\nvar CVAddr = context.get(\"CVNr\");\nif (CVAddr === undefined) \n    return null;\nCVAddr = CVAddr - 1;\nvar CVValue = context.get(\"CVVal\");\nif (CVValue === undefined) \n    return null;\nvar DecAddr = context.get(\"DecAddr\");\nif (DecAddr === undefined) \n    return null;\n\n\n//[7] = 0x07; //Track Status can be 0\ndata[5] = ((DecAddr & 0x3F80) >> 7); //HOPSA\ndata[6] = (DecAddr & 0x7F); //LOPSA\ndata[8] = ((CVValue & 0x80) >> 6) + ((CVAddr & 0x0080) >> 7) + ((CVAddr & 0x0300) >> 4);\ndata[9] = (CVAddr & 0x007F);\ndata[10] = (CVValue & 0x7F);\nmsg = {payload : createJSON(data)};\n\nreturn msg",
        "outputs": 1,
        "noerr": 0,
        "x": 1013,
        "y": 891,
        "wires": [
            [
                "229af4cf.6db7fc",
                "e7c53460.a25168"
            ]
        ]
    },
    {
        "id": "549399be.152ee8",
        "type": "ui_template",
        "z": "ce0d3bcc.85e348",
        "group": "ce90176a.b864b8",
        "name": "SM Read",
        "order": 4,
        "width": "3",
        "height": "2",
        "format": "<md-button class=\"vibrate filled touched bigfont rounded\" style=\"background-color:#FFFFFF\" ng-click=\"send({payload: 0})\" > \n<svg  width=\"100px\" height=\"60px\" version=\"1.1\" viewBox=\"0 0 800 200\">\n <g id=\"Button_Long_TH\">\n  \n  <rect fill=\"#FFFFFF\" width=\"800\" height=\"200\"/>\n  <g ng-style=\"{fill: 'lime'}\">\n    <rect width=\"800\" height=\"200\" rx=\"80\" ry=\"80\"/>\n  </g>\n  \n  <g ng-style=\"{fill: 'lime'}\">\n    <rect x=\"11\" y=\"10\" width=\"778\" height=\"180\" rx=\"90\" ry=\"90\"/>\n  </g>\n  <g ng-style=\"{fill:'black'}\">\n      \n    <text x=\"400\" y=\"125\" style=\"text-anchor:middle\"  font-weight=\"bold\" font-size=\"80\" font-family=\"Arial\">{{\"READ\"}} </text>\n    </g>\n  </g>\n</svg>\n\n\n</md-button>\n",
        "storeOutMessages": false,
        "fwdInMessages": false,
        "templateScope": "local",
        "x": 109.9305419921875,
        "y": 762,
        "wires": [
            [
                "ad0156be.00d728"
            ]
        ]
    },
    {
        "id": "f8988f16.b0cbd",
        "type": "ui_template",
        "z": "ce0d3bcc.85e348",
        "group": "ce90176a.b864b8",
        "name": "SM Write",
        "order": 5,
        "width": "3",
        "height": "2",
        "format": "<md-button class=\"vibrate filled touched bigfont rounded\" style=\"background-color:#FFFFFF\" ng-click=\"send({payload: 1})\" > \n<svg  width=\"100px\" height=\"60px\" version=\"1.1\" viewBox=\"0 0 800 200\">\n <g id=\"Button_Long_CL\">\n  \n  <rect fill=\"#FFFFFF\" width=\"800\" height=\"200\"/>\n  <g ng-style=\"{fill: 'red'}\">\n    <rect width=\"800\" height=\"200\" rx=\"80\" ry=\"80\"/>\n  </g>\n  \n  <g ng-style=\"{fill: 'red'}\">\n    <rect x=\"11\" y=\"10\" width=\"778\" height=\"180\" rx=\"90\" ry=\"90\"/>\n  </g>\n  <g ng-style=\"{fill:'white'}\">\n      \n    <text x=\"400\" y=\"125\" style=\"text-anchor:middle\"  font-weight=\"bold\" font-size=\"80\" font-family=\"Arial\">{{\"WRITE\"}} </text>\n    </g>\n  </g>\n</svg>\n\n\n</md-button>\n",
        "storeOutMessages": false,
        "fwdInMessages": false,
        "templateScope": "local",
        "x": 107,
        "y": 798.4375610351562,
        "wires": [
            [
                "ad0156be.00d728"
            ]
        ]
    },
    {
        "id": "7cea6e26.7635f",
        "type": "ui_template",
        "z": "ce0d3bcc.85e348",
        "group": "72376ecd.b3567",
        "name": "ML Read",
        "order": 6,
        "width": "3",
        "height": "2",
        "format": "<md-button class=\"vibrate filled touched bigfont rounded\" style=\"background-color:#FFFFFF\" ng-click=\"send({payload: 0})\" > \n<svg  width=\"100px\" height=\"60px\" version=\"1.1\" viewBox=\"0 0 800 200\">\n <g id=\"Button_Long_TH\">\n  \n  <rect fill=\"#FFFFFF\" width=\"800\" height=\"200\"/>\n  <g ng-style=\"{fill: 'lime'}\">\n    <rect width=\"800\" height=\"200\" rx=\"80\" ry=\"80\"/>\n  </g>\n  \n  <g ng-style=\"{fill: 'lime'}\">\n    <rect x=\"11\" y=\"10\" width=\"778\" height=\"180\" rx=\"90\" ry=\"90\"/>\n  </g>\n  <g ng-style=\"{fill:'black'}\">\n      \n    <text x=\"400\" y=\"125\" style=\"text-anchor:middle\"  font-weight=\"bold\" font-size=\"80\" font-family=\"Arial\">{{\"READ\"}} </text>\n    </g>\n  </g>\n</svg>\n\n\n</md-button>\n",
        "storeOutMessages": false,
        "fwdInMessages": false,
        "templateScope": "local",
        "x": 107,
        "y": 972,
        "wires": [
            [
                "c2015392.7b9ad"
            ]
        ]
    },
    {
        "id": "e7510d7d.7594",
        "type": "ui_template",
        "z": "ce0d3bcc.85e348",
        "group": "72376ecd.b3567",
        "name": "ML Write",
        "order": 7,
        "width": "3",
        "height": "2",
        "format": "<md-button class=\"vibrate filled touched bigfont rounded\" style=\"background-color:#FFFFFF\" ng-click=\"send({payload: 1})\" > \n<svg  width=\"100px\" height=\"60px\" version=\"1.1\" viewBox=\"0 0 800 200\">\n <g id=\"Button_Long_CL\">\n  \n  <rect fill=\"#FFFFFF\" width=\"800\" height=\"200\"/>\n  <g ng-style=\"{fill: 'red'}\">\n    <rect width=\"800\" height=\"200\" rx=\"80\" ry=\"80\"/>\n  </g>\n  \n  <g ng-style=\"{fill: 'red'}\">\n    <rect x=\"11\" y=\"10\" width=\"778\" height=\"180\" rx=\"90\" ry=\"90\"/>\n  </g>\n  <g ng-style=\"{fill:'white'}\">\n      \n    <text x=\"400\" y=\"125\" style=\"text-anchor:middle\"  font-weight=\"bold\" font-size=\"80\" font-family=\"Arial\">{{\"WRITE\"}} </text>\n    </g>\n  </g>\n</svg>\n\n\n</md-button>\n",
        "storeOutMessages": false,
        "fwdInMessages": false,
        "templateScope": "local",
        "x": 104.0694580078125,
        "y": 1008.4375610351562,
        "wires": [
            [
                "c2015392.7b9ad"
            ]
        ]
    },
    {
        "id": "77c3763e.2e1b48",
        "type": "mqtt in",
        "z": "ce0d3bcc.85e348",
        "name": "",
        "topic": "lnEcho",
        "qos": "1",
        "broker": "5bc7cc44.39f4b4",
        "x": 114,
        "y": 1138,
        "wires": [
            [
                "129321c.f2a00de"
            ]
        ]
    },
    {
        "id": "a0593b0f.d0c828",
        "type": "debug",
        "z": "ce0d3bcc.85e348",
        "name": "",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "false",
        "x": 585.7869110107422,
        "y": 815.4175796508789,
        "wires": []
    },
    {
        "id": "ce90176a.b864b8",
        "type": "ui_group",
        "z": "",
        "name": "Service Track Programmer",
        "tab": "1368abea.a98424",
        "order": 4,
        "disp": true,
        "width": "6",
        "collapse": false
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
        "id": "72376ecd.b3567",
        "type": "ui_group",
        "z": "",
        "name": "Main Line Programmer",
        "tab": "1368abea.a98424",
        "order": 5,
        "disp": true,
        "width": "6",
        "collapse": false
    },
    {
        "id": "1368abea.a98424",
        "type": "ui_tab",
        "z": "",
        "name": "LocoNet",
        "icon": "dashboard",
        "order": 2
    }
]
