# To link the openCoding pages to here
- check how the previous methods interacted with post/get 
so that we don't get locked out of the databse as we go through opencoding
- pass in a prop to postData, getData, loadAnnotations, getOptionID
// also investigate what the load, getOptionId props are used for in other pages
- pass in a prop for loadAnnotations

- consider placing NLPDocTool Results at the end of this combined tool

# To fix this page
- make sure Model is passed in or imported somehow
- idea: use get_unlabeled_data method from backend for outputs to show to the user.
# To link this page to the next NLPDocTool Page
- change next page from verification to the next documentation page.
// set up the componentDidMount the same way in case that is a reason things worked out.
// make sure no linkButtons are in use to avoid router errors (just use updateState)
// then update that ones next page as well

- make sure previous opened connections are closed each time
// later
- pass through OpenCoding Model to here so we can compare the models outputs with the users hypothesises (which they geneerate in this stage, and we'll compare in docComparison).
