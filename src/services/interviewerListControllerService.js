const { levenshteinDistance } = require("../helpers/HelperFunctions")


function getNonSimilarityScore(queryNames, instructorCompanyNames){
    if (!Array.isArray(queryNames)) throw new Error('queryNames is not an array')
    if (!Array.isArray(instructorCompanyNames)) throw new Error('instructorCompanyNames is not an array')
    if (queryNames.length == 0){
        return 100;
    }

    
    let maxUnmatch = 10000;
    queryNames.forEach((queryName, index1)=>{
        instructorCompanyNames.forEach((instructorCompanyName, index2)=>{
            if (instructorCompanyName.length == 0) return 
            const levi = levenshteinDistance(queryName,instructorCompanyName)
            const l1 = instructorCompanyName.length
            const l2 = queryName.length
            const d = Math.abs(l1-l2)
            const unmatches = levi - d
            maxUnmatch = Math.min(maxUnmatch, unmatches)
        })
        }
    )
    return maxUnmatch



}

module.exports = {getNonSimilarityScore}



function test(){
    console.log(getNonSimilarityScore(
        ["microsoft","amazon"],
        ["","goo","azure", "rahul zon"]
    ))
    console.log(getNonSimilarityScore(
        ["microsoft","amazon"],
        ["","goo"," sdf microsoft banglore"]
    ))
    console.log(getNonSimilarityScore(
        ["microsoft","amazon"],
        ["","goo","amaz"]
    ))
}

// test()
