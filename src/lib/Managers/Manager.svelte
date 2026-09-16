<script>
	import Button, { Group, Label } from '@smui/button';
	import LinearProgress from '@smui/linear-progress';
	import {
		loadPlayers,
		getLeagueTransactions
	} from '$lib/utils/helper';
	import Roster from '../Rosters/Roster.svelte';
	import TransactionsPage from '../Transactions/TransactionsPage.svelte';
	import { goto } from '$app/navigation';
	import ManagerFantasyInfo from './ManagerFantasyInfo.svelte';
	import ManagerAwards from './ManagerAwards.svelte';
	import { onMount } from 'svelte';
	import {
		getRosterIDFromManagerID,
		getTeamNameFromTeamManagers
	} from '$lib/utils/helperFunctions/universalFunctions';

	export let manager, managers, rostersData, leagueTeamManagers, rosterPositions, transactionsData, awards, records;

	$: viewManager = managers[manager];

	let transactions = transactionsData.transactions;

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
			: roster?.co_owners;

	$: commissioner = viewManager.managerID
		? leagueTeamManagers.users[viewManager.managerID].is_owner
		: false;


	/* =========================
	   MANUAL SEASON RECORDS
	   ========================= */

	/*
	 * Season records are manually entered in leagueInfo.js.
	 *
	 * Example:
	 *
	 * seasonRecords: [
	 *     {
	 *         year: 2023,
	 *         record: '6-8',
	 *         finish: '1st',
	 *         champion: true
	 *     }
	 * ]
	 */

	$: seasonRecords = viewManager?.seasonRecords || [];

	$: allTimeRecord = seasonRecords.reduce(
		(total, season) => {
			if (!season?.record) return total;

			const match = String(season.record).match(
				/^(\d+)\s*-\s*(\d+)(?:\s*-\s*(\d+))?$/
			);

			if (!match) return total;

			total.wins += Number(match[1]);
			total.losses += Number(match[2]);
			total.ties += Number(match[3] || 0);

			return total;
		},
		{
			wins: 0,
			losses: 0,
			ties: 0
		}
	);

	$: hasTies = seasonRecords.some(season => {
		const match = String(season?.record || '').match(
			/^(\d+)\s*-\s*(\d+)(?:\s*-\s*(\d+))?$/
		);

		return match && Number(match[3] || 0) > 0;
	});


	/* =========================
	   BIG BOWL CHAMPIONSHIPS
	   ========================= */

	function getChampionshipCount() {
		return seasonRecords.filter(
			season => season?.champion === true
		).length;
	}


	/* =========================
	   TRANSACTIONS / PLAYERS
	   ========================= */

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
	   MANAGER NAVIGATION
	   ========================= */

	const changeManager = (
		newManager,
		noscroll = false
	) => {
		if (!newManager) {
			goto('/managers');
			return;
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


	/* =========================
	   ALL-TIME RECORD
	   ========================= */

	.allTimeRecord {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0.5em;
		margin: 2em 0 2.5em;
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
		width: 92%;
		max-width: 650px;
		margin: 2em auto 3em;
	}


	.seasonHistoryTitle {
		margin-bottom: 1em;
	}


	.seasonTable {
		width: 100%;
		border-collapse: collapse;
		text-align: center;
	}


	.seasonTable th {
		padding: 0.7em 0.4em;
		font-weight: 600;
		border-bottom: 1px solid rgba(128, 128, 128, 0.4);
	}


	.seasonTable td {
		padding: 0.7em 0.4em;
		border-bottom: 1px solid rgba(128, 128, 128, 0.18);
	}


	.seasonTable tbody tr:last-child td {
		border-bottom: none;
	}


	.seasonTable .championRow {
		background-color: rgba(76, 175, 80, 0.22);
		font-weight: 500;
	}


	.championBadge {
		white-space: nowrap;
	}


	/* Existing philosophy styles */

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

		.seasonHistory {
			width: 96%;
		}

		.seasonTable th,
		.seasonTable td {
			padding: 0.6em 0.2em;
			font-size: 0.9em;
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

		.seasonTable th,
		.seasonTable td {
			font-size: 0.8em;
		}
	}

</style>


<div class="managerContainer">

	<div class="managerConstrained">

		<img
			class="managerPhoto"
			src={viewManager.photo}
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


			<!-- CHAMPIONSHIPS -->

			<span class="seperator">|</span>

			<span class="infoChild championshipInfo">

				🏆 {getChampionshipCount()}× Champion

			</span>


			<!-- FAVORITE NFL TEAM -->

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

		<div class="allTimeRecord">

			<span class="recordLabel">
				All-Time Record
			</span>

			<strong>

				{allTimeRecord.wins}
				-
				{allTimeRecord.losses}

				{#if hasTies}
					-
					{allTimeRecord.ties}
				{/if}

			</strong>

		</div>


		<!-- =========================
		     SEASON-BY-SEASON RECORD
		     ========================= -->

		{#if seasonRecords.length > 0}

			<div class="seasonHistory">

				<h3 class="seasonHistoryTitle">
					Season-by-Season Record
				</h3>


				<table class="seasonTable">

					<thead>

						<tr>
							<th>Season</th>
							<th>Record</th>
							<th>Finish</th>
						</tr>

					</thead>


					<tbody>

						{#each seasonRecords as season}

							<tr
								class:championRow={
									season.champion === true
								}
							>

								<td>
									{season.year}
								</td>

								<td>
									{season.record}
								</td>

								<td>

									{#if season.champion}

										<span class="championBadge">
											🏆 {season.finish}
										</span>

									{:else}

										{season.finish}

									{/if}

								</td>

							</tr>

						{/each}

					</tbody>

				</table>

			</div>

		{/if}


		<!-- TEAM HISTORY -->

		{#if viewManager.philosophy}

			<h3>
				Team History
			</h3>

			<p class="philosophy">
				{@html viewManager.philosophy}
			</p>

			<p class="philosophy23">
				{@html viewManager.philosophy23}
			</p>

			<p class="philosophy24">
				{@html viewManager.philosophy24}
			</p>

			<p class="philosophy25">
				{@html viewManager.philosophy25}
			</p>

			<p class="philosophy26">
				{@html viewManager.philosophy26}
			</p>

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