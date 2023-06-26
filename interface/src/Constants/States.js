// page states for the interface; App.js uses these to determine which
// ui to show
const states = {
    introduction: 0,
    openCoding: 1,
    assistedGrouping: 2,
    // todo: generation (what the annotator thinks the model will output)
    docGeneration: 3, 
    docResults: 4,
    docView: 5, 
    docComparison: 6,
    // todo: comparison (what the annotator thought vs the actual model output)
    verification: 7, // openCoding: the annotator checks how correct the model was
    results: 8,
    docJustification: 9, // let's just have the numbers go in order for ease of understanding
    // docJustification: have the annotator describe their thought process for the labels they provided
    
}

export default states;