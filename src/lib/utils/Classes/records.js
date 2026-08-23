import { sortHighAndLow } from '../helperFunctions/universalFunctions';

/**
 * Holds all data and functions necessary to compute
 * league records, both per-season and all-time.
 */
export class Records {

	constructor() {

		// All-time stats for each manager
		this.leagueManagerRecords = {};

		// Per-season stats for each roster
		this.leagueRosterRecords = {};

		// Weekly records
		this.seasonWeekRecords = [];
		this.leagueWeekRecords = [];

		// Season-long points
		this.seasonLongPoints = [];

		// Matchup differentials
		this.allTimeMatchupDifferentials = [];

		// All-time records
		this.allTimeBiggestBlowouts = [];
		this.allTimeClosestMatchups = [];
		this.leastSeasonLongPoints = [];
		this.mostSeasonLongPoints = [];
		this.leagueWeekLows = [];
		this.leagueWeekHighs = [];

		this.currentYear = null;
		this.lastYear = null;
	}
}


/**
 * Create manager record if one does not exist.
 */
Records.prototype.confirmManagerRecord = function(managerID) {

	if(!this.leagueManagerRecords[managerID]) {

		this.leagueManagerRecords[managerID] = {

			wins: 0,
			losses: 0,
			ties: 0,

			fptsFor: 0,
			fptsAgainst: 0,

			potentialPoints: 0,
			pOGames: 0,
			byes: 0,

			// Playoff information
			playoffAppearances: 0,
			championships: 0,
			finalsAppearances: 0,

		};

	}

};


/**
 * Create roster record if one does not exist.
 */
Records.prototype.confirmRosterRecord = function(rosterID) {

	if(!this.leagueRosterRecords[rosterID]) {

		this.leagueRosterRecords[rosterID] = {

			years: []

		};

	}

};


/**
 * Update manager and roster records.
 */
Records.prototype.updateManagerRecord = function(
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
		potentialPoints,
		pOGames,
		byes,
		seed,
		champion = false,
		finals = false
	}
) {

	/*
	 * =========================
	 * ALL-TIME MANAGER RECORD
	 * =========================
	 */

	for(const managerID of managers) {

		this.confirmManagerRecord(managerID);

		const record =
			this.leagueManagerRecords[managerID];


		record.wins += wins;
		record.losses += losses;
		record.ties += ties;

		record.fptsFor += fptsFor;
		record.fptsAgainst += fptsAgainst;

		record.potentialPoints += potentialPoints;
		record.pOGames += pOGames;
		record.byes += byes;


		/*
		 * Playoff appearances
		 *
		 * This is only incremented when
		 * updateManagerRecord is called for
		 * playoff data.
		 */
		if(pOGames > 0) {

			record.playoffAppearances++;

		}


		/*
		 * Championship information.
		 */
		if(champion) {

			record.championships++;

		}


		if(finals) {

			record.finalsAppearances++;

		}

	}


	/*
	 * =========================
	 * SINGLE-SEASON ROSTER DATA
	 * =========================
	 */

	this.confirmRosterRecord(rosterID);


	this.leagueRosterRecords[
		rosterID
	].years.push({

		wins,
		losses,
		ties,

		fpts: fptsFor,
		fptsAgainst,

		fptsPerGame,
		potentialPoints,

		pOGames,
		byes,

		rosterID,
		year,

		/*
		 * Playoff-specific information.
		 */
		seed:
			seed ?? null,

		champion:
			champion ?? false,

		finals:
			finals ?? false,

	});

};


/**
 * Add season-long points.
 */
Records.prototype.addSeasonLongPoints = function({
	rosterID,
	fpts,
	fptsPerGame,
	year
}) {

	this.seasonLongPoints.push({

		rosterID,
		fpts,
		fptsPerGame,
		year,

	});

};


/**
 * Add league week record.
 */
Records.prototype.addLeagueWeekRecord = function(entry) {

	this.leagueWeekRecords.push(entry);

};


/**
 * Add all-time matchup differentials.
 */
Records.prototype.addAllTimeMatchupDifferentials =
	function(matchupDifferentials) {

		this.allTimeMatchupDifferentials =
			this.allTimeMatchupDifferentials.concat(
				matchupDifferentials
			);

	};


/**
 * Add season week record.
 */
Records.prototype.addSeasonWeekRecord = function(entry) {

	this.seasonWeekRecords.push(entry);

};


/**
 * Finalize all-time records.
 */
Records.prototype.finalizeAllTimeRecords =
	function({currentYear, lastYear}) {

		const [
			allTimeBiggestBlowouts,
			allTimeClosestMatchups
		] =
			sortHighAndLow(
				this.allTimeMatchupDifferentials,
				'differential'
			);


		this.allTimeBiggestBlowouts =
			allTimeBiggestBlowouts;

		this.allTimeClosestMatchups =
			allTimeClosestMatchups;


		const [
			leagueWeekHighs,
			leagueWeekLows
		] =
			sortHighAndLow(
				this.leagueWeekRecords,
				'fpts'
			);


		this.leagueWeekHighs =
			leagueWeekHighs;

		this.leagueWeekLows =
			leagueWeekLows;


		const [
			mostSeasonLongPoints,
			leastSeasonLongPoints
		] =
			sortHighAndLow(
				this.seasonLongPoints,
				'fptsPerGame'
			);


		this.mostSeasonLongPoints =
			mostSeasonLongPoints;

		this.leastSeasonLongPoints =
			leastSeasonLongPoints;


		this.currentYear =
			currentYear;

		this.lastYear =
			lastYear;

	};


/**
 * Return records data.
 */
Records.prototype.returnRecords = function() {

	return {

		allTimeBiggestBlowouts:
			this.allTimeBiggestBlowouts,

		allTimeClosestMatchups:
			this.allTimeClosestMatchups,

		leastSeasonLongPoints:
			this.leastSeasonLongPoints,

		mostSeasonLongPoints:
			this.mostSeasonLongPoints,

		leagueWeekLows:
			this.leagueWeekLows,

		leagueWeekHighs:
			this.leagueWeekHighs,

		seasonWeekRecords:
			this.seasonWeekRecords,

		leagueManagerRecords:
			this.leagueManagerRecords,

		leagueRosterRecords:
			this.leagueRosterRecords,

		currentYear:
			this.currentYear,

		lastYear:
			this.lastYear,

	};

};
