// page states for the interface; App.js uses these to determine which
// ui to show
const states = {
    introduction: 0,
    openCoding: 1,
    assistedGrouping: 2,
    // docJustification: have the annotator describe their thought process for the labels they provided
    docJustification: 3, // let's just have the numbers go in order for ease of understanding
    // todo: consider if we want to skip docJustification (old step4) and go right into step5
    // todo: generation (what the annotator thinks the model will output)
    // todo: comparison (what the annotator thought vs the actual model output)
    verification: 4, // openCoding: the annotator checks how correct the model was
    results: 5,
}

export default states;