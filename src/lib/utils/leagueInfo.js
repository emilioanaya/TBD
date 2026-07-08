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
  <h4>The Big Bowl History 🏆:</h4>
  <h6>🏈 The Big Bowl I (2023) - Champion: Los Azules (Bolo)</h6>
  <p>After finishing the regular season at 6–8, Los Azules caught fire at the perfect time. Powered by a legendary wide receiver trio of CeeDee Lamb, Justin Jefferson, and Davante Adams, they completed one of the most improbable playoff runs in TBD history.</p>
  <p>Championship MVP - CeeDee Lamb - 40.20 points</p>
  <h6>🏈 The Big Bowl II (2024) - Champion: Norcal Seleçáo (Gavin)</h6>
  <p>Norcal Seleção asserted dominance throughout the season, capturing the championship behind a stacked roster led by Trey McBride, Ja’Marr Chase, and rookie standout Malik Nabers. Their title run marked the rise of one of TBD’s earliest powerhouses.</p>
  <p>Championship MVP - Trey McBride - 36.30 points</p>
  <h6>🏈 The Big Bowl III (2025) - Champion: Avós All-Stars (Daniel)</h6>
  <p>Entering the playoffs as the 4 seed with an 8–6 regular-season record, Daniel and the Avós All-Stars navigated a competitive field and claimed the third Big Bowl title, adding another chapter to TBD’s growing legacy.</p>
  <p>Championship MVP - Derrick Henry - 45.60 points</p>
  <hr />
  <p>Follow us on Instagram for more updates! <a href="https://www.instagram.com/thebigdynasty/">@thebigdynasty</a></p>
  <p>Established 2023</p>
`;

/*   STEP 3   */
/*
3 managers as an example. Uncomment (remove the //) before each line to make it live code
If you're having trouble, reference the Training Wheels' Manager Section
https://github.com/nmelhado/league-page/blob/master/TRAINING_WHEELS.md#ii-adding-managers-and-changing-the-homepage-text
*/

// To omit an optional field, set it's value to null

export const managers = [
    {
      "roster": 1,  // ID of the roster that the manager manages (look at the order of the power rankings graph)
      "managerID" : "471758701842132992",
      "name": "JD",
      "tookOver": null, // (optional) used if a manager took over a team, delete this line or change to null otherwise
      "location": "Tulare, California", // (optional)
      "bio": "JD, proud GM of the Azorean Armada, has built his franchise in true Rams fashion. If a player is wearing blue and gold, they're probably on his team. Living by the Les Snead motto of 'F** them picks,' JD transformed the Armada from a 7th-place debut into a perennial contender, highlighted by a 3rd-place finish in 2024 and a 10-win season in 2025. With stars like Jordan Love, Puka Nacua, Kyren Williams, Josh Jacobs, and Brian Thomas Jr., his roster has quietly become one of the league's best. Around the league, JD is just as famous for his trade etiquette—send him an offer and you might get a response tomorrow... or next month. But don't mistake the silence for inactivity. He's always lurking, always plotting, and always looking for the move that brings a championship to the Armada.",
      "photo": "/managers/jd.png", // square ratio recommended (no larger than 500x500)
      "fantasyStart": null, // (optional) when did the manager start playing fantasy football
      "favoriteTeam": "lar", // (optional) favorite NFL team, (follows convention: nyj, sea, mia, etc.) MUST BE LOWERCASE
      "mode": "Win Now", // (optional) 'Win Now', 'Dynasty', or 'Rebuild' (anything else and you will need to add a new png to /static/ similar to the 'Rebuild.png' and 'Win Now.png' currently in there)
      "rival": {
        name: "Justin", // Can be anything (usually your rival's name)
        link: 2, // manager array number within this array, or null to link back to all managers page
        image: "/managers/justin.png", // either a specific manager photo or '/managers/everyone.png' or '/managers/question.png'
      },
      "favoritePlayer": 9493, // (optional) this corresponds to the Sleeper player ID (https://api.sleeper.app/v1/players/nfl)
      "valuePosition": "WR", // (optional) Favorite position (QB, WR, RB, TE, etc.)
      "rookieOrVets": "Rookies", // (optional) 'Rookies' or 'Vets' (anything else and you will need to add a new png to /static/ similar to the 'Rookies.png' and 'Vets.png' currently in there)
      "philosophy": "All-Time Record: 21 - 21",
      "philosophy23": "2023: (4-10) 7th",
      "philosophy24": "2024: (7-7) 3rd 🥉",
      "philosophy25": "2025: (10-4) 5th",
      "philosophy26": null,
      "philosophy27": null,
      "tradingScale": 4, // 1 - 10
      "preferredContact": "Sleeper", // 'Text', 'WhatsApp', 'Sleeper', 'Email', 'Phone', 'Discord', and 'Carrier Pigeon' are currently supplied in the template
    },
    {
      "roster": 2,  // ID of the roster that the manager manages (look at the order of the power rankings graph)
      "managerID" : "594665552094486528",
      "name": "Grant",
      "tookOver": null, // (optional) used if a manager took over a team, delete this line or change to null otherwise
      "location": "Manteca, California", // (optional)
      "bio": "The tallest tolo in the league and the undisputed QB hoarder, Grant has been stacking signal-callers like he's preparing for a Superflex apocalypse. After locking in his 'big boy job' (while still proudly repping the Hydro Flask lunch life), he's turned that same discipline into one of TBD's model franchises. With a young core featuring Ashton Jeanty, Amon-Ra St. Brown, A.J. Brown, Drake London, Brock Bowers, and Rashee Rice, The .02ers have been among the league's elite since day one. Despite owning the league's best all-time record, winning the inaugural regular season title, and making three straight playoff appearances, Grant has yet to bring home the championship—coming up just short when it matters most. Will this finally be the year The .02ers turn regular season dominance into dynasty glory?",
      "photo": "/managers/grant.png", // square ratio recommended (no larger than 500x500)
      "fantasyStart": null, // (optional) when did the manager start playing fantasy football
      "favoriteTeam": "lv", // (optional) favorite NFL team, (follows convention: nyj, sea, mia, etc.) MUST BE LOWERCASE
      "mode": "Win Now", // (optional) 'Win Now', 'Dynasty', or 'Rebuild' (anything else and you will need to add a new png to /static/ similar to the 'Rebuild.png' and 'Win Now.png' currently in there)
      "rival": {
        name: "Gavin", // Can be anything (usually your rival's name)
        link: 4, // manager array number within this array, or null to link back to all managers page
        image: "/managers/gavin.png", // either a specific manager photo or '/managers/everyone.png' or '/managers/question.png'
      },
      "favoritePlayer": 11564, // (optional) this corresponds to the Sleeper player ID (https://api.sleeper.app/v1/players/nfl)
      "valuePosition": "QB", // (optional) Favorite position (QB, WR, RB, TE, etc.)
      "rookieOrVets": "Vets", // (optional) 'Rookies' or 'Vets' (anything else and you will need to add a new png to /static/ similar to the 'Rookies.png' and 'Vets.png' currently in there)
      "philosophy": "All-Time Record: 30 - 12",
      "philosophy23": "2023: (12-2) 2nd 🥈",
      "philosophy24": "2024: (8-6) 4th",
      "philosophy25": "2025: (10-4) 4th",
      "philosophy26": null,
      "philosophy27": null,
      "tradingScale": 10, // 1 - 10
      "preferredContact": "Sleeper", // 'Text', 'WhatsApp', 'Sleeper', 'Email', 'Phone', 'Discord', and 'Carrier Pigeon' are currently supplied in the template
    },
    {
      "roster": 3,  // ID of the roster that the manager manages (look at the order of the power rankings graph)
      "managerID" : "608428302964686848",
      "name": "Justin",
      "tookOver": null, // (optional) used if a manager took over a team, delete this line or change to null otherwise
      "location": "Tulare, California", // (optional)
      "bio": "Justin, GM of the Oakdale Carpetbaggers and proud trumpet maestro of the Filarmonica Portuguesa de Tulare, brings unmatched energy to TBD. Whether it's hyping up the sleeper of the week, making bold draft-day declarations, or convincing everyone his latest waiver pickup is the next league winner, confidence has never been in short supply. His rivalry with JD has become league lore, with every matchup and trade negotiation turning into a battle of who can out-stubborn the other. While the results haven't matched the confidence just yet, the Carpetbaggers continue to build around stars like Saquon Barkley, Sam LaPorta, and Quinshon Judkins. Justin is still searching for his first playoff breakthrough, but if you ask him, this is finally the year the rest of the league catches up to what he's known all along.",
      "photo": "/managers/justin.png", // square ratio recommended (no larger than 500x500)
      "fantasyStart": null, // (optional) when did the manager start playing fantasy football
      "favoriteTeam": "lar", // (optional) favorite NFL team, (follows convention: nyj, sea, mia, etc.) MUST BE LOWERCASE
      "mode": "Win Now", // (optional) 'Win Now', 'Dynasty', or 'Rebuild' (anything else and you will need to add a new png to /static/ similar to the 'Rebuild.png' and 'Win Now.png' currently in there)
      "rival": {
        name: "JD", // Can be anything (usually your rival's name)
        link: 0, // manager array number within this array, or null to link back to all managers page
        image: "/managers/jd.png", // either a specific manager photo or '/managers/everyone.png' or '/managers/question.png'
      },
      "favoritePlayer": 4892, // (optional) this corresponds to the Sleeper player ID (https://api.sleeper.app/v1/players/nfl)
      "valuePosition": "WR", // (optional) Favorite position (QB, WR, RB, TE, etc.)
      "rookieOrVets": "Vets", // (optional) 'Rookies' or 'Vets' (anything else and you will need to add a new png to /static/ similar to the 'Rookies.png' and 'Vets.png' currently in there)
      "philosophy": "All-Time Record: 19 - 23",
      "philosophy23": "2023: (5-9) 4th",
      "philosophy24": "2024: (6-8) 6th",
      "philosophy25": "2025: (8-6) 6th",
      "philosophy26": null,
      "philosophy27": null,
      "tradingScale": 3, // 1 - 10
      "preferredContact": "Sleeper", // 'Text', 'WhatsApp', 'Sleeper', 'Email', 'Phone', 'Discord', and 'Carrier Pigeon' are currently supplied in the template
    },
   {
      "roster": 4,  // ID of the roster that the manager manages (look at the order of the power rankings graph)
      "managerID" : "722593452524650496",
      "name": "Logan",
      "tookOver": null, // (optional) used if a manager took over a team, delete this line or change to null otherwise
      "location": "Riverbank, California", // (optional)
      "bio": "Logan, GM of The Runners and the Valley's own EMT1, has built his franchise the same way he drives an ambulance—fast, aggressive, and occasionally a little reckless. After a rough start to TBD, Logan has quietly assembled one of the league's more intriguing rosters, led by Jayden Daniels, Joe Burrow, Nico Collins, Jonathan Taylor, and Tee Higgins. He's the kind of manager everyone overlooks... right up until he hangs 200 points on you. Whether he's making questionable trade offers, hyping up his latest sleeper, or reminding everyone he's a four-sport athlete (allegedly), Logan always keeps the league entertaining. If The Runners can finally turn potential into wins, don't be surprised if this sleeping giant crashes the playoff party.",
      "photo": "/managers/logan.png", // square ratio recommended (no larger than 500x500)
      "fantasyStart": null, // (optional) when did the manager start playing fantasy football
      "favoriteTeam": "sf", // (optional) favorite NFL team, (follows convention: nyj, sea, mia, etc.) MUST BE LOWERCASE
      "mode": "Rebuild", // (optional) 'Win Now', 'Dynasty', or 'Rebuild' (anything else and you will need to add a new png to /static/ similar to the 'Rebuild.png' and 'Win Now.png' currently in there)
      "rival": {
        name: "Bolo", // Can be anything (usually your rival's name)
        link: 6, // manager array number within this array, or null to link back to all managers page
        image: "/managers/bolo.png", // either a specific manager photo or '/managers/everyone.png' or '/managers/question.png'
      },
      "favoritePlayer": 11566, // (optional) this corresponds to the Sleeper player ID (https://api.sleeper.app/v1/players/nfl)
      "valuePosition": "WR", // (optional) Favorite position (QB, WR, RB, TE, etc.)
      "rookieOrVets": "Rookies", // (optional) 'Rookies' or 'Vets' (anything else and you will need to add a new png to /static/ similar to the 'Rookies.png' and 'Vets.png' currently in there)
      "philosophy": "All-Time Record: 14 - 28", 
      "philosophy23": "2023: (3-11) 10th",
      "philosophy24": "2024: (6-8) 8th",
      "philosophy25": "2025: (5-9) 9th",
      "philosophy26": null,
      "philosophy27": null,
      "tradingScale": 8, // 1 - 10
      "preferredContact": "Sleeper", // 'Text', 'WhatsApp', 'Sleeper', 'Email', 'Phone', 'Discord', and 'Carrier Pigeon' are currently supplied in the template
    },
  {
      "roster": 5,  // ID of the roster that the manager manages (look at the order of the power rankings graph)
      "managerID" : "732848788863037440",
      "name": "Gavin",
      "tookOver": null, // (optional) used if a manager took over a team, delete this line or change to null otherwise
      "location": "Manteca, California", // (optional)
      "bio": "Gavin, the reigning TBD Champion and walking hot-take factory, has gone from 9th place in the inaugural season to the league's newest powerhouse. While the Raiders continue searching for answers, Gavin has built one of the most terrifying rosters in league history, featuring Lamar Jackson, Bijan Robinson, Jahmyr Gibbs, Ja'Marr Chase, Justin Jefferson, Malik Nabers, and Trey McBride. If you're wondering how he did it... ask Luke. Despite rejecting trade offers like they're personal insults and somehow still believing every Raiders offseason has a plan, Gavin keeps finding ways to make his team even better. After capturing his first championship in 2024 and following it up with a 12-2 season in 2025, NorCal Seleção has become the standard everyone else is chasing.",
      "photo": "/managers/gavin.png", // square ratio recommended (no larger than 500x500)
      "fantasyStart": null, // (optional) when did the manager start playing fantasy football
      "favoriteTeam": "lv", // (optional) favorite NFL team, (follows convention: nyj, sea, mia, etc.) MUST BE LOWERCASE
      "mode": "Win Now", // (optional) 'Win Now', 'Dynasty', or 'Rebuild' (anything else and you will need to add a new png to /static/ similar to the 'Rebuild.png' and 'Win Now.png' currently in there)
      "rival": {
        name: "Grant", // Can be anything (usually your rival's name)
        link: 1, // manager array number within this array, or null to link back to all managers page
        image: "/managers/grant.png", // either a specific manager photo or '/managers/everyone.png' or '/managers/question.png'
      },
      "favoritePlayer": 11632, // (optional) this corresponds to the Sleeper player ID (https://api.sleeper.app/v1/players/nfl)
      "valuePosition": "WR", // (optional) Favorite position (QB, WR, RB, TE, etc.)
      "rookieOrVets": "Vets", // (optional) 'Rookies' or 'Vets' (anything else and you will need to add a new png to /static/ similar to the 'Rookies.png' and 'Vets.png' currently in there)
      "philosophy": "All-Time Record: 26 - 16",  
      "philosophy23": "2023: (4-10) 9th",
      "philosophy24": "2024: (10-4) 1st 🏆",
      "philosophy25": "2025: (12-2) 3rd 🥉",
      "philosophy26": null,
      "philosophy27": null,
      "tradingScale": 8, // 1 - 10
      "preferredContact": "Sleeper", // 'Text', 'WhatsApp', 'Sleeper', 'Email', 'Phone', 'Discord', and 'Carrier Pigeon' are currently supplied in the template
    },
  {
      "roster": 6,  // ID of the roster that the manager manages (look at the order of the power rankings graph)
      "managerID" : "733091325091635200",
      "name": "Izzy",
      "tookOver": null, // (optional) used if a manager took over a team, delete this line or change to null otherwise
      "location": "Oakdale, California", // (optional)
      "bio": "Izzy, commissioner of TBD and GM of the Piri Piri Pombas, has spent the league's first three seasons balancing league business with building a contender. After back-to-back 10-win seasons, a 2024 regular season title, and a runner-up finish, he wasn't afraid to tear it all down—shipping off stars like Lamar Jackson and Justin Jefferson to kickstart a new era. Now armed with three 2027 first-round picks and seven second-rounders, Izzy is betting the future belongs to him. Whether he's settling league disputes, playing baritone sax, or wheeling and dealing, Izzy always seems to have a long-term plan. With a young core led by Caleb Williams, Cam Ward, Rome Odunze, Bucky Irving, and one of the biggest draft war chests in TBD history, the Pombas are hoping today's rebuild becomes tomorrow's dynasty.",
      "photo": "/managers/izzy.png", // square ratio recommended (no larger than 500x500)
      "fantasyStart": null, // (optional) when did the manager start playing fantasy football
      "favoriteTeam": "sf", // (optional) favorite NFL team, (follows convention: nyj, sea, mia, etc.) MUST BE LOWERCASE
      "mode": "Rebuild", // (optional) 'Win Now', 'Dynasty', or 'Rebuild' (anything else and you will need to add a new png to /static/ similar to the 'Rebuild.png' and 'Win Now.png' currently in there)
      "rival": {
        name: "Luke", // Can be anything (usually your rival's name)
        link: 7, // manager array number within this array, or null to link back to all managers page
        image: "/managers/luke.png", // either a specific manager photo or '/managers/everyone.png' or '/managers/question.png'
      },
      "favoritePlayer": 8183, // (optional) this corresponds to the Sleeper player ID (https://api.sleeper.app/v1/players/nfl)
      "valuePosition": "RB", // (optional) Favorite position (QB, WR, RB, TE, etc.)
      "rookieOrVets": "Rookies", // (optional) 'Rookies' or 'Vets' (anything else and you will need to add a new png to /static/ similar to the 'Rookies.png' and 'Vets.png' currently in there)
      "philosophy": "All-Time Record: 23 - 19",
      "philosophy23": "2023: (10-4) 5th",
      "philosophy24": "2024: (10-4) 2nd 🥈",
      "philosophy25": "2025: (3-11) 10th",
      "philosophy26": null,
      "philosophy27": null,
      "tradingScale": 7, // 1 - 10
      "preferredContact": "Sleeper", // 'Text', 'WhatsApp', 'Sleeper', 'Email', 'Phone', 'Discord', and 'Carrier Pigeon' are currently supplied in the template
    },{
      "roster": 7,  // ID of the roster that the manager manages (look at the order of the power rankings graph)
      "managerID" : "733139077938925568",
      "name": "Bolo",
      "tookOver": null, // (optional) used if a manager took over a team, delete this line or change to null otherwise
      "location": "Elk Grove, California", // (optional)
      "bio": "Bolo, GM of Los Azules, made league history by winning TBD's inaugural championship as the only team to finish 6-8 and still lift the trophy. Rather than chase another middling season after a last-place finish in 2024, he committed to a full rebuild—turning veterans into young stars, premium picks, and eventually landing franchise cornerstones like Patrick Mahomes, Josh Allen, CeeDee Lamb, and Tetairoa McMillan. Never afraid to make the blockbuster move, Bolo has built a reputation as one of the league's most active traders and biggest long-term thinkers. Whether he's tracking rivalries like they're official NFL records or planning three years ahead, Los Azules always seem to have a plan. With one of the league's deepest collections of young talent and future assets, Bolo is hoping his rebuild ends the same way his first season did—with a championship.",
      "photo": "/managers/bolo.png", // square ratio recommended (no larger than 500x500)
      "fantasyStart": null, // (optional) when did the manager start playing fantasy football
      "favoriteTeam": "dal", // (optional) favorite NFL team, (follows convention: nyj, sea, mia, etc.) MUST BE LOWERCASE
      "mode": "Win Now", // (optional) 'Win Now', 'Dynasty', or 'Rebuild' (anything else and you will need to add a new png to /static/ similar to the 'Rebuild.png' and 'Win Now.png' currently in there)
      "rival": {
        name: "Logan", // Can be anything (usually your rival's name)
        link: 3, // manager array number within this array, or null to link back to all managers page
        image: "/managers/logan.png", // either a specific manager photo or '/managers/everyone.png' or '/managers/question.png'
      },
      "favoritePlayer": 6786, // (optional) this corresponds to the Sleeper player ID (https://api.sleeper.app/v1/players/nfl)
      "valuePosition": "WR", // (optional) Favorite position (QB, WR, RB, TE, etc.)
      "rookieOrVets": "Vets", // (optional) 'Rookies' or 'Vets' (anything else and you will need to add a new png to /static/ similar to the 'Rookies.png' and 'Vets.png' currently in there)
      "philosophy": "All-Time Record: 13 - 29",  
      "philosophy23": "2023: (6-8) 1st 🏆",
      "philosophy24": "2024: (4-10) 10th",
      "philosophy25": "2025: (3-11) 7th",
      "philosophy26": null,
      "philosophy27": null,
      "tradingScale": 9, // 1 - 10
      "preferredContact": "Sleeper", // 'Text', 'WhatsApp', 'Sleeper', 'Email', 'Phone', 'Discord', and 'Carrier Pigeon' are currently supplied in the template
    },
        {
      "roster": 8,  // ID of the roster that the manager manages (look at the order of the power rankings graph)
      "managerID" : "854976092128251904",
      "name": "Luke",
      "tookOver": null, // (optional) used if a manager took over a team, delete this line or change to null otherwise
      "location": "Manteca, California", // (optional)
      "bio": "Luke, QB1, JUCO legend, and now San Jose State Spartans quarterback, gave TBD its first Division I athlete. As the league's only non-Portuguese member, he's embraced the role while building one of the youngest rosters in the league. After a rollercoaster 2025 season, Luke shocked everyone by turning a 6-8 squad into a championship game appearance. Powered by Kyle Pitts' legendary 50-point playoff explosion, the Northside Tec Trojans came within one win of a title before falling just short in the championship. Whether he's chasing upside, sending blockbuster trade offers, or trusting prospects before anyone else, one thing's certain—Luke is never afraid to bet on talent.",
      "photo": "/managers/luke.png", // square ratio recommended (no larger than 500x500)
      "fantasyStart": null, // (optional) when did the manager start playing fantasy football
      "favoriteTeam": "no", // (optional) favorite NFL team, (follows convention: nyj, sea, mia, etc.) MUST BE LOWERCASE
      "mode": "Win Now", // (optional) 'Win Now', 'Dynasty', or 'Rebuild' (anything else and you will need to add a new png to /static/ similar to the 'Rebuild.png' and 'Win Now.png' currently in there)
      "rival": {
        name: "Izzy", // Can be anything (usually your rival's name)
        link: 5, // manager array number within this array, or null to link back to all managers page
        image: "/managers/izzy.png", // either a specific manager photo or '/managers/everyone.png' or '/managers/question.png'
      },
      "favoritePlayer": 11559, // (optional) this corresponds to the Sleeper player ID (https://api.sleeper.app/v1/players/nfl)
      "valuePosition": "RB", // (optional) Favorite position (QB, WR, RB, TE, etc.)
      "rookieOrVets": "Vets", // (optional) 'Rookies' or 'Vets' (anything else and you will need to add a new png to /static/ similar to the 'Rookies.png' and 'Vets.png' currently in there)
      "philosophy": "All-Time Record: 22 - 20",
      "philosophy23": "2023: (11-3) 6th",
      "philosophy24": "2024: (5-9) 9th",
      "philosophy25": "2025: (6-8) 2nd 🥈",
      "philosophy26": null,
      "philosophy27": null,
      "tradingScale": 6, // 1 - 10
      "preferredContact": "Sleeper", // 'Text', 'WhatsApp', 'Sleeper', 'Email', 'Phone', 'Discord', and 'Carrier Pigeon' are currently supplied in the template
    },
        {
      "roster": 9,  // ID of the roster that the manager manages (look at the order of the power rankings graph)
      "managerID" : "865009922180509696",
      "name": "Daniel",
      "tookOver": null, // (optional) used if a manager took over a team, delete this line or change to null otherwise
      "location": "Turlock, California", // (optional)
      "bio": "Daniel, GM of the Avós All-Stars, has always believed passion could overcome projections. A Stan State alum and devoted Cristiano Ronaldo fan, he finally proved it in 2025, turning an 8-6 record and the No. 4 seed into one of the most unexpected championship runs in TBD history. Just when everyone counted him out, Daniel got hot at the perfect time. Led by veterans Jalen Hurts, Derrick Henry, Travis Kelce, and Brock Purdy, Avós All-Stars reminded the league that championships aren't won on paper. His roster may not always be the flashiest, but after lifting the trophy, Daniel earned something even better—the last laugh.",
      "photo": "/managers/daniel.png", // square ratio recommended (no larger than 500x500)
      "fantasyStart": null, // (optional) when did the manager start playing fantasy football
      "favoriteTeam": "sf", // (optional) favorite NFL team, (follows convention: nyj, sea, mia, etc.) MUST BE LOWERCASE
      "mode": "Win Now", // (optional) 'Win Now', 'Dynasty', or 'Rebuild' (anything else and you will need to add a new png to /static/ similar to the 'Rebuild.png' and 'Win Now.png' currently in there)
      "rival": {
        name: "Lucas", // Can be anything (usually your rival's name)
        link: 9, // manager array number within this array, or null to link back to all managers page
        image: "/managers/lucas.png", // either a specific manager photo or '/managers/everyone.png' or '/managers/question.png'
      },
      "favoritePlayer": 7569, // (optional) this corresponds to the Sleeper player ID (https://api.sleeper.app/v1/players/nfl)
      "valuePosition": "WR", // (optional) Favorite position (QB, WR, RB, TE, etc.)
      "rookieOrVets": "Vets", // (optional) 'Rookies' or 'Vets' (anything else and you will need to add a new png to /static/ similar to the 'Rookies.png' and 'Vets.png' currently in there)
      "philosophy": "All-Time Record: 27 - 15",
      "philosophy23": "2023: (11-3) 3rd 🥉",
      "philosophy24": "2024: (8-6) 5th",
      "philosophy25": "2025: (8-6) 1st 🏆",
      "philosophy26": null,
      "philosophy27": null,
      "tradingScale": 9, // 1 - 10
      "preferredContact": "Sleeper", // 'Text', 'WhatsApp', 'Sleeper', 'Email', 'Phone', 'Discord', and 'Carrier Pigeon' are currently supplied in the template
    },
        {
      "roster": 10,  // ID of the roster that the manager manages (look at the order of the power rankings graph)
      "managerID" : "871263782905794560",
      "name": "Lucas",
      "tookOver": null, // (optional) used if a manager took over a team, delete this line or change to null otherwise
      "location": "Turlock, California", // (optional)
      "bio": "Lucas, GM of the MidValley Vacas, might be the only man alive who gets more excited about a Kyle Juszczyk pancake block than a 50-yard touchdown. A true football junkie, Lucas treats dynasty like an NFL scouting department, building his roster around young talent and players he believes are destined to break out. Whether he's explaining why the Vacas "just need one more piece" or defending his latest sleeper, he's always got a plan. While the wins haven't matched the football knowledge just yet, nobody questions Lucas' passion for the game. Every offseason brings another 'master plan,' another sleeper prediction, and another reason to believe the Vacas are finally ready to take the next step.",
      "photo": "/managers/lucas.png", // square ratio recommended (no larger than 500x500)
      "fantasyStart": null, // (optional) when did the manager start playing fantasy football
      "favoriteTeam": "sf", // (optional) favorite NFL team, (follows convention: nyj, sea, mia, etc.) MUST BE LOWERCASE
      "mode": "Rebuild", // (optional) 'Win Now', 'Dynasty', or 'Rebuild' (anything else and you will need to add a new png to /static/ similar to the 'Rebuild.png' and 'Win Now.png' currently in there)
      "rival": {
        name: "Daniel", // Can be anything (usually your rival's name)
        link: 8, // manager array number within this array, or null to link back to all managers page
        image: "/managers/daniel.png", // either a specific manager photo or '/managers/everyone.png' or '/managers/question.png'
      },
      "favoritePlayer": 6803, // (optional) this corresponds to the Sleeper player ID (https://api.sleeper.app/v1/players/nfl)
      "valuePosition": "RB", // (optional) Favorite position (QB, WR, RB, TE, etc.)
      "rookieOrVets": "Vets", // (optional) 'Rookies' or 'Vets' (anything else and you will need to add a new png to /static/ similar to the 'Rookies.png' and 'Vets.png' currently in there)
      "philosophy": "All-Time Record: 15 - 27",
      "philosophy23": "2023: (4-10) 8th",
      "philosophy24": "2024: (6-8) 7th",
      "philosophy25": "2025: (5-9) 8th",
      "philosophy26": null,
      "philosophy27": null,
      "tradingScale": 6, // 1 - 10
      "preferredContact": "Sleeper", // 'Text', 'WhatsApp', 'Sleeper', 'Email', 'Phone', 'Discord', and 'Carrier Pigeon' are currently supplied in the template
    },
  ]
  
  
  /*   !!  !!  IMPORTANT  !!  !! */
  /*
  Below is the most up to-date version of a manager. Please leave this commented out
  and don't delete it. This will be updated if any fields are added, removed or changed
  and will allow updates without causing merge conflicts
  */
  
    // {
    //   "roster": 3,  // (DEPRECATED! Don't use this anymore) ID of the roster that the manager manages (look at the order of the power rankings graph)
    //   "managerID": "12345678",  // the user's manager ID, go to https://api.sleeper.app/v1/league/<your_league_id>/users to find user IDs (you can use older leagueIDs to find user IDs for managers that are no longer in the league)
    //   "name": "Your Name",
    //   "tookOver": 2020, // (DEPRECATED! You don't need to use this anymore) (optional) used if a manager took over a team, delete this line or change to null otherwise
    //   "location": "Brooklyn", // (optional)
    //   "bio": "Lorem ipsum...",
    //   "photo": "/managers/name.jpg", // square ratio recommended (no larger than 500x500)
    //   "fantasyStart": 2014, // (optional) when did the manager start playing fantasy football
    //   "favoriteTeam": "nyj", // (optional) favorite NFL team, (follows convention: nyj, sea, mia, etc.) MUST BE LOWERCASE
    //   "mode": "Win Now", // (optional) 'Win Now', 'Dynasty', or 'Rebuild' (anything else and you will need to add a new png to /static/ similar to the 'Rebuild.png' and 'Win Now.png' currently in there)
    //   "rival": {
    //     name: "Rival", // Can be anything (usually your rival's name)
    //     link: 6, // manager array number within this array, or null to link back to all managers page
    //     image: "/managers/rival.jpg", // either a specific manager photo or '/managers/everyone.png' or '/managers/question.png'
    //   },
    //   "favoritePlayer": 1426, // (optional) this corresponds to the Sleeper player ID (https://api.sleeper.app/v1/players/nfl)
    //   "valuePosition": "WR", // (optional) Favorite position (QB, WR, RB, TE, etc.)
    //   "rookieOrVets": "Rookies", // (optional) 'Rookies' or 'Vets' (anything else and you will need to add a new png to /static/ similar to the 'Rookies.png' and 'Vets.png' currently in there)
    //   "philosophy": "Your fantasy team's philosophy", // (optional)
    //   "tradingScale": 10, // 1 - 10 (optional)
    //   "preferredContact": "Text",  // (optional) 'Text', 'WhatsApp', 'Sleeper', 'Email', 'Phone', 'Discord', and 'Carrier Pigeon' are currently supplied in the template
    // },
    
