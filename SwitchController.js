[
    {
        "id": "78ebda17.a5eb54",
        "type": "ui_numeric",
        "z": "ce0d3bcc.85e348",
        "name": "Switch Address",
        "label": "Address",
        "group": "aabbe48e.530ab8",
        "order": 1,
        "width": 0,
        "height": 0,
        "passthru": false,
        "topic": "swAddr",
        "format": "{{value}}",
        "min": "1",
        "max": "2048",
        "step": 1,
        "x": 128.00000381469727,
        "y": 385,
        "wires": [
            [
                "4c1efee8.6a183"
            ]
        ]
    },
    {
        "id": "e9d716d9.dd4538",
        "type": "debug",
        "z": "ce0d3bcc.85e348",
        "name": "",
        "active": false,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "true",
        "x": 875,
        "y": 414.99993896484375,
        "wires": []
    },
    {
        "id": "4c1efee8.6a183",
        "type": "function",
        "z": "ce0d3bcc.85e348",
        "name": "Switch Controller Function",
        "func": "//storing incoming values for Switch Address and Bushby Bit Status\nif (msg.payload === null)\n    return null;\n    \nif (msg.topic == \"setBushby\")\n{\n    context.set(\"setBushby\", msg.payload)\n    return null\n}\nif (msg.topic == \"swAddr\")\n{\n    var newAddr = parseInt(msg.payload)-1;\n    context.set(\"swAddr\", newAddr)\n    return null\n}\n\n//function to create JSON String for sending to the MQTT broker\nfunction createJSON(fromData)\n{\n    var retStr = \"{\\\"From\\\":\\\"Switch Board\\\", \\\"Valid\\\":1, \\\"Data\\\":[\";\n    var xorCode = 0;\n    for (i = 0; i < fromData.length; i++)\n    {\n        var byteCode = parseInt(fromData[i]);\n        retStr = retStr + byteCode.toString() + \",\"\n        xorCode = xorCode ^ byteCode;\n    }\n    xorCode = xorCode ^ 0xFF;\n    retStr = retStr + xorCode.toString() + \"]}\";\n    return retStr;\n}\n\n//in case Bushby bit data is not stored, we initialize it to CLEARED\nvar ignoreBushby = context.get(\"setBushby\")\nif (ignoreBushby === undefined) \n    ignoreBushby = false;\n\n//in case the user has not set a Switch Address, we exit without sending anything\nvar swAddr = context.get(\"swAddr\");\nif (swAddr === undefined) \n    return null;\n    \n//everything looking good, let's send the command\nvar onMsg;\nvar data= [0,0,0];\nif (ignoreBushby === false)\n    data[0] = 0xB0; //OPC_SW_REQ\nelse\n    data[0] = 0xBD; //OPC_SW_ACC to overrule Bushby\ndata[1] = swAddr & 0x7F;\ndata[2] = (swAddr & 0x0780) >>> 7;\ndata[2] = data[2] | ((msg.payload & 0x30));\nonMsg = {payload : createJSON(data)};\nreturn onMsg;",
        "outputs": 1,
        "noerr": 0,
        "x": 489,
        "y": 460,
        "wires": [
            [
                "e9d716d9.dd4538",
                "dee1ff05.914f"
            ]
        ]
    },
    {
        "id": "dee1ff05.914f",
        "type": "mqtt out",
        "z": "ce0d3bcc.85e348",
        "name": "lnBC",
        "topic": "lnIn",
        "qos": "1",
        "retain": "",
        "broker": "5bc7cc44.39f4b4",
        "x": 876,
        "y": 456.9999694824219,
        "wires": []
    },
    {
        "id": "18689da1.7a8ca2",
        "type": "ui_switch",
        "z": "ce0d3bcc.85e348",
        "name": "",
        "label": "Bushby Bit Override",
        "group": "aabbe48e.530ab8",
        "order": 3,
        "width": 0,
        "height": 0,
        "passthru": true,
        "decouple": "false",
        "topic": "setBushby",
        "style": "",
        "onvalue": "true",
        "onvalueType": "bool",
        "onicon": "",
        "oncolor": "",
        "offvalue": "false",
        "offvalueType": "bool",
        "officon": "",
        "offcolor": "",
        "x": 149,
        "y": 428,
        "wires": [
            [
                "4c1efee8.6a183"
            ]
        ]
    },
    {
        "id": "189d580d.3e1778",
        "type": "ui_template",
        "z": "ce0d3bcc.85e348",
        "group": "aabbe48e.530ab8",
        "name": "THROWN Button",
        "order": 4,
        "width": "3",
        "height": "2",
        "format": "<md-button class=\"vibrate filled touched bigfont rounded\" style=\"background-color:#FFFFFF\" ng-mousedown=\"send({payload: buttondown()})\" ng-mouseup=\"send({payload: buttonup()})\" ng-mouseleave=\"send({payload: buttonup()})\" > \n<script>\n    var mouseDownTH = false;\n    var defValTH = 0x00;\n    var downVal = 0x10;\n    var upVal = 0x00;\n\n    this.scope.buttondown = function() {mouseDownTH = true; return (defValTH + downVal);}\n    this.scope.buttonup = function() {if (mouseDownTH) {mouseDownTH = false; return (defValTH + upVal);} else return null}\n</script>\n\n<svg  width=\"100px\" height=\"60px\" version=\"1.1\" viewBox=\"0 0 800 200\">\n <g id=\"Button_Long_TH\">\n  \n  <rect fill=\"#FFFFFF\" width=\"800\" height=\"200\"/>\n  <g ng-style=\"{fill: 'lime'}\">\n    <rect width=\"800\" height=\"200\" rx=\"80\" ry=\"80\"/>\n  </g>\n  \n  <g ng-style=\"{fill: 'lime'}\">\n    <rect x=\"11\" y=\"10\" width=\"778\" height=\"180\" rx=\"90\" ry=\"90\"/>\n  </g>\n  <g ng-style=\"{fill:'black'}\">\n      \n    <text x=\"400\" y=\"125\" style=\"text-anchor:middle\"  font-weight=\"bold\" font-size=\"80\" font-family=\"Arial\">{{\"THROWN\"}} </text>\n    </g>\n  </g>\n</svg>\n\n\n</md-button>\n",
        "storeOutMessages": false,
        "fwdInMessages": false,
        "templateScope": "local",
        "x": 140,
        "y": 478,
        "wires": [
            [
                "4c1efee8.6a183"
            ]
        ]
    },
    {
        "id": "e29ef4cc.d16658",
        "type": "ui_template",
        "z": "ce0d3bcc.85e348",
        "group": "aabbe48e.530ab8",
        "name": "CLOSED Button",
        "order": 5,
        "width": "3",
        "height": "2",
        "format": "<md-button class=\"vibrate filled touched bigfont rounded\" style=\"background-color:#FFFFFF\" ng-mousedown=\"send({payload: buttondown()})\" ng-mouseup=\"send({payload: buttonup()})\" ng-mouseleave=\"send({payload: buttonup()})\" > \n<script>\n    var mouseDownCL = false;\n    var defValCL = 0x20;\n    var downVal = 0x10;\n    var upVal = 0x00;\n\n    this.scope.buttondown = function() {mouseDownCL = true; return (defValCL + downVal);}\n    this.scope.buttonup = function() {if (mouseDownCL) {mouseDownCL = false; return (defValCL + upVal);} else return null}\n</script>\n\n<svg  width=\"100px\" height=\"60px\" version=\"1.1\" viewBox=\"0 0 800 200\">\n <g id=\"Button_Long_CL\">\n  \n  <rect fill=\"#FFFFFF\" width=\"800\" height=\"200\"/>\n  <g ng-style=\"{fill: 'red'}\">\n    <rect width=\"800\" height=\"200\" rx=\"80\" ry=\"80\"/>\n  </g>\n  \n  <g ng-style=\"{fill: 'red'}\">\n    <rect x=\"11\" y=\"10\" width=\"778\" height=\"180\" rx=\"90\" ry=\"90\"/>\n  </g>\n  <g ng-style=\"{fill:'white'}\">\n      \n    <text x=\"400\" y=\"125\" style=\"text-anchor:middle\"  font-weight=\"bold\" font-size=\"80\" font-family=\"Arial\">{{\"CLOSED\"}} </text>\n    </g>\n  </g>\n</svg>\n\n\n</md-button>\n",
        "storeOutMessages": false,
        "fwdInMessages": false,
        "templateScope": "local",
        "x": 125.0694580078125,
        "y": 524.4375610351562,
        "wires": [
            [
                "4c1efee8.6a183"
            ]
        ]
    },
    {
        "id": "aabbe48e.530ab8",
        "type": "ui_group",
        "z": "",
        "name": "Turnout Control",
        "tab": "1368abea.a98424",
        "order": 3,
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
        "id": "1368abea.a98424",
        "type": "ui_tab",
        "z": "",
        "name": "LocoNet",
        "icon": "dashboard",
        "order": 2
    }
]
