const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const path = require('path')
const dbPath = path.join(__dirname, 'cricketMatchDetails.db')

const app = express()
app.use(express.json())

let db = null

const initilizeServerAndDB = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Started')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initilizeServerAndDB()

//API : 1

app.get('/players/', async (req, res) => {
  const getPlayerQuery = `SELECT 
                            player_id AS playerId,
                            player_name AS playerName
                            FROM player_details`
  const player = await db.all(getPlayerQuery)
  res.send(player)
})

//API : 2
app.get('/players/:playerId/', async (req, res) => {
  const {playerId} = req.params
  const getPlayerBasedOnIdQuery = `SELECT
                                    player_id AS playerId,
                                    player_name AS playerName
                                    FROM
                                    player_details
                                    WHERE player_id = ${playerId};`
  const playerDetailsBasedOnId = await db.get(getPlayerBasedOnIdQuery)
  res.send(playerDetailsBasedOnId)
})

//API : 3
app.put('/players/:playerId/', async (req, res) => {
  const {playerId} = req.params
  const playerDetails = req.body
  const {playerName} = playerDetails
  const updatePlayerNameQuery = `UPDATE 
                                  player_details
                                SET
                                  player_name = '${playerName}'
                                WHERE 
                                  player_id = ${playerId}`
  await db.run(updatePlayerNameQuery)
  res.send('Player Details Updated')
})

//API : 4

app.get('/matches/:matchId/', async (req, res) => {
  const {matchId} = req.params
  const matchDetaislQuery = `SELECT
                              match_id AS matchId,
                              match,
                              year
                            FROM match_details
                            WHERE match_id = ${matchId};`
  const matchDetails = await db.get(matchDetaislQuery)
  res.send(matchDetails)
})

//API : 5
app.get('/players/:playerId/matches', async (req, res) => {
  const {playerId} = req.params
  const getPlayerMatchQuery = `SELECT
                                match_id AS matchId,
                                match,
                                year
                              FROM 
                                player_match_score NATURAL JOIN match_details
                              WHERE
                                player_id = ${playerId}`
  const playerMatchDetails = await db.all(getPlayerMatchQuery)
  res.send(playerMatchDetails)
})

//API : 6
app.get('/matches/:matchId/players', async (req, res) => {
  const {matchId} = req.params
  const getMatchPlayerQuery = `SELECT 
                                player_match_score.player_id AS playerId,
                                player_name AS playerName
                              FROM player_details INNER JOIN player_match_score ON player_details.player_id = player_match_score.player_id
                              WHERE
                                match_id = ${matchId};`
  const matchPlayers = await db.all(getMatchPlayerQuery)
  res.send(matchPlayers)
})

//API : 7
app.get('/players/:playerId/playerScores', async (req, res) => {
  const {playerId} = req.params
  const getPlayerScoreQuery = `SELECT player_details.player_id AS playerId,
                                      player_details.player_name AS playerName,
                                      SUM(player_match_score.score) AS totalScore,
                                      SUM(fours) AS totalFours,
                                      SUM(sixes) AS totalSixes
                                FROM
                                    player_details INNER JOIN player_match_score ON player_details.player_id = player_match_score.player_id
                                WHERE 
                                      player_details.player_id = ${playerId};`
  const playerScore = await db.get(getPlayerScoreQuery)
  res.send(playerScore)
})
module.exports = app
