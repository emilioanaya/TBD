while(curSeason && curSeason != 0) {
    const [rosterRes, leagueData] = await waitForAll(
        getLeagueRosters(curSeason),
        getLeagueData(curSeason),
    );

    // ...

    const pS = await processPlayoffs({
        year,
        curSeason,
        week,
        playoffRecords,
        rosters
    });

    if(pS) {
        playoffRecords = pS;
    }

    // ...

    curSeason = season;
}
