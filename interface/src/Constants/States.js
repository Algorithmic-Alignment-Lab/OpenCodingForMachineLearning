// page states for the interface; App.js uses these to determine which
// ui to show
// let's just have the numbers go in order for ease of understanding
const states = {
    introduction: 0,
    openCoding: 1,
    assistedGrouping: 2,
    // todo: generation (what the annotator thinks the model will output)

    codeJustification: 3, 
    // Justification: have the annotator describe their thought process for the labels they provided
    hypGenerationAndComparison: 4, 
    // predictionComparison: 5, is part of the step5 ^
    // todo: comparison (what the annotator thought vs the actual model output)
    verification: 5, // openCoding: the annotator checks how correct the model was
    results: 6,
    
    docResults: 7,
    docView: 8, 
}

export default states;