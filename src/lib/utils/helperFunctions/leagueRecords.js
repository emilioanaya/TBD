import { getLeagueData } from './leagueData';
import { leagueID } from '$lib/utils/leagueInfo';
import { getNflState } from './nflState';
import { getLeagueRosters } from './leagueRosters';
import { waitForAll } from './multiPromise';

import { get } from 'svelte/store';
import { records } from '$lib/stores';

import {
	getManagers,
	round,
	sortHighAndLow
} from './universalFunctions';

import { Records } from '$lib/utils/dataClasses';
import { getBrackets } from './leagueBrackets';

import { browser } from '$app/environment';


/**
 * Get all league records.
 */
export const getLeagueRecords = async (
	refresh = false
) => {

	/*
	 * Use records already loaded into the store.
	 */
	if(get(records).leagueWeekHighs) {

		return get(records);

	}


	/*
	 * Check localStorage unless this is
	 * an explicit refresh.
	 */
	if(!refresh && browser) {

		const stored =
			localStorage.getItem('records');


		if(stored) {

			const localRecords =
				JSON.parse(stored);


			if(
				localRecords &&
				localRecords.playoffData
			) {

				localRecords.stale =
					true;

				return localRecords;

			}

		}

	}


	/*
	 * Get current NFL state.
	 */
	const nflState =
		await getNflState()
			.catch(
				err =>
					console.error(err)
			);


	let week = 0;


	if(
		nflState?.season_type ===
		'regular'
	) {

		week =
			nflState.week - 1;

	}
	else if(
		nflState?.season_type ===
		'post'
	) {

		week = 18;

	}


	/*
	 * Start with current league.
	 */
	let curSeason =
		leagueID;


	let currentYear;
	let lastYear;


	const regularSeason =
		new Records();


	let playoffRecords =
		new Records();


	/*
	 * =========================
	 * LOOP THROUGH ALL SEASONS
	 * =========================
	 */

	while(
		curSeason &&
		curSeason !== 0
	) {

		const [
			rosterRes,
			leagueData
		] =
			await waitForAll(

				getLeagueRosters(
					curSeason
				),

				getLeagueData(
					curSeason
				)

			)
			.catch(
				err =>
					console.error(err)
			);


		if(
			!rosterRes ||
			!leagueData
		) {

			break;

		}


		const rosters =
			rosterRes.rosters;


		/*
		 * For completed seasons,
		 * process the full regular season.
		 */
		if(
			leagueData.status ===
				'complete'
			||
			week >
				leagueData.settings
					.playoff_week_start - 1
		) {

			week = 99;

		}


		/*
		 * =========================
		 * REGULAR SEASON
		 * =========================
		 */

		const {

			season,
			year

		} =
			await processRegularSeason({

				leagueData,
				rosters,
				curSeason,
				week,
				regularSeason

			});


		/*
		 * =========================
		 * PLAYOFFS
		 * =========================
		 */

		const playoffResult =
			await processPlayoffs({

				year,
				curSeason,
				week,
				playoffRecords,
				rosters

			);


		if(playoffResult) {

			playoffRecords =
				playoffResult;

		}


		lastYear =
			year;


		if(
			!currentYear &&
			year
		) {

			currentYear =
				year;

		}


		/*
		 * Move to previous season.
		 */
		curSeason =
			season;

	}


	/*
	 * Finalize records.
	 */
	regularSeason.finalizeAllTimeRecords({

		currentYear,
		lastYear

	});


	playoffRecords.finalizeAllTimeRecords({

		currentYear,
		lastYear

	});


	/*
	 * Keep current / last year information.
	 */
	playoffRecords.currentYear =
		regularSeason.currentYear;

	playoffRecords.lastYear =
		regularSeason.lastYear;


	const regularSeasonData =
		regularSeason.returnRecords();


	const playoffData =
		playoffRecords.returnRecords();


	const recordsData = {

		regularSeasonData,
		playoffData

	};


	/*
	 * Save fresh records.
	 */
	if(browser) {

		localStorage.setItem(
			'records',
			JSON.stringify(
				recordsData
			)
		);


		records.update(
			() =>
				recordsData
		);

	}


	return recordsData;

};


/**
 * =========================
 * PROCESS REGULAR SEASON
 * =========================
 */

const processRegularSeason = async ({
	rosters,
	leagueData,
	curSeason,
	week,
	regularSeason
}) => {

	const year =
		parseInt(
			leagueData.season
		);


	if(
		leagueData.status ===
			'complete'
		||
		week >
			leagueData.settings
				.playoff_week_start - 1
	) {

		week =
			leagueData.settings
				.playoff_week_start - 1;

	}


	for(
		const rosterID
		in rosters
	) {

		analyzeRosters({

			year,
			roster:
				rosters[rosterID],
			regularSeason

		});

	}


	const matchupsPromises = [];


	let startWeek =
		parseInt(
			week
		);


	while(week > 0) {

		matchupsPromises.push(

			fetch(
				`https://api.sleeper.app/v1/league/${curSeason}/matchups/${week}`,
				{
					compress: true
				}
			)

		);

		week--;

	}


	const matchupsRes =
		await waitForAll(
			...matchupsPromises
		)
		.catch(
			err =>
				console.error(err)
		);


	const matchupsJson =
		await waitForAll(
			...matchupsRes.map(
				res =>
					res.json()
			)
		)
		.catch(
			err =>
				console.error(err)
		);


	const matchupData =
		matchupsJson;


	/*
	 * Process regular-season
	 * matchups.
	 */
	const matchupDifferentials = [];


	for(
		const matchupWeek
		of matchupData
	) {

		processMatchups({

			matchupWeek,
			seasonPointsRecord: [],
			record: regularSeason,
			startWeek,
			matchupDifferentials,
			year

		});


		startWeek--;

	}


	return {

		season:
			leagueData.previous_league_id,

		year

	};

};


/**
 * =========================
 * ANALYZE ROSTERS
 * =========================
 */

const analyzeRosters = ({
	year,
	roster,
	regularSeason
}) => {

	const rosterID =
		roster.roster_id;


	const managers =
		getManagers(
			roster
		);


	if(
		roster.settings.wins === 0 &&
		roster.settings.ties === 0 &&
		roster.settings.losses === 0
	) {

		return;

	}


	const wins =
		roster.settings.wins || 0;

	const losses =
		roster.settings.losses || 0;

	const ties =
		roster.settings.ties || 0;


	const fptsFor =
		roster.settings.fpts || 0;

	const fptsAgainst =
		roster.settings.fpts_against || 0;


	const games =
		wins +
		losses +
		ties;


	const fptsPerGame =
		games
			? round(
				fptsFor /
				games
			)
			: 0;


	regularSeason.updateManagerRecord(
		managers,
		{

			rosterID,
			year,

			wins,
			losses,
			ties,

			fptsPerGame,

			fptsFor,
			fptsAgainst,

			potentialPoints: 0,
			pOGames: 0,
			byes: 0,

		}
	);

};


/**
 * =========================
 * PLAYOFF PROCESSING
 * =========================
 */

const processPlayoffs = async ({
	curSeason,
	playoffRecords,
	year,
	week,
	rosters
}) => {

	const {

		playoffsStart,
		playoffRounds,
		champs

	} =
		await getBrackets(
			curSeason
		);


	/*
	 * Season has not reached playoffs.
	 */
	if(
		week <= playoffsStart ||
		!year
	) {

		return null;

	}


	let seasonPointsRecord = [];
	let matchupDifferentials = [];
	let postSeasonData = {};


	/*
	 * =========================
	 * DETERMINE CHAMPIONSHIP
	 * =========================
	 */

	const championshipMatches =
		(champs?.bracket || [])
			.flat(Infinity)
			.filter(
				match =>
					match &&
					match.r &&
					match.w
			);


	let championID =
		null;


	const finalists =
		new Set();


	if(
		championshipMatches.length
	) {

		const finalRound =
			Math.max(
				...championshipMatches.map(
					match =>
						Number(
							match.r
						)
				)
			);


		const championshipMatch =
			championshipMatches.find(
				match =>
					Number(
						match.r
					) ===
					finalRound
			);


		if(championshipMatch) {

			championID =
				String(
					championshipMatch.w
				);


			if(
				championshipMatch.t1 !==
					null &&
				championshipMatch.t1 !==
					undefined
			) {

				finalists.add(
					String(
						championshipMatch.t1
					)
				);

			}


			if(
				championshipMatch.t2 !==
					null &&
				championshipMatch.t2 !==
					undefined
			) {

				finalists.add(
					String(
						championshipMatch.t2
					)
				);

			}

		}

	}


	/*
	 * =========================
	 * CHAMPIONSHIP BRACKET
	 * =========================
	 */

	const champBracket =
		digestBracket({

			bracket:
				champs.bracket,

			playoffsStart,

			matchupDifferentials,

			postSeasonData,

			playoffRecords,

			playoffRounds,

			consolation:
				false,

			seasonPointsRecord,

			year

		});


	postSeasonData =
		champBracket.postSeasonData;

	seasonPointsRecord =
		champBracket.seasonPointsRecord;

	playoffRecords =
		champBracket.playoffRecords;

	matchupDifferentials =
		champBracket.matchupDifferentials;


	/*
	 * =========================
	 * CONSOLATION BRACKET
	 * =========================
	 */

	const consolationBracket =
		digestBracket({

			bracket:
				champs.consolations,

			playoffsStart,

			matchupDifferentials,

			postSeasonData,

			playoffRecords,

			playoffRounds,

			consolation:
				true,

			seasonPointsRecord,

			year

		});


	postSeasonData =
		consolationBracket.postSeasonData;

	seasonPointsRecord =
		consolationBracket.seasonPointsRecord;

	playoffRecords =
		consolationBracket.playoffRecords;

	matchupDifferentials =
		consolationBracket.matchupDifferentials;


	/*
	 * =========================
	 * SAVE PLAYOFF DATA
	 * =========================
	 */

	for(
		const rosterID
		in postSeasonData
	) {

		const pSD =
			postSeasonData[
				rosterID
			];


		const games =
			pSD.wins +
			pSD.losses +
			pSD.ties;


		const fptsPerGame =
			games
				? round(
					pSD.fptsFor /
					games
				)
				: 0;


		pSD.fptsPerGame =
			fptsPerGame;

		pSD.year =
			year;

		pSD.rosterID =
			rosterID;


		/*
		 * Regular-season seed.
		 */
		pSD.seed =
			rosters[
				rosterID
			]?.settings?.rank ??
			null;


		/*
		 * Championship information.
		 */
		pSD.champion =
			championID !== null &&
			String(rosterID) ===
				championID;


		pSD.finals =
			finalists.has(
				String(rosterID)
			);


		/*
		 * Season-long playoff points.
		 */
		playoffRecords.addSeasonLongPoints({

			fpts:
				pSD.fptsFor,

			fptsPerGame,

			year,

			rosterID

		});


		/*
		 * Manager playoff record.
		 */
		const managers =
			getManagers(
				rosters[
					rosterID
				]
			);


		playoffRecords.updateManagerRecord(
			managers,
			pSD
		);

	}


	/*
	 * Add matchup records.
	 */
	const [
		biggestBlowouts,
		closestMatchups
	] =
		sortHighAndLow(
			matchupDifferentials,
			'differential'
		);


	const [
		seasonPointsHighs,
		seasonPointsLows
	] =
		sortHighAndLow(
			seasonPointsRecord,
			'fpts'
		);


	playoffRecords
		.addAllTimeMatchupDifferentials(
			matchupDifferentials
		);


	if(
		seasonPointsHighs.length
	) {

		playoffRecords
			.addSeasonWeekRecord({

				year,

				biggestBlowouts,

				closestMatchups,

				seasonPointsLows,

				seasonPointsHighs

			});

	}


	return playoffRecords;

};


/**
 * =========================
 * DIGEST BRACKET
 * =========================
 */

const digestBracket = ({
	bracket,
	playoffRecords,
	playoffRounds,
	matchupDifferentials,
	postSeasonData,
	consolation,
	seasonPointsRecord,
	playoffsStart,
	year
}) => {

	for(
		let i = 0;
		i < bracket.length;
		i++
	) {

		const startWeek =
			getStartWeek(
				i +
					(
						playoffRounds -
						bracket.length
					),
				playoffRounds,
				consolation,
				playoffsStart
			);


		const matchupWeek = [];


		for(
			let matchups
			of bracket[i]
		) {

			if(consolation) {

				matchups =
					matchups.flat();

			}


			for(
				const matchup
				of matchups
			) {

				if(!matchup.r) {
					continue;
				}


				const newMatchup =
					{
						...matchup
					};


				let points = 0;


				for(
					const k
					in newMatchup.points
				) {

					points +=
						newMatchup.points[
							k
						].reduce(
							(total, value) =>
								total + value,
							0
						);

				}


				newMatchup.points =
					points;


				matchupWeek.push(
					newMatchup
				);

			}

		}


		const {

			sPR,
			mD,
			pSD

		} =
			processMatchups({

				matchupWeek,

				seasonPointsRecord,

				record:
					playoffRecords,

				startWeek,

				matchupDifferentials,

				year

			});


		postSeasonData =
			meshPostSeasonData(
				postSeasonData,
				pSD
			);


		seasonPointsRecord =
			sPR;

		matchupDifferentials =
			mD;

	}


	return {

		postSeasonData,
		seasonPointsRecord,
		playoffRecords,
		matchupDifferentials

	};

};


/**
 * =========================
 * PROCESS MATCHUPS
 * =========================
 */

const processMatchups = ({
	matchupWeek,
	seasonPointsRecord,
	record,
	startWeek,
	matchupDifferentials,
	year
}) => {

	const matchups = {};

	const pSD = {};


	for(
		const matchup
		of matchupWeek
	) {

		const rosterID =
			matchup.roster_id;


		if(!rosterID) {
			continue;
		}


		let mID =
			matchup.matchup_id;


		/*
		 * Playoff matchup.
		 */
		if(!mID) {

			if(!pSD[rosterID]) {

				pSD[rosterID] = {

					wins: 0,
					losses: 0,
					ties: 0,

					fptsFor: 0,
					fptsAgainst: 0,

					potentialPoints: 0,
					fptspg: 0,

					pOGames: 0,
					byes: 0

				};

			}


			pSD[
				rosterID
			].pOGames = 1;


			const m =
				matchup.m;


			if(!m) {

				pSD[
					rosterID
				].byes = 1;

				continue;

			}


			mID =
				`PS:${m}`;

		}


		const entry = {

			rosterID,

			fpts:
				matchup.points,

			week:
				startWeek,

			year

		};


		if(
			!matchups[mID]
		) {

			matchups[mID] =
				[];

		}


		matchups[mID].push(
			entry
		);


		record.addLeagueWeekRecord(
			entry
		);


		seasonPointsRecord.push(
			entry
		);

	}


	/*
	 * Move to next week.
	 */
	startWeek--;


	/*
	 * Calculate matchup results.
	 */
	for(
		const matchupKey
		in matchups
	) {

		const matchup =
			matchups[
				matchupKey
			];


		let home =
			matchup[0];

		let away =
			matchup[1];


		if(
			!home ||
			!away
		) {

			continue;

		}


		if(
			home.fpts <
			away.fpts
		) {

			home =
				matchup[1];

			away =
				matchup[0];

		}


		const matchupDifferential = {

			year:
				home.year,

			week:
				home.week,

			home: {

				rosterID:
					home.rosterID,

				fpts:
					home.fpts

			},

			away: {

				rosterID:
					away.rosterID,

				fpts:
					away.fpts

			},

			differential:
				home.fpts -
				away.fpts

		};


		matchupDifferentials.push(
			matchupDifferential
		);


		/*
		 * Playoff result.
		 */
		if(
			matchupKey.split(':')[0] ===
			'PS'
		) {

			pSD[
				home.rosterID
			].wins = 1;


			pSD[
				home.rosterID
			].fptsFor =
				home.fpts;


			pSD[
				home.rosterID
			].fptsAgainst =
				away.fpts;


			pSD[
				away.rosterID
			].losses = 1;


			pSD[
				away.rosterID
			].fptsFor =
				away.fpts;


			pSD[
				away.rosterID
			].fptsAgainst =
				home.fpts;

		}

	}


	return {

		sPR:
			seasonPointsRecord,

		mD:
			matchupDifferentials,

		sW:
			startWeek,

		pSD

	};

};


/**
 * =========================
 * MERGE PLAYOFF DATA
 * =========================
 */

const meshPostSeasonData = (
	current,
	newData
) => {

	for(
		const rosterID
		in newData
	) {

		if(
			!current[rosterID]
		) {

			current[rosterID] =
				{
					...newData[
						rosterID
					]
				};

			continue;

		}


		const existing =
			current[
				rosterID
			];

		const incoming =
			newData[
				rosterID
			];


		existing.wins +=
			incoming.wins;

		existing.losses +=
			incoming.losses;

		existing.ties +=
			incoming.ties;

		existing.fptsFor +=
			incoming.fptsFor;

		existing.fptsAgainst +=
			incoming.fptsAgainst;

		existing.pOGames +=
			incoming.pOGames;

		existing.byes +=
			incoming.byes;

	}


	return current;

};


/**
 * =========================
 * START WEEK
 * =========================
 */

const getStartWeek = (
	round,
	playoffRounds,
	consolation,
	playoffsStart
) => {

	if(consolation) {

		return (
			playoffsStart +
			round
		);

	}


	return (
		playoffsStart +
		round
	);

};
