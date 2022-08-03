interface Dependency {
	name: string;
	description: string;
	licence: string;
	link: string;
}

interface RegistryPackage {
	name: string;
	description: string;
	repository: {
		url: string;
	};
	license: string;
}

const BASE_URL = 'https://registry.npmjs.org/';

const packagePath = process.argv[process.argv.length - 1];
const content = await Bun.file(packagePath)
	.text()
	.then((text) => JSON.parse(text));

const processList = async (dependencies: string[]): Promise<Dependency[]> => {
	const deps: Dependency[] = [];

	for (const name in dependencies) {
		console.log(`Scanning ${name}`);
		const p = await fetch(`${BASE_URL}/${name}`).then((r) =>
			r.json<RegistryPackage>(),
		);
		const d = {
			name: p.name,
			description: p.description,
			licence: p.license,
			link: p.repository.url,
		};

		if (d.link) {
			if (d.link.startsWith('git+https://')) {
				d.link = d.link.replace('git+', '');
			} else if (d.link.startsWith('git://')) {
				d.link = d.link.replace(/git:\/\/(.*)\.git/, 'https://$1');
			}
		}

		deps.push(d);
	}

	return deps;
};

const deps = [
	...(await processList(content.dependencies)),
	...(await processList(content.devDependencies)),
];

console.log(
	deps
		.map(
			(item) =>
				`- ${item.name} - ${item.description}\n\tLink: ${
					item.link || 'N/A'
				}\n\tLicense: ${item.licence}`,
		)
		.join('\n'),
);

export {};
