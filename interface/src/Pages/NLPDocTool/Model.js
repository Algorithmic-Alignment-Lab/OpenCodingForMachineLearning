const Model = {
    backendUrl: "/NLPDocTool/api", // "http://petrichor.csail.mit.edu",
    huggingFace: undefined,
    apiLink: "",
    endpoint: "",
    parameters: [],
    outputs:[],
    fields: [],
    fieldParameters: [],
    contextNames: [],
    contextFilepath: "",
    csvInputs: [],
    contextJustification: "",
    humanResponses: [],
    predictions: [],
    metricOne: [],
    metricTwo: [],
    resultJustification: [],
    humanResponseRationale: [],
    processJustification: "",
    deploymentJustification: ""
};

export default Model;