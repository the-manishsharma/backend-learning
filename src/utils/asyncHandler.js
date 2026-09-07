const asyncHandler = (requestHandler) => {
  return (req, res, next) =>{
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
  }
}

export {asyncHandler}


















//what is asyncHandler function

// const asyncHandler = () => {} 
// const asyncHandler = (func) => () => {}            
// const asyncHandler = (func) => async() => {}
  
// Now we have async function to talk with database
// const asyncHandler = (fn) => async(req, res, next) => {
//   try {
//     await fn(req, res, next)
//   } catch (error) {
//     res.status(err.code || 500).json({
//       success : false,
//       message : err.message
//     })
//   }
// }
// we are applying wrapper of async and try-catch on taken function