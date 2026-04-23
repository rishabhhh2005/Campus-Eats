const MOCK_CAMPUSES = [
	{
		campusId: 'punjab',
		campusName: 'Punjab',
		universityName: 'Chitkara University',
		city: 'Punjab',
		state: 'Punjab',
		logo: null,
		theme: {},
		sourceKey: 'Punjab'
	},
	{
		campusId: 'himachal',
		campusName: 'Himachal',
		universityName: 'Himachal University',
		city: 'Himachal',
		state: 'Himachal Pradesh',
		logo: null,
		theme: {},
		sourceKey: 'Himachal'
	}
];

export const getCampuses = (req, res) => {
	res.json({ campuses: MOCK_CAMPUSES });
};

export const getCampusById = (req, res) => {
	const id = req.params.id;
	const c = MOCK_CAMPUSES.find(x => x.campusId === id || x.sourceKey === id || x.campusName === id);
	if (!c) return res.status(404).json({ error: 'Campus not found' });
	res.json({ campus: c });
};
