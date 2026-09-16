/*   STEP 1   */
export const leagueID = "1312126061173043200"; // your league ID
export const leagueName = "The Big Dynasty"; // your league name
export const dues = 75; // (optional) used in template constitution page
export const dynasty = true; // true for dynasty leagues, false for redraft and keeper
export const enableBlog = false; // requires VITE_CONTENTFUL_ACCESS_TOKEN and VITE_CONTENTFUL_SPACE environment variables

/*   STEP 2   */
export const homepageText = `
  <p>The TBD Dynasty League isn’t just any fantasy football league — it’s the greatest Portuguese fantasy football league on the planet. Founded in 2023, TBD brings together ten fierce competitors battling year-round in a Superflex, PPR, Tight End Premium format that rewards bold trades, deep scouting, and true dynasty-level strategy.</p>
  <p>TBD isn’t just about trophies — it’s about long-term rivalries, blockbuster trades, and a tight-knit community rooted in Portuguese pride and nonstop trash talk. Every offseason move matters. Every draft pick counts. Every matchup adds fuel to the fire. However, since its founding, the league’s championship — The Big Bowl — has become the ultimate measure of dynasty success.</p>
  <p>Whether you’re a founding member or a curious onlooker, welcome to TBD — where legends are built, rebuilt, and sometimes tank for picks.</p>
  <hr />
  <p>Follow us on Instagram for more updates! <a href="https://www.instagram.com/thebigdynasty/">@thebigdynasty</a></p>
  <p>Established 2023</p>
`;

/*   STEP 3   */

export const managers = [
	{
		"roster": 1,
		"managerID": "471758701842132992",
		"name": "JD",
		"tookOver": null,
		"location": "Tulare, California",
		"bio": "JD, proud GM of the Azorean Armada, has built his franchise in true Rams fashion. If a player is wearing blue and gold, they're probably on his team. Living by the Les Snead motto of 'F** them picks,' JD transformed the Armada from a 7th-place debut into a perennial contender, highlighted by a 3rd-place finish in 2024 and a 10-win season in 2025. With stars like Jordan Love, Puka Nacua, Kyren Williams, Josh Jacobs, and Brian Thomas Jr., his roster has quietly become one of the league's best. Around the league, JD is just as famous for his trade etiquette—send him an offer and you might get a response tomorrow... or next month. But don't mistake the silence for inactivity. He's always lurking, always plotting, and always looking for the move that brings a championship to the Armada.",
		"photo": "/managers/jd.png",
		"fantasyStart": null,
		"favoriteTeam": "lar",
		"mode": "Win Now",
		"rival": {
			name: "Justin",
			link: 2,
			image: "/managers/justin.png",
		},
		"favoritePlayer": 9493,
		"valuePosition": "WR",
		"rookieOrVets": "Rookies",

		"philosophy": "All-Time Record: 21 - 21",
		"philosophy23": "2023: (4-10) 7th",
		"philosophy24": "2024: (7-7) 3rd 🥉",
		"philosophy25": "2025: (10-4) 5th",
		"philosophy26": null,
		"philosophy27": null,

		"seasonRecords": [
			{ "year": 2023, "record": "4-10", "finish": "7th", "champion": false },
			{ "year": 2024, "record": "7-7", "finish": "3rd", "champion": false },
			{ "year": 2025, "record": "10-4", "finish": "5th", "champion": false }
		],

		"tradingScale": 4,
		"preferredContact": "Sleeper",
	},

	{
		"roster": 2,
		"managerID": "594665552094486528",
		"name": "Grant",
		"tookOver": null,
		"location": "Manteca, California",
		"bio": "The tallest tolo in the league and the undisputed QB hoarder, Grant has been stacking signal-callers like he's preparing for a Superflex apocalypse. After locking in his 'big boy job' (while still proudly repping the Hydro Flask lunch life), he's turned that same discipline into one of TBD's model franchises. With a young core featuring Ashton Jeanty, Amon-Ra St. Brown, A.J. Brown, Drake London, Brock Bowers, and Rashee Rice, The .02ers have been among the league's elite since day one. Despite owning the league's best all-time record, winning the inaugural regular season title, and making three straight playoff appearances, Grant has yet to bring home the championship—coming up just short when it matters most. Will this finally be the year The .02ers turn regular season dominance into dynasty glory?",
		"photo": "/managers/grant.png",
		"fantasyStart": null,
		"favoriteTeam": "lv",
		"mode": "Win Now",
		"rival": {
			name: "Gavin",
			link: 4,
			image: "/managers/gavin.png",
		},
		"favoritePlayer": 11564,
		"valuePosition": "QB",
		"rookieOrVets": "Vets",

		"philosophy": "All-Time Record: 30 - 12",
		"philosophy23": "2023: (12-2) 2nd 🥈",
		"philosophy24": "2024: (8-6) 4th",
		"philosophy25": "2025: (10-4) 4th",
		"philosophy26": null,
		"philosophy27": null,

		"seasonRecords": [
			{ "year": 2023, "record": "12-2", "finish": "2nd", "champion": false },
			{ "year": 2024, "record": "8-6", "finish": "4th", "champion": false },
			{ "year": 2025, "record": "10-4", "finish": "4th", "champion": false }
		],

		"tradingScale": 10,
		"preferredContact": "Sleeper",
	},

	{
		"roster": 3,
		"managerID": "608428302964686848",
		"name": "Justin",
		"tookOver": null,
		"location": "Tulare, California",
		"bio": "Justin, GM of the Oakdale Carpetbaggers and proud trumpet maestro of the Filarmonica Portuguesa de Tulare, brings unmatched energy to TBD. Whether it's hyping up the sleeper of the week, making bold draft-day declarations, or convincing everyone his latest waiver pickup is the next league winner, confidence has never been in short supply. His rivalry with JD has become league lore, with every matchup and trade negotiation turning into a battle of who can out-stubborn the other. While the results haven't matched the confidence just yet, the Carpetbaggers continue to build around stars like Saquon Barkley, Sam LaPorta, and Quinshon Judkins. Justin is still searching for his first playoff breakthrough, but if you ask him, this is finally the year the rest of the league catches up to what he's known all along.",
		"photo": "/managers/justin.png",
		"fantasyStart": null,
		"favoriteTeam": "lar",
		"mode": "Win Now",
		"rival": {
			name: "JD",
			link: 0,
			image: "/managers/jd.png",
		},
		"favoritePlayer": 4892,
		"valuePosition": "WR",
		"rookieOrVets": "Vets",

		"philosophy": "All-Time Record: 19 - 23",
		"philosophy23": "2023: (5-9) 4th",
		"philosophy24": "2024: (6-8) 6th",
		"philosophy25": "2025: (8-6) 6th",
		"philosophy26": null,
		"philosophy27": null,

		"seasonRecords": [
			{ "year": 2023, "record": "5-9", "finish": "4th", "champion": false },
			{ "year": 2024, "record": "6-8", "finish": "6th", "champion": false },
			{ "year": 2025, "record": "8-6", "finish": "6th", "champion": false }
		],

		"tradingScale": 3,
		"preferredContact": "Sleeper",
	},

	{
		"roster": 4,
		"managerID": "722593452524650496",
		"name": "Logan",
		"tookOver": null,
		"location": "Riverbank, California",
		"bio": "Logan, GM of The Runners and the Valley's own EMT1, has built his franchise the same way he drives an ambulance—fast, aggressive, and occasionally a little reckless. After a rough start to TBD, Logan has quietly assembled one of the league's more intriguing rosters, led by Jayden Daniels, Joe Burrow, Nico Collins, Jonathan Taylor, and Tee Higgins. He's the kind of manager everyone overlooks... right up until he hangs 200 points on you. Whether he's making questionable trade offers, hyping up his latest sleeper, or reminding everyone he's a four-sport athlete (allegedly), Logan always keeps the league entertaining. If The Runners can finally turn potential into wins, don't be surprised if this sleeping giant crashes the playoff party.",
		"photo": "/managers/logan.png",
		"fantasyStart": null,
		"favoriteTeam": "sf",
		"mode": "Rebuild",
		"rival": {
			name: "Bolo",
			link: 6,
			image: "/managers/bolo.png",
		},
		"favoritePlayer": 11566,
		"valuePosition": "WR",
		"rookieOrVets": "Rookies",

		"philosophy": "All-Time Record: 14 - 28",
		"philosophy23": "2023: (3-11) 10th",
		"philosophy24": "2024: (6-8) 8th",
		"philosophy25": "2025: (5-9) 9th",
		"philosophy26": null,
		"philosophy27": null,

		"seasonRecords": [
			{ "year": 2023, "record": "3-11", "finish": "10th", "champion": false },
			{ "year": 2024, "record": "6-8", "finish": "8th", "champion": false },
			{ "year": 2025, "record": "5-9", "finish": "9th", "champion": false }
		],

		"tradingScale": 8,
		"preferredContact": "Sleeper",
	},

	{
		"roster": 5,
		"managerID": "732848788863037440",
		"name": "Gavin",
		"tookOver": null,
		"location": "Manteca, California",
		"bio": "Gavin, the reigning TBD Champion and walking hot-take factory, has gone from 9th place in the inaugural season to the league's newest powerhouse. While the Raiders continue searching for answers, Gavin has built one of the most terrifying rosters in league history, featuring Lamar Jackson, Bijan Robinson, Jahmyr Gibbs, Ja'Marr Chase, Justin Jefferson, Malik Nabers, and Trey McBride. If you're wondering how he did it... ask Luke. Despite rejecting trade offers like they're personal insults and somehow still believing every Raiders offseason has a plan, Gavin keeps finding ways to make his team even better. After capturing his first championship in 2024 and following it up with a 12-2 season in 2025, NorCal Seleção has become the standard everyone else is chasing.",
		"photo": "/managers/gavin.png",
		"fantasyStart": null,
		"favoriteTeam": "lv",
		"mode": "Win Now",
		"rival": {
			name: "Grant",
			link: 1,
			image: "/managers/grant.png",
		},
		"favoritePlayer": 11632,
		"valuePosition": "WR",
		"rookieOrVets": "Vets",

		"philosophy": "All-Time Record: 26 - 16",
		"philosophy23": "2023: (4-10) 9th",
		"philosophy24": "2024: (10-4) 1st 🏆",
		"philosophy25": "2025: (12-2) 3rd 🥉",
		"philosophy26": null,
		"philosophy27": null,

		"seasonRecords": [
			{ "year": 2023, "record": "4-10", "finish": "9th", "champion": false },
			{ "year": 2024, "record": "10-4", "finish": "1st", "champion": true },
			{ "year": 2025, "record": "12-2", "finish": "3rd", "champion": false }
		],

		"tradingScale": 8,
		"preferredContact": "Sleeper",
	},

	{
		"roster": 6,
		"managerID": "733091325091635200",
		"name": "Izzy",
		"tookOver": null,
		"location": "Oakdale, California",
		"bio": "Izzy, commissioner of TBD and GM of the Piri Piri Pombas, has spent the league's first three seasons balancing league business with building a contender. After back-to-back 10-win seasons, a 2024 regular season title, and a runner-up finish, he wasn't afraid to tear it all down—shipping off stars like Lamar Jackson and Justin Jefferson to kickstart a new era. Now armed with three 2027 first-round picks and seven second-rounders, Izzy is betting the future belongs to him. Whether he's settling league disputes, playing baritone sax, or wheeling and dealing, Izzy always seems to have a long-term plan. With a young core led by Caleb Williams, Cam Ward, Rome Odunze, Bucky Irving, and one of the biggest draft war chests in TBD history, the Pombas are hoping today's rebuild becomes tomorrow's dynasty.",
		"photo": "/managers/izzy.png",
		"fantasyStart": null,
		"favoriteTeam": "sf",
		"mode": "Rebuild",
		"rival": {
			name: "Luke",
			link: 7,
			image: "/managers/luke.png",
		},
		"favoritePlayer": 8183,
		"valuePosition": "RB",
		"rookieOrVets": "Rookies",

		"philosophy": "All-Time Record: 23 - 19",
		"philosophy23": "2023: (10-4) 5th",
		"philosophy24": "2024: (10-4) 2nd 🥈",
		"philosophy25": "2025: (3-11) 10th",
		"philosophy26": null,
		"philosophy27": null,

		"seasonRecords": [
			{ "year": 2023, "record": "10-4", "finish": "5th", "champion": false },
			{ "year": 2024, "record": "10-4", "finish": "2nd", "champion": false },
			{ "year": 2025, "record": "3-11", "finish": "10th", "champion": false }
		],

		"tradingScale": 7,
		"preferredContact": "Sleeper",
	},

	{
		"roster": 7,
		"managerID": "733139077938925568",
		"name": "Bolo",
		"tookOver": null,
		"location": "Elk Grove, California",
		"bio": "Bolo, GM of Los Azules, made league history by winning TBD's inaugural championship as the only team to finish 6-8 and still lift the trophy. Rather than chase another middling season after a last-place finish in 2024, he committed to a full rebuild—turning veterans into young stars, premium picks, and eventually landing franchise cornerstones like Patrick Mahomes, Josh Allen, CeeDee Lamb, and Tetairoa McMillan. Never afraid to make the blockbuster move, Bolo has built a reputation as one of the league's most active traders and biggest long-term thinkers. Whether he's tracking rivalries like they're official NFL records or planning three years ahead, Los Azules always seem to have a plan. With one of the league's deepest collections of young talent and future assets, Bolo is hoping his rebuild ends the same way his first season did—with a championship.",
		"photo": "/managers/bolo.png",
		"fantasyStart": null,
		"favoriteTeam": "dal",
		"mode": "Win Now",
		"rival": {
			name: "Logan",
			link: 3,
			image: "/managers/logan.png",
		},
		"favoritePlayer": 6786,
		"valuePosition": "WR",
		"rookieOrVets": "Vets",

		"philosophy": "All-Time Record: 13 - 29",
		"philosophy23": "2023: (6-8) 1st 🏆",
		"philosophy24": "2024: (4-10) 10th",
		"philosophy25": "2025: (3-11) 7th",
		"philosophy26": null,
		"philosophy27": null,

		"seasonRecords": [
			{ "year": 2023, "record": "6-8", "finish": "1st", "champion": true },
			{ "year": 2024, "record": "4-10", "finish": "10th", "champion": false },
			{ "year": 2025, "record": "3-11", "finish": "7th", "champion": false }
		],

		"tradingScale": 9,
		"preferredContact": "Sleeper",
	},

	{
		"roster": 8,
		"managerID": "854976092128251904",
		"name": "Luke",
		"tookOver": null,
		"location": "Manteca, California",
		"bio": "Luke, QB1, JUCO legend, and now San Jose State Spartans quarterback, gave TBD its first Division I athlete. As the league's only non-Portuguese member, he's embraced the role while building one of the youngest rosters in the league. After a rollercoaster 2025 season, Luke shocked everyone by turning a 6-8 squad into a championship game appearance. Powered by Kyle Pitts' legendary 50-point playoff explosion, the Northside Tec Trojans came within one win of a title before falling just short in the championship. Whether he's chasing upside, sending blockbuster trade offers, or trusting prospects before anyone else, one thing's certain—Luke is never afraid to bet on talent.",
		"photo": "/managers/luke.png",
		"fantasyStart": null,
		"favoriteTeam": "no",
		"mode": "Win Now",
		"rival": {
			name: "Izzy",
			link: 5,
			image: "/managers/izzy.png",
		},
		"favoritePlayer": 11559,
		"valuePosition": "RB",
		"rookieOrVets": "Vets",

		"philosophy": "All-Time Record: 22 - 20",
		"philosophy23": "2023: (11-3) 6th",
		"philosophy24": "2024: (5-9) 9th",
		"philosophy25": "2025: (6-8) 2nd 🥈",
		"philosophy26": null,
		"philosophy27": null,

		"seasonRecords": [
			{ "year": 2023, "record": "11-3", "finish": "6th", "champion": false },
			{ "year": 2024, "record": "5-9", "finish": "9th", "champion": false },
			{ "year": 2025, "record": "6-8", "finish": "2nd", "champion": false }
		],

		"tradingScale": 6,
		"preferredContact": "Sleeper",
	},

	{
		"roster": 9,
		"managerID": "865009922180509696",
		"name": "Daniel",
		"tookOver": null,
		"location": "Turlock, California",
		"bio": "Daniel, GM of the Avós All-Stars, has always believed passion could overcome projections. A Stan State alum and devoted Cristiano Ronaldo fan, he finally proved it in 2025, turning an 8-6 record and the No. 4 seed into one of the most unexpected championship runs in TBD history. Just when everyone counted him out, Daniel got hot at the perfect time. Led by veterans Jalen Hurts, Derrick Henry, Travis Kelce, and Brock Purdy, Avós All-Stars reminded the league that championships aren't won on paper. His roster may not always be the flashiest, but after lifting the trophy, Daniel earned something even better—the last laugh.",
		"photo": "/managers/daniel.png",
		"fantasyStart": null,
		"favoriteTeam": "sf",
		"mode": "Win Now",
		"rival": {
			name: "Lucas",
			link: 9,
			image: "/managers/lucas.png",
		},
		"favoritePlayer": 7569,
		"valuePosition": "WR",
		"rookieOrVets": "Vets",

		"philosophy": "All-Time Record: 27 - 15",
		"philosophy23": "2023: (11-3) 3rd 🥉",
		"philosophy24": "2024: (8-6) 5th",
		"philosophy25": "2025: (8-6) 1st 🏆",
		"philosophy26": null,
		"philosophy27": null,

		"seasonRecords": [
			{ "year": 2023, "record": "11-3", "finish": "3rd", "champion": false },
			{ "year": 2024, "record": "8-6", "finish": "5th", "champion": false },
			{ "year": 2025, "record": "8-6", "finish": "1st", "champion": true }
		],

		"tradingScale": 9,
		"preferredContact": "Sleeper",
	},

	{
		"roster": 10,
		"managerID": "871263782905794560",
		"name": "Lucas",
		"tookOver": null,
		"location": "Turlock, California",
		"bio": "Lucas, GM of the MidValley Vacas, might be the only man alive who gets more excited about a Kyle Juszczyk pancake block than a 50-yard touchdown. A true football junkie, Lucas treats dynasty like an NFL scouting department, building his roster around young talent and players he believes are destined to break out. Whether he's explaining why the Vacas 'just need one more piece' or defending his latest sleeper, he's always got a plan. While the wins haven't matched the football knowledge just yet, nobody questions Lucas' passion for the game. Every offseason brings another 'master plan,' another sleeper prediction, and another reason to believe the Vacas are finally ready to take the next step.",
		"photo": "/managers/lucas.png",
		"fantasyStart": null,
		"favoriteTeam": "sf",
		"mode": "Rebuild",
		"rival": {
			name: "Daniel",
			link: 8,
			image: "/managers/daniel.png",
		},
		"favoritePlayer": 6803,
		"valuePosition": "RB",
		"rookieOrVets": "Vets",

		"philosophy": "All-Time Record: 15 - 27",
		"philosophy23": "2023: (4-10) 8th",
		"philosophy24": "2024: (6-8) 7th",
		"philosophy25": "2025: (5-9) 8th",
		"philosophy26": null,
		"philosophy27": null,

		"seasonRecords": [
			{ "year": 2023, "record": "4-10", "finish": "8th", "champion": false },
			{ "year": 2024, "record": "6-8", "finish": "7th", "champion": false },
			{ "year": 2025, "record": "5-9", "finish": "8th", "champion": false }
		],

		"tradingScale": 6,
		"preferredContact": "Sleeper",
	},
];


/*   !!  !!  IMPORTANT  !!  !! */
/*
Below is the most up-to-date version of a manager. Please leave this commented out
and don't delete it. This will be updated if any fields are added, removed or changed
and will allow updates without causing merge conflicts
*/

// {
//   "roster": 3,
//   "managerID": "12345678",
//   "name": "Your Name",
//   "tookOver": 2020,
//   "location": "Brooklyn",
//   "bio": "Lorem ipsum...",
//   "photo": "/managers/name.jpg",
//   "fantasyStart": 2014,
//   "favoriteTeam": "nyj",
//   "mode": "Win Now",
//   "rival": {
//     name: "Rival",
//     link: 6,
//     image: "/managers/rival.jpg",
//   },
//   "favoritePlayer": 1426,
//   "valuePosition": "WR",
//   "rookieOrVets": "Rookies",
//   "philosophy": "Your fantasy team's philosophy",
//   "tradingScale": 10,
//   "preferredContact": "Text",
// },