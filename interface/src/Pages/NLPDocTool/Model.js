const Model = {
    backendUrl: "/NLPDocTool/api", // "http://petrichor.csail.mit.edu",
    // huggingFace: undefined,
    apiLink: "/user_model",
    predictEndpoint: "",

    // todo: consider how we'll have the user's model be finetuned w/ taylor
    finetuneEndpoint: "",
    finetune_batch_size: 0,
    finetune_num_epochs: 0,

    // parameters: [], // we are just requesting that the user enters their contexts in the way they want them to be entered
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