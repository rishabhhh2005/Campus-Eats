const MOCK_CAMPUSES = [
	{
		campusId: 'punjab',
		campusName: 'Punjab',
		universityName: 'Campus University',
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

