const fs = require('fs')
const path = require('path');


const RegStringDouble = /"[^"\\]*(?:\\.[^"\\]*)*"/m;
const RegComments =/\/\/.*$/m;
const RegMultiLine = /\/\*.*?\*\//ms;
const RegMultiLineRazor = /@\*.*?\*@/ms;
const RegHtml = /<!--.*?-->/ms;
const RegGetFirst = /"|\/\/|\/\*/;
const RegDummy = /sadasfsdgsdgsg/;


// walks through all folders in directory and returns array of paths for each file
let walk = function(dir, done) {
  let results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    let i = 0;
    (function next() {
      let file = list[i++];
      if (!file) return done(null, results);
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            next();
          });
        } else {
          results.push(file);
          next();
        }
      });
    })();
  });
};

let getComments= (pathEntry) =>{
  	try {
  		let data = fs.readFileSync(pathEntry, 'utf8');
		let firstEncounter = "";
		let commentArray = []
		let regExFirstEncounter = RegGetFirst;
		let regExString = RegStringDouble;
		let regExFirstComment = RegMultiLine
		let regExSecondComment = RegComments;
		let RegTestString= /"/;
		let RegTestComm1= /\/\*/;
		let RegTestComm2= /\/\//;


		//If Statements to determine which kind of comments to use
		// And if strings should be checked and removed to prevent fake comment extraction

		if(path.extname(pathEntry).valueOf() == ".cs".valueOf()||path.extname(pathEntry).valueOf() == ".json".valueOf()||path.extname(pathEntry).valueOf() == ".js".valueOf()){
			//default
		}

		else if(path.extname(pathEntry).valueOf() == ".css".valueOf()){
			regExString = RegDummy
			regExSecondComment = RegMultiLine;
			regExFirstEncounter = RegMultiLine;
			RegTestComm1 = /\/\*/;
			RegTestComm2 = /\/\*/;

		}
		else if(path.extname(pathEntry).valueOf() == ".cshtml".valueOf()){


			regExFirstEncounter = /@\*/;
			regExFirstComment = RegMultiLineRazor
			regExSecondComment = RegMultiLineRazor;
			RegTestComm1 = /@\*/;
			RegTestComm2 = /@\*/;

		}
		else if(path.extname(pathEntry).valueOf() == ".html".valueOf()){
			regExFirstEncounter = /<!--/;
			regExFirstComment = RegHtml;
			regExSecondComment = RegHtml;
			//html shouldnt remove strings
			regExString = RegDummy
			RegTestComm1 = /<!--/;
			RegTestComm2 = /<!--/;

		}
		else{
			//some unknown file extention. while loop will not start
			regExFirstEncounter = RegDummy;

		}



		while(regExFirstEncounter.test(data)){

				firstEncounter = data.match(regExFirstEncounter)

				if(RegTestString.test(data.charAt([firstEncounter.index]))){
					data = data.replace(regExString,"")

				}
				else if(RegTestComm1.test(data.substring(firstEncounter.index))){

					commentArray.push(data.match(regExFirstComment)[0]);
					data = data.replace(regExFirstComment,"")

				}
				else if (RegTestComm2.test(data.substring(firstEncounter.index))){

					commentArray.push(data.match(regExSecondComment)[0]);
					data = data.replace(regExSecondComment,"")

				} 

				
		}
  
   return commentArray
   
} catch(e) {
    console.log('Error:', e.stack);
}

}


let allEntries = []
walk('./ReadmeBA/', function(err, results) {
	if (err) throw err;

	results.forEach(pathEntry => {
		allEntries.push({filename:path.basename(pathEntry),comments:getComments(pathEntry)})   
	})

	let text = "";
	allEntries.forEach( item => {
		text = text+`======${item.filename}======\n`
		item.comments.forEach(comment =>{
			text = text+comment+"\n"
		})
		text = text+`\n`

		
	});






	fs.writeFile('output.txt', text, (err) => {
	    if (err) throw err;
	    console.log('Output Saved!');
	});

});
