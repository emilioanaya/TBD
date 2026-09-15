<script>
	import Button, { Group, Label } from '@smui/button';
	import LinearProgress from '@smui/linear-progress';
	import { loadPlayers, getLeagueTransactions } from '$lib/utils/helper';
	import Roster from '../Rosters/Roster.svelte';
	import TransactionsPage from '../Transactions/TransactionsPage.svelte';
	import { goto } from '$app/navigation';
	import ManagerFantasyInfo from './ManagerFantasyInfo.svelte';
	import ManagerAwards from './ManagerAwards.svelte';
	import { onMount } from 'svelte';
	import {
		getDatesActive,
		getRosterIDFromManagerID,
		getTeamNameFromTeamManagers
	} from '$lib/utils/helperFunctions/universalFunctions';
	import { getLeagueRecords, leagueName } from '$lib/utils/helper';

	export let manager, managers, rostersData, leagueTeamManagers, rosterPositions, transactionsData, awards, records;

	let transactions = transactionsData.transactions;

	$: viewManager = managers[manager];

	$: datesActive = getDatesActive(
		leagueTeamManagers,
		viewManager.managerID
	);

	const startersAndReserve = rostersData.startersAndReserve;

	let rosters = rostersData.rosters;

	$: ({ rosterID, year } = viewManager.managerID
		? getRosterIDFromManagerID(
				leagueTeamManagers,
				viewManager.managerID
			)
		: {
				rosterID: viewManager.roster,
				year: null
			});

	$: teamTransactions = transactions.filter(
		t => t.rosters.includes(parseInt(rosterID))
	);

	$: roster = rosters[rosterID];

	$: coOwners =
		year && rosterID
			? leagueTeamManagers.teamManagersMap[year][rosterID].managers.length > 1
			: roster.co_owners;

	$: commissioner = viewManager.managerID
		? leagueTeamManagers.users[viewManager.managerID].is_owner
		: false;


	/* =========================
	   BIG BOWL CHAMPIONSHIPS
	   ========================= */

	function getChampionshipCount(rosterID) {
		if (!awards || !rosterID) return 0;

		return awards.filter(
			award =>
				String(award.champion) === String(rosterID)
		).length;
	}


	let players, playersInfo;
	let loading = true;


	const refreshTransactions = async () => {
		const newTransactions =
			await getLeagueTransactions(false, true);

		transactions = newTransactions.transactions;
	};


	onMount(async () => {

		if (transactionsData.stale) {
			refreshTransactions();
		}

		const playerData = await loadPlayers(null);

		playersInfo = playerData;

		players = playerData.players;

		loading = false;


		if (playerData.stale) {

			const newPlayerData =
				await loadPlayers(null, true);

			playersInfo = newPlayerData;

			players = newPlayerData.players;
		}
	});


	/* =========================
	   ALL-TIME + SEASON RECORDS
	   ========================= */

	let currentRecords = records;


	/*
	 * Automatically get this manager's
	 * all-time regular-season record.
	 *
	 * This comes from the historical Sleeper
	 * record data instead of leagueInfo.js.
	 */

	$: managerRecord =
		currentRecords?.regularSeasonData?.leagueManagerRecords?.[
			viewManager?.managerID
		];


	/*
	 * Automatically build this manager's
	 * season-by-season records.
	 */

	$: seasonRecords = getManagerSeasonRecords(
		viewManager?.managerID,
		currentRecords,
		leagueTeamManagers
	);


	function getManagerSeasonRecords(managerID, recordsData, teamManagers) {

		if (
			!managerID ||
			!recordsData?.regularSeasonData ||
			!teamManagers?.teamManagersMap
		) {
			return [];
		}


		const rosterRecords =
			recordsData.regularSeasonData.leagueRosterRecords || {};


		const seasons = [];


		for (const rosterID in rosterRecords) {

			const years =
				rosterRecords[rosterID]?.years || [];


			for (const season of years) {

				const yearManagers =
					teamManagers.teamManagersMap[season.year];


				const rosterManagers =
					yearManagers?.[rosterID]?.managers || [];


				if (
					!rosterManagers
						.map(String)
						.includes(String(managerID))
				) {
					continue;
				}


				seasons.push({

					...season,

					league: leagueName,

					team:
						yearManagers?.[rosterID]?.team?.name ||
						'TBD'

				});

			}

		}


		return seasons.sort(
			(a, b) => b.year - a.year
		);

	}


	/*
	 * Calculate the manager's finish for a
	 * particular season using the same
	 * tiebreaker order as TBD standings.
	 */

	function getSeasonFinish(season) {

		if (
			!season?.year ||
			!currentRecords?.regularSeasonData
		) {
			return null;
		}


		const allRosters = [];


		const rosterRecords =
			currentRecords
				.regularSeasonData
				.leagueRosterRecords || {};


		for (const rosterID in rosterRecords) {

			const record =
				rosterRecords[rosterID]?.years?.find(
					y =>
						Number(y.year) ===
						Number(season.year)
				);


			if (record) {
				allRosters.push(record);
			}

		}


		/*
		 * TBD standings tiebreakers:
		 *
		 * 1. Wins
		 * 2. Ties
		 * 3. FPTS
		 * 4. FPTS Against
		 */

		allRosters.sort((a, b) => {

			if (b.wins !== a.wins) {
				return b.wins - a.wins;
			}

			if (b.ties !== a.ties) {
				return b.ties - a.ties;
			}

			if (b.fpts !== a.fpts) {
				return b.fpts - a.fpts;
			}

			return b.fptsAgainst - a.fptsAgainst;

		});


		const index =
			allRosters.findIndex(
				r =>
					String(r.rosterID) ===
						String(season.rosterID) &&
					Number(r.year) ===
						Number(season.year)
			);


		return index > -1
			? index + 1
			: null;

	}


	/*
	 * If the cached record data is stale,
	 * automatically refresh it from Sleeper.
	 */

	$: if (records?.stale) {

		getLeagueRecords(true)
			.then((newRecords) => {

				currentRecords = newRecords;

			});

	}


	const changeManager = (
		newManager,
		noscroll = false
	) => {

		if (!newManager) {
			goto('/managers');
		}

		manager = newManager;

		goto(
			`/manager?manager=${newManager}`,
			{ noscroll }
		);

	};

</script>


<style>

	.managerContainer {
		position: relative;

		width: 100%;

		margin: 2em 0 5em;
	}


	.managerConstrained {
		width: 97%;

		max-width: 800px;

		margin: 0 auto 4em;
	}


	.managerPhoto {
		display: block;

		border-radius: 100%;

		width: 70%;

		max-width: 200px;

		height: auto;

		margin: 5em auto 1em;

		box-shadow: 0 0 8px 4px #aaa;
	}


	h2 {
		text-align: center;

		font-size: 2.8em;

		margin: 1em 0 0em;

		line-height: 1em;
	}


	h3 {
		text-align: center;

		font-size: 1.5em;

		margin: 1.5em 0 0.5em;

		font-weight: 200;
	}


	.basicInfo {
		display: flex;

		justify-content: space-evenly;

		align-items: center;

		height: 24px;

		margin: 2em 0;
	}


	.basicInfo span {
		color: #888;

		font-size: 0.9em;
	}


	.infoChild {
		font-style: italic;
	}


	.infoContact {
		height: 20px;

		vertical-align: middle;

		padding-left: 1em;
	}


	.infoTeam {
		height: 48px;
	}


	/* Big Bowl championship count */

	.championshipInfo {
		font-style: normal !important;

		font-weight: 500;

		white-space: nowrap;
	}


	.bio {
		margin: 2em 1.5em 2em;

		text-indent: 4em;
	}


	.philosophy {
		margin: 2em 1.5em 2em;

		text-indent: 4em;
	}


	.philosophy23 {
		margin: 2em 1.5em 2em;

		text-indent: 4em;
	}


	.philosophy24 {
		margin: 2em 1.5em 2em;

		text-indent: 4em;
	}


	.philosophy25 {
		margin: 2em 1.5em 2em;

		text-indent: 4em;
	}


	.philosophy26 {
		margin: 2em 1.5em 2em;

		text-indent: 4em;
	}


	/* =========================
	   ALL-TIME RECORD
	   ========================= */

	.allTimeRecord {
		display: flex;

		justify-content: center;

		align-items: center;

		gap: 0.5em;

		margin: 2em 0 1em;

		font-size: 1.1em;
	}


	.recordLabel {
		color: #888;

		font-style: italic;
	}


	/* =========================
	   SEASON HISTORY
	   ========================= */

	.seasonHistory {
		width: 100%;

		margin: 1em 0 3em;
	}


	.seasonHeader,
	.seasonRow {
		display: grid;

		grid-template-columns:
			1fr
			1.5fr
			1fr
			1fr;

		gap: 0.75em;

		align-items: center;

		padding: 0.75em 0.5em;

		text-align: center;
	}


	.seasonHeader {
		font-weight: 600;

		border-bottom:
			1px solid #aaa;
	}


	.seasonRow {
		border-bottom:
			1px solid #ddd;
	}


	.loading {
		display: block;

		width: 85%;

		max-width: 500px;

		margin: 80px auto;
	}


	.teamSub {
		font-size: 0.4em;

		line-height: 1em;

		color: #666;
	}


	.managerNav {
		margin: 4em 0 2em;

		text-align: center;
	}


	.upper {
		margin-top: 0;
	}


	.commissionerBadge {
		display: flex;

		justify-content: center;

		align-items: center;

		height: 25px;

		width: 25px;

		font-weight: 600;

		border-radius: 15px;

		background-color: var(--blueTwo);

		border: 1px solid var(--blueOne);
	}


	.commissionerBadge span {
		font-style: normal;

		color: #fff;
	}


	/* media queries */

	@media (max-width: 505px) {

		:global(.selectionButtons span) {
			font-size: 0.8em;
		}
	}


	@media (max-width: 435px) {

		:global(.selectionButtons span) {

			line-height: 1.2em;

			font-size: 0.8em;

		}

	}


	@media (max-width: 450px) {

		.basicInfo {

			height: 20px;

		}


		.basicInfo span {

			font-size: 0.75em;

		}


		.infoTeam {

			height: 30px;

		}

	}


	@media (max-width: 370px) {

		.basicInfo {

			height: 18px;

		}


		.basicInfo span {

			font-size: 0.6em;

		}


		.infoTeam {

			height: 24px;

		}

	}

</style>


<div class="managerContainer">

	<div class="managerConstrained">

		<img
			class="managerPhoto"
			src="{viewManager.photo}"
			alt="manager"
		/>


		<h2>

			{viewManager.name}

			<div class="teamSub">

				{coOwners ? 'Co-' : ''}Manager of

				<i>

					{getTeamNameFromTeamManagers(
						leagueTeamManagers,
						rosterID,
						year
					)}

				</i>

			</div>

		</h2>


		<div class="basicInfo">

			<!-- LOCATION -->

			<span class="infoChild">

				{viewManager.location ||
					'Undisclosed Location'}

			</span>


			<!-- LEAGUE HISTORY -->

			{#if viewManager.managerID && datesActive.start}

				<span class="seperator">|</span>

				{#if datesActive.end}

					<span class="infoChild">

						In the league from
						'{datesActive.start
							.toString()
							.substr(2)}

						to
						'{datesActive.end
							.toString()
							.substr(2)}

					</span>

				{:else}

					<span class="infoChild">

						In the league since
						'{datesActive.start
							.toString()
							.substr(2)}

					</span>

				{/if}

			{:else if viewManager.fantasyStart}

				<span class="seperator">|</span>

				<span class="infoChild">

					Playing ff since
					'{viewManager.fantasyStart
						.toString()
						.substr(2)}

				</span>

			{/if}


			<!-- =========================
			     BIG BOWL CHAMPIONSHIPS
			     ========================= -->

			<span class="seperator">|</span>

			<span class="infoChild championshipInfo">

				🏆 {getChampionshipCount(rosterID)}× Champion

			</span>


			<!-- =========================
			     FAVORITE NFL TEAM
			     ========================= -->

			{#if viewManager.favoriteTeam}

				<span class="seperator">|</span>

				<img
					class="infoChild infoTeam"
					src="https://sleepercdn.com/images/team_logos/nfl/{viewManager.favoriteTeam}.png"
					alt="favorite team"
				/>

			{/if}


			<!-- COMMISSIONER -->

			{#if commissioner}

				<span class="seperator">|</span>

				<div class="infoChild commissionerBadge">

					<span>C</span>

				</div>

			{/if}

		</div>


		<!-- =========================
		     MANAGER NAVIGATION
		     ========================= -->

		<div class="managerNav upper">

			<Group variant="outlined">

				{#if manager == 0}

					<Button
						disabled
						class="selectionButtons"
						onclick={() =>
							changeManager(
								parseInt(manager) - 1,
								true
							)}
						variant="outlined"
					>

						<Label>
							Previous Manager
						</Label>

					</Button>

				{:else}

					<Button
						class="selectionButtons"
						onclick={() =>
							changeManager(
								parseInt(manager) - 1,
								true
							)}
						variant="outlined"
					>

						<Label>
							Previous Manager
						</Label>

					</Button>

				{/if}


				<Button
					class="selectionButtons"
					onclick={() => goto('/managers')}
					variant="outlined"
				>

					<Label>
						All Managers
					</Label>

				</Button>


				{#if manager == managers.length - 1}

					<Button
						disabled
						class="selectionButtons"
						onclick={() =>
							changeManager(
								parseInt(manager) + 1,
								true
							)}
						variant="outlined"
					>

						<Label>
							Next Manager
						</Label>

					</Button>

				{:else}

					<Button
						class="selectionButtons"
						onclick={() =>
							changeManager(
								parseInt(manager) + 1,
								true
							)}
						variant="outlined"
					>

						<Label>
							Next Manager
						</Label>

					</Button>

				{/if}

			</Group>

		</div>


		<!-- BIO -->

		<p class="bio">

			{@html viewManager.bio}

		</p>


		<!-- =========================
		     ALL-TIME RECORD
		     ========================= -->

		{#if managerRecord}

			<div class="allTimeRecord">

				<span class="recordLabel">
					All-Time Record
				</span>

				<strong>

					{managerRecord.wins}-{managerRecord.losses}-{managerRecord.ties}

				</strong>

			</div>

		{/if}


		<!-- =========================
		     SEASON-BY-SEASON RECORD
		     ========================= -->

		{#if seasonRecords.length}

			<h3>
				Season-by-Season Record
			</h3>


			<div class="seasonHistory">

				<div class="seasonHeader">

					<span>Season</span>

					<span>League</span>

					<span>Record</span>

					<span>Finish</span>

				</div>


				{#each seasonRecords as season}

					<div class="seasonRow">

						<span>
							{season.year}
						</span>

						<span>
							{season.league}
						</span>

						<span>
							{season.wins}-{season.losses}-{season.ties}
						</span>

						<span>

							{#if getSeasonFinish(season)}

								{getSeasonFinish(season)}

								{getSeasonFinish(season) === 1
									? 'st'
									: getSeasonFinish(season) === 2
										? 'nd'
										: getSeasonFinish(season) === 3
											? 'rd'
											: 'th'}

							{:else}

								—

							{/if}

						</span>

					</div>

				{/each}

			</div>

		{/if}

	</div>


	<!-- FAVORITE PLAYER -->

	{#if !loading}

		<ManagerFantasyInfo
			{viewManager}
			{players}
			{changeManager}
		/>

	{/if}


	<!-- MANAGER AWARDS -->

	<ManagerAwards
		{leagueTeamManagers}
		tookOver={viewManager.tookOver}
		{awards}
		{records}
		{rosterID}
		managerID={viewManager.managerID}
	/>


	<!-- ROSTER -->

	{#if loading}

		<div class="loading">

			<p>
				Retrieving players...
			</p>

			<LinearProgress indeterminate />

		</div>

	{:else}

		<Roster
			division="1"
			expanded={false}
			{rosterPositions}
			{roster}
			{leagueTeamManagers}
			{players}
			{startersAndReserve}
		/>

	{/if}


	<!-- TEAM TRANSACTIONS -->

	<h3>
		Team Transactions
	</h3>


	<div class="managerConstrained">

		{#if loading}

			<div class="loading">

				<p>
					Retrieving players...
				</p>

				<LinearProgress indeterminate />

			</div>

		{:else}

			<TransactionsPage
				{playersInfo}
				transactions={teamTransactions}
				{leagueTeamManagers}
				show="both"
				query=""
				page={0}
				perPage={5}
			/>

		{/if}

	</div>


	<!-- BOTTOM MANAGER NAVIGATION -->

	<div class="managerNav">

		<Group variant="outlined">

			{#if manager == 0}

				<Button
					disabled
					class="selectionButtons"
					onclick={() =>
						changeManager(
							parseInt(manager) - 1
						)}
					variant="outlined"
				>

					<Label>
						Previous Manager
					</Label>

				</Button>

			{:else}

				<Button
					class="selectionButtons"
					onclick={() =>
						changeManager(
							parseInt(manager) - 1
						)}
					variant="outlined"
				>

					<Label>
						Previous Manager
					</Label>

				</Button>

			{/if}


			<Button
				class="selectionButtons"
				onclick={() => goto('/managers')}
				variant="outlined"
			>

				<Label>
					All Managers
				</Label>

			</Button>


			{#if manager == managers.length - 1}

				<Button
					disabled
					class="selectionButtons"
					onclick={() =>
						changeManager(
							parseInt(manager) + 1
						)}
					variant="outlined"
				>

					<Label>
						Next Manager
					</Label>

				</Button>

			{:else}

				<Button
					class="selectionButtons"
					onclick={() =>
						changeManager(
							parseInt(manager) + 1
						)}
					variant="outlined"
				>

					<Label>
						Next Manager
					</Label>

				</Button>

			{/if}

		</Group>

	</div>

</div>