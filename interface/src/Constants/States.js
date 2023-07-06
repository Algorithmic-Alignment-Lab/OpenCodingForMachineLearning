// page states for the interface; App.js uses these to determine which
// ui to show
// let's just have the numbers go in order for ease of understanding
const states = {
    introduction: 0,
    openCoding: 1,
    assistedGrouping: 2,
    training: 3, // used to be verification
    results: 4, 
    
    // Justification: have the annotator describe their thought process for the labels they provided
    codeJustification: 5, 
    // Comparison (what the annotator thought vs the actual model output)
    hypGenerationAndComparison: 6,
    docResults: 7,
    docView: 8, 
}

export default states;