const decoder = new TextDecoder("utf-8");
const dataFemale = await Deno.readFile("raw/female-firstnames.json");
const dataMale = await Deno.readFile("raw/male-firstnames.json");
let firstnames: {name: string, count: number, gender: string}[] = [];
let maleFirstnames: {name: string, count: number, gender: string}[] = [];
let femaleFirstnames: {name: string, count: number, gender: string}[] = [];

let firstnamesRaw = JSON.parse(decoder.decode(dataMale));
firstnamesRaw.forEach((name: { Name: string; NumberOfPersons: number; }) => {
	if (name.Name.indexOf(',') === -1) {
		let index: number = firstnames.findIndex(firstname => firstname.name === name.Name);
		if (index >= 0) {
			firstnames[index].count += name.NumberOfPersons;
		}
		else {
			let firstname = {
				name: name.Name,
				count: name.NumberOfPersons,
				gender: 'male'
			}
			maleFirstnames.push(firstname);
			firstnames.push(firstname);
		}
	}
});

firstnamesRaw = JSON.parse(decoder.decode(dataFemale));
firstnamesRaw.forEach((name: { Name: string; NumberOfPersons: number; }) => {
	if (name.Name.indexOf(',') === -1) {
		let index: number = firstnames.findIndex(firstname => firstname.name === name.Name);
		if (index >= 0) {
			firstnames[index].count += name.NumberOfPersons;
		}
		else {
			let firstname = {
				name: name.Name,
				count: name.NumberOfPersons,
				gender: 'female'
			}
			femaleFirstnames.push(firstname);
			firstnames.push(firstname);
		}
	}
});

firstnames.sort((a, b) => b.count - a.count);
maleFirstnames.sort((a, b) => b.count - a.count);
femaleFirstnames.sort((a, b) => b.count - a.count);

async function work(prefix: string, a: {name: string, count: number, gender: string}[], postfix: string = '') {
	if (prefix.length > 0) {
		a = a.filter(e => e.name.indexOf(prefix) === 0);
		if (a.length > 1) {
			let prompts: { all: number, names: {name: string, gender: string}[] } = {
				all: a.length,
				names: a.slice(0, 10).map(e => {return {name: e.name,  gender: e.gender}})
			};
			Deno.writeTextFileSync(`docs/name/${prefix}${postfix}.json`, `${JSON.stringify(prompts)}\n`);
		}		
	}
	if (prefix.length < 4 && a.length > 10) {
		let sprouts: string[] = [];
		a.forEach(e => {
			let nPrefix: string = e.name.substr(0, prefix.length + 1);
			if (!sprouts.includes(nPrefix)) {
				sprouts.push(nPrefix);
			}
		});
		sprouts.forEach(nPrefix => {
			work(nPrefix, a, postfix);
		})
	}
}
work('', firstnames);
work('', maleFirstnames, '.male');
work('', femaleFirstnames, '.female');
