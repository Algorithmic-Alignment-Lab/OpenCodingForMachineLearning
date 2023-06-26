// page states for the interface; App.js uses these to determine which
// ui to show
const states = {
    introduction: 0,
    openCoding: 1,
    assistedGrouping: 2,
    // docJustification: have the annotator describe their thought process for the labels they provided
    // todo: generation (what the annotator thinks the model will output)
    docGeneration: 3,
    docVerification: 4,
    // todo: comparison (what the annotator thought vs the actual model output)
    verification: 5, // openCoding: the annotator checks how correct the model was
    results: 6,
    docJustification: 7, // let's just have the numbers go in order for ease of understanding
}

export default states;