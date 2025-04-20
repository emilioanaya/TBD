/*   STEP 1   */
export const leagueID = "1181007731724742656"; // your league ID
export const leagueName = "The Big Dynasty"; // your league name
export const dues = 75; // (optional) used in template constitution page
export const dynasty = true; // true for dynasty leagues, false for redraft and keeper
export const enableBlog = true; // requires VITE_CONTENTFUL_ACCESS_TOKEN and VITE_CONTENTFUL_SPACE environment variables

/*   STEP 2   */
export const homepageText = `
  <p>The TBD Dynasty League isn't just any fantasy football league — it’s the greatest Portuguese fantasy football league on the planet. Founded in 2023, TBD brings together ten fierce competitors battling year-round in a Superflex, PPR, Tight End Premium format that rewards bold trades, deep scouting, and dynasty-level strategy.</p>
  <p>In its inaugural season, Los Azules (formerly My Diggs Small), led by an unimaginable wide receiver room of CeeDee Lamb, Justin Jefferson and Davante Adams, stunned the league by storming from a 6-8 regular season finish to win it all in the playoffs. The following year, Norcal Seleçáo rose to power, claiming the 2024 championship behind a loaded roster headlined by Trey McBride, Ja'Marr Chase, and rookie Malik Nabers.</p>
  <p>TBD isn’t just about the trophies — it’s about long-term rivalries, blockbuster trades, and a tight-knit community with Portuguese roots and plenty of trash talk. Every offseason move matters, every draft pick counts, and every matchup adds fuel to the fire.</p>
  <p>Whether you're a founding member or a curious onlooker, welcome to TBD — where legends are built, rebuilt, and sometimes tank for picks.</p>
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
      "bio": "JD, proud GM of the Azorean Armada and even prouder Portagee, models his franchise after his beloved Rams — living by the Les Snead mantra: “F*** them picks.” And to be fair, it’s working. After hitting on Ladd McConkey and Brian Thomas Jr. in this year’s draft, JD reminded the league that even if he doesn’t say much, his squad still speaks volumes. Of course, sending JD a trade is like shouting into the Atlantic — you might hear an echo in a few weeks, or you might just get left on read. But don’t let the silence fool you. JD’s always lurking, always cooking something up, and always one Rams meltdown away from rebranding the Armada to “Azorean Rebuild.” With a big personality, a bigger nose, and a quietly stacked roster, JD’s looking to bring some real silverware to the islands — or at least win one more trade than Daniel.",
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
      "philosophy": "All-Time Record: 11 - 17",
      "philosophy23": "2023: (4-10) 7th",
      "philosophy24": "2024: (7-7) 3rd 🥉",
      "philosophy25": null,
      "philosophy26": null,
      "tradingScale": 4, // 1 - 10
      "preferredContact": "Sleeper", // 'Text', 'WhatsApp', 'Sleeper', 'Email', 'Phone', 'Discord', and 'Carrier Pigeon' are currently supplied in the template
    },
    {
      "roster": 2,  // ID of the roster that the manager manages (look at the order of the power rankings graph)
      "managerID" : "594665552094486528",
      "name": "Grant",
      "tookOver": null, // (optional) used if a manager took over a team, delete this line or change to null otherwise
      "location": "Manteca, California", // (optional)
      "bio": "The tallest tolo in the league and the undisputed QB hoarder, Grant has been stacking signal-callers like he’s prepping for a Superflex apocalypse. After locking in his “big boy job” over a year ago (and still proudly repping the hydroflask lunch life), he’s turned his grown-up discipline into a dynasty machine. With a core of Josh Allen, Caleb Williams, and a WR room that hits harder than Tyreek on a slant, The .02ers have made deep playoff runs in back-to-back years — but still no title. Will 2025 be the year he finally cashes in those 2nd-round picks and recycled tight ends for the crown?",
      "photo": "/managers/grant.png", // square ratio recommended (no larger than 500x500)
      "fantasyStart": null, // (optional) when did the manager start playing fantasy football
      "favoriteTeam": "lv", // (optional) favorite NFL team, (follows convention: nyj, sea, mia, etc.) MUST BE LOWERCASE
      "mode": "Dynasty", // (optional) 'Win Now', 'Dynasty', or 'Rebuild' (anything else and you will need to add a new png to /static/ similar to the 'Rebuild.png' and 'Win Now.png' currently in there)
      "rival": {
        name: "Gavin", // Can be anything (usually your rival's name)
        link: 4, // manager array number within this array, or null to link back to all managers page
        image: "/managers/gavin.png", // either a specific manager photo or '/managers/everyone.png' or '/managers/question.png'
      },
      "favoritePlayer": 5955, // (optional) this corresponds to the Sleeper player ID (https://api.sleeper.app/v1/players/nfl)
      "valuePosition": "QB", // (optional) Favorite position (QB, WR, RB, TE, etc.)
      "rookieOrVets": "Vets", // (optional) 'Rookies' or 'Vets' (anything else and you will need to add a new png to /static/ similar to the 'Rookies.png' and 'Vets.png' currently in there)
      "philosophy": "All-Time Record: 20 - 8",
      "philosophy23": "2023: (12-2) 2nd 🥈",
      "philosophy24": "2024: (8-6) 4th",
      "philosophy25": null,
      "philosophy26": null,
      "tradingScale": 10, // 1 - 10
      "preferredContact": "Sleeper", // 'Text', 'WhatsApp', 'Sleeper', 'Email', 'Phone', 'Discord', and 'Carrier Pigeon' are currently supplied in the template
    },
    {
      "roster": 3,  // ID of the roster that the manager manages (look at the order of the power rankings graph)
      "managerID" : "608428302964686848",
      "name": "Justin",
      "tookOver": null, // (optional) used if a manager took over a team, delete this line or change to null otherwise
      "location": "Tulare, California", // (optional)
      "bio": "Justin, GM of the Oakdale Carpetbaggers and trumpet maestro of the Filarmonica Portuguesa de Tulare, enters every TBD season with the same energy he brought to his frat days — loud entrances, bold claims, and a game plan that may or may not have been made five minutes before the draft. A natural hype man, Justin can convince you his bench RB is a breakout star… until he’s dropped a week later for someone worse. Locked in an eternal rivalry with JD, the Azorean Armada vs. the Carpetbaggers has become less about fantasy football and more about who can out-stubborn the other on trade negotiations. Both teams have their moments, but Justin swears this is the year he finishes on top — as long as JD doesn’t sneak in another random Week 17 win. With a roster that always has potential and a trumpet case full of confidence, Justin’s marching toward TBD greatness — even if the rest of the league is still waiting on him to prove it.",
      "photo": "/managers/justin.png", // square ratio recommended (no larger than 500x500)
      "fantasyStart": null, // (optional) when did the manager start playing fantasy football
      "favoriteTeam": "lar", // (optional) favorite NFL team, (follows convention: nyj, sea, mia, etc.) MUST BE LOWERCASE
      "mode": "Win Now", // (optional) 'Win Now', 'Dynasty', or 'Rebuild' (anything else and you will need to add a new png to /static/ similar to the 'Rebuild.png' and 'Win Now.png' currently in there)
      "rival": {
        name: "JD", // Can be anything (usually your rival's name)
        link: 0, // manager array number within this array, or null to link back to all managers page
        image: "/managers/jd.png", // either a specific manager photo or '/managers/everyone.png' or '/managers/question.png'
      },
      "favoritePlayer": 6904, // (optional) this corresponds to the Sleeper player ID (https://api.sleeper.app/v1/players/nfl)
      "valuePosition": "WR", // (optional) Favorite position (QB, WR, RB, TE, etc.)
      "rookieOrVets": "Rookies", // (optional) 'Rookies' or 'Vets' (anything else and you will need to add a new png to /static/ similar to the 'Rookies.png' and 'Vets.png' currently in there)
      "philosophy": "All-Time Record: 11 - 17",
      "philosophy23": "2023: (5-9) 4th",
      "philosophy24": "2024: (6-8) 6th",
      "philosophy25": null,
      "philosophy26": null,
      "tradingScale": 3, // 1 - 10
      "preferredContact": "Sleeper", // 'Text', 'WhatsApp', 'Sleeper', 'Email', 'Phone', 'Discord', and 'Carrier Pigeon' are currently supplied in the template
    },
   {
      "roster": 4,  // ID of the roster that the manager manages (look at the order of the power rankings graph)
      "managerID" : "722593452524650496",
      "name": "Logan",
      "tookOver": null, // (optional) used if a manager took over a team, delete this line or change to null otherwise
      "location": "Riverbank, California", // (optional)
      "bio": "Logan, aka “The Runners” GM, aka the Valley’s own EMT1, has built his team the same way he drives that ambulance — fast, reckless, and occasionally pointed in the right direction. Known for once calling Kenny McIntosh a “can’t-miss prospect,” Logan has bounced back with a shockingly solid 2025 draft, somehow stumbling into Jayden Daniels and Brock Bowers like he meant to do it. This 4-sport “athlete” (allegedly) can shotgun a Michelob quicker than he responds to trade offers — unless it involves selling Jahmyr Gibbs for bench depth and vibes. He’s the league’s most slept-on contender, mostly because we’ve all forgotten he’s still in the league until he pops off in Week 12. With a roster that finally has some juice and a mouth that’s always running, Logan’s aiming to prove he’s more than just midvalley ambulance speed — he’s championship-bound chaos.",
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
      "philosophy": "All-Time Record: 9 - 19", 
      "philosophy23": "2023: (3-11) 10th",
      "philosophy24": "2024: (6-8) 8th",
      "philosophy25": null,
      "philosophy26": null,
      "tradingScale": 8, // 1 - 10
      "preferredContact": "Sleeper", // 'Text', 'WhatsApp', 'Sleeper', 'Email', 'Phone', 'Discord', and 'Carrier Pigeon' are currently supplied in the template
    },
  {
      "roster": 5,  // ID of the roster that the manager manages (look at the order of the power rankings graph)
      "managerID" : "732848788863037440",
      "name": "Gavin",
      "tookOver": null, // (optional) used if a manager took over a team, delete this line or change to null otherwise
      "location": "Manteca, California", // (optional)
      "bio": "The 2024 TBD champ, walking hot take factory, and only person alive who still owns a Derek Carr Raiders jersey in a frame. Gavin silenced the haters last season with a monster squad featuring Mahomes, Chase, Gibbs, and Malik Nabers — and now with Bijan and Andrews onboard after fleecing Luke, he’s officially operating on villain mode. While the Raiders spent last year inventing new ways to lose, Gavin found peace in the one place that never let him down: Ja’Marr Chase. But even sweeter? JSN finally popped off late last year, and now with Lockett and DK gone, Gavin’s long-term WR1 delusion is… horrifyingly valid. He still rejects trades like it’s a personal offense and swears Rattler will be a thing, but at this point, who’s gonna argue? He’s got the curls, the ring, and a fantasy empire.",
      "photo": "/managers/gavin.png", // square ratio recommended (no larger than 500x500)
      "fantasyStart": null, // (optional) when did the manager start playing fantasy football
      "favoriteTeam": "lv", // (optional) favorite NFL team, (follows convention: nyj, sea, mia, etc.) MUST BE LOWERCASE
      "mode": "Dynasty", // (optional) 'Win Now', 'Dynasty', or 'Rebuild' (anything else and you will need to add a new png to /static/ similar to the 'Rebuild.png' and 'Win Now.png' currently in there)
      "rival": {
        name: "Grant", // Can be anything (usually your rival's name)
        link: 1, // manager array number within this array, or null to link back to all managers page
        image: "/managers/grant.png", // either a specific manager photo or '/managers/everyone.png' or '/managers/question.png'
      },
      "favoritePlayer": 11632, // (optional) this corresponds to the Sleeper player ID (https://api.sleeper.app/v1/players/nfl)
      "valuePosition": "WR", // (optional) Favorite position (QB, WR, RB, TE, etc.)
      "rookieOrVets": "Vets", // (optional) 'Rookies' or 'Vets' (anything else and you will need to add a new png to /static/ similar to the 'Rookies.png' and 'Vets.png' currently in there)
      "philosophy": "All-Time Record: 14 - 14",  
      "philosophy23": "2023: (4-10) 9th",
      "philosophy24": "2024: (10-4) 1st 🏆",
      "philosophy25": null,
      "philosophy26": null,
      "tradingScale": 8, // 1 - 10
      "preferredContact": "Sleeper", // 'Text', 'WhatsApp', 'Sleeper', 'Email', 'Phone', 'Discord', and 'Carrier Pigeon' are currently supplied in the template
    },
  {
      "roster": 6,  // ID of the roster that the manager manages (look at the order of the power rankings graph)
      "managerID" : "733091325091635200",
      "name": "Izzy",
      "tookOver": null, // (optional) used if a manager took over a team, delete this line or change to null otherwise
      "location": "Oakdale, California", // (optional)
      "bio": "The 49ers aren’t the only ones rebuilding on the fly — our fearless commish shipped off both Lamar Jackson and Justin Jefferson this offseason like a man with a vision… or a vendetta. Now entering year three at the helm of TBD, Izzy’s still balancing trade chaos, league drama, and his baritone sax duties with the calm of someone who always ends up in the playoffs anyway. After falling just short in 2024’s championship, he’s back with a roster full of RBs, 2027 draft picks, and enough old WRs to host a retirement ceremony. He may give off Roger Goodell energy, but let’s be real — no one else is eating sopas, cracking beers, and keeping this league running like Izzy.",
      "photo": "/managers/izzy.png", // square ratio recommended (no larger than 500x500)
      "fantasyStart": null, // (optional) when did the manager start playing fantasy football
      "favoriteTeam": "sf", // (optional) favorite NFL team, (follows convention: nyj, sea, mia, etc.) MUST BE LOWERCASE
      "mode": "Win Now", // (optional) 'Win Now', 'Dynasty', or 'Rebuild' (anything else and you will need to add a new png to /static/ similar to the 'Rebuild.png' and 'Win Now.png' currently in there)
      "rival": {
        name: "Luke", // Can be anything (usually your rival's name)
        link: 7, // manager array number within this array, or null to link back to all managers page
        image: "/managers/luke.png", // either a specific manager photo or '/managers/everyone.png' or '/managers/question.png'
      },
      "favoritePlayer": 8183, // (optional) this corresponds to the Sleeper player ID (https://api.sleeper.app/v1/players/nfl)
      "valuePosition": "RB", // (optional) Favorite position (QB, WR, RB, TE, etc.)
      "rookieOrVets": "Vets", // (optional) 'Rookies' or 'Vets' (anything else and you will need to add a new png to /static/ similar to the 'Rookies.png' and 'Vets.png' currently in there)
      "philosophy": "All-Time Record: 20 - 8",
      "philosophy23": "2023: (10-4) 5th",
      "philosophy24": "2024: (10-4) 2nd 🥈",
      "philosophy25": null,
      "philosophy26": null,
      "tradingScale": 7, // 1 - 10
      "preferredContact": "Sleeper", // 'Text', 'WhatsApp', 'Sleeper', 'Email', 'Phone', 'Discord', and 'Carrier Pigeon' are currently supplied in the template
    },{
      "roster": 7,  // ID of the roster that the manager manages (look at the order of the power rankings graph)
      "managerID" : "733139077938925568",
      "name": "Bolo",
      "tookOver": null, // (optional) used if a manager took over a team, delete this line or change to null otherwise
      "location": "Elk Grove, California", // (optional)
      "bio": "From champion in 2023 to Toilet Bowl champ in 2024, Bolo’s team crashed harder than Dak in a primetime game. But don’t worry — he’s already spun it as part of “the rebuild.” After trading away half his roster for draft picks and future vibes, Bolo pulled off a classic masterclass: flipping JJ McCarthy and two premium picks just to stack Lamar with Zay… who he still doesn’t have. Los Azules are once again armed with more firsts than Daniel has WRs who peaked in 2021. Whether he’s scheming blockbuster trades, tracking rivalry win-loss records like it’s his thesis, or trying to justify Tank Bigsby’s upside for the 7th time, one thing’s clear — Bolo’s always cooking. Just don’t ask him to send the first offer.",
      "photo": "/managers/bolo.png", // square ratio recommended (no larger than 500x500)
      "fantasyStart": null, // (optional) when did the manager start playing fantasy football
      "favoriteTeam": "dal", // (optional) favorite NFL team, (follows convention: nyj, sea, mia, etc.) MUST BE LOWERCASE
      "mode": "Rebuild", // (optional) 'Win Now', 'Dynasty', or 'Rebuild' (anything else and you will need to add a new png to /static/ similar to the 'Rebuild.png' and 'Win Now.png' currently in there)
      "rival": {
        name: "Logan", // Can be anything (usually your rival's name)
        link: 3, // manager array number within this array, or null to link back to all managers page
        image: "/managers/logan.png", // either a specific manager photo or '/managers/everyone.png' or '/managers/question.png'
      },
      "favoritePlayer": 6786, // (optional) this corresponds to the Sleeper player ID (https://api.sleeper.app/v1/players/nfl)
      "valuePosition": "WR", // (optional) Favorite position (QB, WR, RB, TE, etc.)
      "rookieOrVets": "Rookies", // (optional) 'Rookies' or 'Vets' (anything else and you will need to add a new png to /static/ similar to the 'Rookies.png' and 'Vets.png' currently in there)
      "philosophy": "All-Time Record: 10 - 18",  
      "philosophy23": "2023: (6-8) 1st 🏆",
      "philosophy24": "2024: (4-10) 10th",
      "philosophy25": null,
      "philosophy26": null,
      "tradingScale": 9, // 1 - 10
      "preferredContact": "Sleeper", // 'Text', 'WhatsApp', 'Sleeper', 'Email', 'Phone', 'Discord', and 'Carrier Pigeon' are currently supplied in the template
    },
        {
      "roster": 8,  // ID of the roster that the manager manages (look at the order of the power rankings graph)
      "managerID" : "854976092128251904",
      "name": "Luke",
      "tookOver": null, // (optional) used if a manager took over a team, delete this line or change to null otherwise
      "location": "Manteca, California", // (optional)
      "bio": "QB1. JUCO icon. Future Rainbow Warrior. Luke officially committed to the University of Hawai’i to play quarterback, meaning TBD now has a real D1 athlete in the group — and he still couldn’t win a Toilet Bowl. As the league’s only non-Portuguese member, Luke continues to shoulder the emotional weight of being “the white boy,” proudly repping his alleged 3% Portuguese like it’s a Superflex bonus. Fresh off the blockbuster trade where he gave up Bijan and Andrews for Achane, Zay Flowers, and Kyle Pitts (who may or may not be legally missing), Luke has built the most chaotic youth project in the league. His roster is a fever dream of breakout candidates, TE clutter, and film-grinder prospects nobody else ranked — and somehow, he’s convinced he’s winning the long game. When he’s not throwing touchdowns in paradise or sending unhinged trade offers, Luke is watching Saints games and praying Derek Carr doesn’t throw a hospital ball to Chris Olave. One thing’s for sure: the man bleeds upside… and TE depth.",
      "photo": "/managers/luke.png", // square ratio recommended (no larger than 500x500)
      "fantasyStart": null, // (optional) when did the manager start playing fantasy football
      "favoriteTeam": "no", // (optional) favorite NFL team, (follows convention: nyj, sea, mia, etc.) MUST BE LOWERCASE
      "mode": "Rebuild", // (optional) 'Win Now', 'Dynasty', or 'Rebuild' (anything else and you will need to add a new png to /static/ similar to the 'Rebuild.png' and 'Win Now.png' currently in there)
      "rival": {
        name: "Izzy", // Can be anything (usually your rival's name)
        link: 5, // manager array number within this array, or null to link back to all managers page
        image: "/managers/izzy.png", // either a specific manager photo or '/managers/everyone.png' or '/managers/question.png'
      },
      "favoritePlayer": 2028, // (optional) this corresponds to the Sleeper player ID (https://api.sleeper.app/v1/players/nfl)
      "valuePosition": "RB", // (optional) Favorite position (QB, WR, RB, TE, etc.)
      "rookieOrVets": "Vets", // (optional) 'Rookies' or 'Vets' (anything else and you will need to add a new png to /static/ similar to the 'Rookies.png' and 'Vets.png' currently in there)
      "philosophy": "All-Time Record: 16 - 12",
      "philosophy23": "2023: (11-3) 6th",
      "philosophy24": "2024: (5-9) 9th",
      "philosophy25": null,
      "philosophy26": null,
      "tradingScale": 6, // 1 - 10
      "preferredContact": "Sleeper", // 'Text', 'WhatsApp', 'Sleeper', 'Email', 'Phone', 'Discord', and 'Carrier Pigeon' are currently supplied in the template
    },
        {
      "roster": 9,  // ID of the roster that the manager manages (look at the order of the power rankings graph)
      "managerID" : "865009922180509696",
      "name": "Daniel",
      "tookOver": null, // (optional) used if a manager took over a team, delete this line or change to null otherwise
      "location": "Turlock, California", // (optional)
      "bio": "Daniel, GM of the Avós All-Stars, has the heart of a champion… and the record of someone still figuring out how fantasy football works. A proud Stan State alum and Cristiano Ronaldo disciple, Daniel brings unmatched passion to TBD — unfortunately, it’s for the wrong kind of football. His knowledge of the Portuguese National Team is elite, but sadly, João Félix doesn’t get PPR points. Despite fielding a roster that feels like it was drafted straight off vibes and FIFA ratings, Daniel somehow remains competitive. His new crib in Stanislaus County is still waiting on its first piece of fantasy hardware — but hey, at least it has room for all his CR7 posters. With his Avós in the stands and Ronaldo in his heart, Daniel hopes this is finally the year he brings glory to the most Portuguese team in TBD.",
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
      "philosophy": "All-Time Record: 19 - 9",
      "philosophy23": "2023: (11-3) 3rd 🥉",
      "philosophy24": "2024: (8-6) 5th",
      "philosophy25": null,
      "philosophy26": null,
      "tradingScale": 9, // 1 - 10
      "preferredContact": "Sleeper", // 'Text', 'WhatsApp', 'Sleeper', 'Email', 'Phone', 'Discord', and 'Carrier Pigeon' are currently supplied in the template
    },
        {
      "roster": 10,  // ID of the roster that the manager manages (look at the order of the power rankings graph)
      "managerID" : "871263782905794560",
      "name": "Lucas",
      "tookOver": null, // (optional) used if a manager took over a team, delete this line or change to null otherwise
      "location": "Turlock, California", // (optional)
      "bio": "Lucas, GM of the Midvalley Vacas, might be the only man alive who thinks watching Kyle Juszczyk pancakes is the key to dynasty success. A fullback enthusiast stuck in a wide receiver era, Lucas somehow spends more time scouting lead blockers than actual fantasy starters. And while most of us use Sleeper to set lineups, Lucas uses it to rewatch Bucky Irving highlights like it’s game tape. Between dodging Daniel’s football advice and explaining why the Vacas “just need one more piece,” Lucas continues to make draft picks based on vibes, Portuguese bias, and whether a guy would do well in futsal. Despite being TBD’s answer to Mike McDaniel without the winning, Lucas is determined to prove this year that Juszczyk tape and alto sax solos are all part of the master plan.",
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
      "philosophy": "All-Time Record: 10 - 18",
      "philosophy23": "2023: (4-10) 8th",
      "philosophy24": "2024: (6-8) 7th",
      "philosophy25": null,
      "philosophy26": null,
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
    
