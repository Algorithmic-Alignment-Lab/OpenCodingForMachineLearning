// page states for the interface; App.js uses these to determine which
// ui to show
// let's just have the numbers go in order for ease of understanding
const states = {
    introduction: 0,
    openCoding: 1,
    assistedGrouping: 2,
    // todo: generation (what the annotator thinks the model will output)
 
    // removing verification because now all we care about is openCoding, assistedGrouping
    // verification: 3, // openCoding: the annotator checks how correct the model was
    results: 3, 
    
    // Justification: have the annotator describe their thought process for the labels they provided
    codeJustification: 4, 
    // Comparison (what the annotator thought vs the actual model output)
    hypGenerationAndComparison: 5,
    docResults: 6,
    docView: 7, 
}

export default states;